<?php

namespace Frontastic\Catwalk\NextJsBundle\Controller;

use Frontastic\Catwalk\ApiCoreBundle\Domain\Context;
use Frontastic\Catwalk\FrontendBundle\Domain\NodeService;
use Frontastic\Catwalk\FrontendBundle\Domain\PageService;
use Frontastic\Catwalk\FrontendBundle\Domain\PreviewService;
use Frontastic\Catwalk\FrontendBundle\Domain\ViewDataProvider;
use Frontastic\Catwalk\NextJsBundle\Domain\Api\DynamicPageRedirectResult;
use Frontastic\Catwalk\NextJsBundle\Domain\Api\DynamicPageSuccessResult;
use Frontastic\Catwalk\NextJsBundle\Domain\DynamicPageService;
use Frontastic\Catwalk\NextJsBundle\Domain\FromFrontasticReactMapper;
use Frontastic\Catwalk\NextJsBundle\Domain\PageDataCompletionService;
use Frontastic\Catwalk\NextJsBundle\Domain\SiteBuilderPageService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PageController
{
    private SiteBuilderPageService $siteBuilderPageService;
    private FromFrontasticReactMapper $mapper;
    private NodeService $nodeService;
    private PageService $pageService;
    private PreviewService $previewService;
    private PageDataCompletionService $completionService;
    private ViewDataProvider $viewDataProvider;
    private DynamicPageService $dynamicPageService;

    public function __construct(
        SiteBuilderPageService $siteBuilderPageService,
        DynamicPageService $dynamicPageService,
        FromFrontasticReactMapper $mapper,
        NodeService $nodeService,
        PageService $pageService,
        PreviewService $previewService,
        PageDataCompletionService $completionService,
        ViewDataProvider $viewDataProvider
    ) {
        $this->siteBuilderPageService = $siteBuilderPageService;
        $this->dynamicPageService = $dynamicPageService;
        $this->nodeService = $nodeService;
        $this->pageService = $pageService;
        $this->previewService = $previewService;
        $this->completionService = $completionService;
        $this->mapper = $mapper;
        $this->viewDataProvider = $viewDataProvider;
    }

    public function indexAction(Request $request, Context $context)
    {
        if (!$request->query->has('path')) {
            throw new BadRequestHttpException('Missing path');
        }
        $path = $request->query->get('path');
        if (!$request->query->has('locale')) {
            throw new BadRequestHttpException('Missing locale');
        }
        $locale = $request->query->get('locale');

        $this->assertLocaleSupported($locale, $context);

        $node = null;

        $nodeId = $this->siteBuilderPageService->matchSiteBuilderPage($path, $locale);

        if ($nodeId !== null) {
            $node = $this->nodeService->get($nodeId);
        }

        if ($node === null) {
            $dynamicPageResult = $this->dynamicPageService->handleDynamicPage($request, $context);
            if ($dynamicPageResult instanceof DynamicPageRedirectResult) {
                return $this->dynamicPageService->createRedirectResponse($dynamicPageResult);
            }
            if ($dynamicPageResult instanceof DynamicPageSuccessResult) {
                $node = $this->dynamicPageService->matchNodeFor($dynamicPageResult);
            }
        }

        if ($node === null) {
            throw new NotFoundHttpException('Could not resolve page from path');
        }

        $this->completionService->completeNodeData($node, $context);

        $page = $this->pageService->fetchForNode($node, $context);

        $pageViewData = $this->viewDataProvider->fetchDataFor($node, $context, [], $page);

        $this->completionService->completePageData($page, $node, $context, $pageViewData->tastic);

        return [
            'pageFolder' => $this->mapper->map($node),
            'page' => $this->mapper->map($page),
            // Stream parameters is deprecated
            'data' => $this->mapper->map($pageViewData),
        ];
    }

    public function previewAction(Request $request, Context $context)
    {
        if (!$request->query->has('previewId')) {
            throw new BadRequestHttpException('Missing previewId');
        }
        if (!$request->query->has('locale')) {
            throw new BadRequestHttpException('Missing locale');
        }

        $this->assertLocaleSupported($request->query->has('locale'), $context);

        $preview = $this->previewService->get($request->query->get('previewId'));

        $pageViewData = new \stdClass();
        if ($preview->node) {
            $pageViewData = $this->viewDataProvider->fetchDataFor($preview->node, $context, [], $preview->page);
        }

        $this->completionService->completePageData($preview->page, $preview->node, $context, $pageViewData->tastic);

        return [
            'previewId' => $request->query->get('previewId'),
            'pageFolder' => $this->mapper->map($preview->node),
            'page' => $this->mapper->map($preview->page),
            // Stream parameters is deprecated
            'data' => $this->mapper->map($pageViewData),
        ];
    }

    /**
     * @param $locale
     * @param Context $context
     * @return void
     */
    private function assertLocaleSupported($locale, Context $context): void
    {
        if (!in_array($locale, $context->project->languages)) {
            throw new BadRequestHttpException('Locale not supported by project');
        }
    }
}
