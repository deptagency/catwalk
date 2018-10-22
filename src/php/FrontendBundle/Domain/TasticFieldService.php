<?php

namespace Frontastic\Catwalk\FrontendBundle\Domain;

use Frontastic\Catwalk\ApiCoreBundle\Domain\TasticService;
use Frontastic\Common\DevelopmentBundle\Debugger;

class TasticFieldService
{
    /**
     * @var TasticService
     */
    private $tasticDefinitionService;

    /**
     * @var TasticFieldHandler[]
     */
    private $fieldHandlers = [];

    /**
     * @var \Frontastic\Catwalk\ApiCoreBundle\Domain\Tastic[string]|null
     */
    private $tasticDefinionMapCache;

    public function __construct(TasticService $tasticDefinitionService, array $fieldHandlers = [])
    {
        $this->tasticDefinitionService = $tasticDefinitionService;
        foreach ($fieldHandlers as $fieldHandler) {
            $this->addFieldHandler($fieldHandler);
        }
    }

    /**
     * @todo Should we allow multiple field handlers to work as a filter chain?
     */
    private function addFieldHandler(TasticFieldHandler $fieldHandler)
    {
        if (isset($this->fieldHandlers[$fieldHandler->getType()])) {
            throw new \LogicException('Duplicate field handler: "'. $fieldHandler->getType() . '"');
        }
        $this->fieldHandlers[$fieldHandler->getType()] = $fieldHandler;
    }

    public function getFieldData(Page $page): array
    {
        $tasticDefinitionMap = $this->getTasticDefinitionMap();

        $fieldData = [];

        foreach ($page->regions as $region) {
            /** @var Cell $element */
            foreach ($region->elements as $element) {
                foreach ($element->tastics as $tastic) {
                    if (!isset($tasticDefinitionMap[$tastic->tasticType])) {
                        continue;
                    }

                    /** @var \Frontastic\Catwalk\ApiCoreBundle\Domain\Tastic $definition */
                    $definition = $tasticDefinitionMap[$tastic->tasticType];
                    foreach ($definition->configurationSchema['schema'] as $fieldSet) {
                        foreach ($fieldSet['fields'] as $fieldDefinition) {
                            $fieldData = $this->setHandledFieldData(
                                $fieldData,
                                $tastic,
                                $fieldDefinition
                            );
                        }
                    }
                }
            }
        }

        return $fieldData;
    }

    private function setHandledFieldData(array $fieldData, Tastic $tastic, array $fieldDefinition): array
    {
        if (!isset($this->fieldHandlers[$fieldDefinition['type']])) {
            return $fieldData;
        }

        $field = $fieldDefinition['field'];
        $type = $fieldDefinition['type'];

        if (!isset($fieldData[$tastic->tasticId])) {
            $fieldData[$tastic->tasticId] = [];
        }

        $fieldData[$tastic->tasticId][$field] = $this->fieldHandlers[$type]->handle(
            ($tastic->configuration->$field !== null
                ? $tastic->configuration->$field
                : $fieldDefinition['default']
            )
        );

        return $fieldData;
    }

    /**
     * @return \Frontastic\Catwalk\ApiCoreBundle\Domain\Tastic[]
     */
    private function getTasticDefinitionMap(): array
    {
        if ($this->tasticDefinionMapCache === null) {
            $this->tasticDefinionMapCache = $this->tasticDefinitionService->getTasticsMappedByType();
        }
        return $this->tasticDefinionMapCache;
    }
}
