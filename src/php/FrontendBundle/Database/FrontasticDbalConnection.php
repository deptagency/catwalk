<?php

namespace Frontastic\Catwalk\FrontendBundle\Database;

use Doctrine\DBAL\Cache\QueryCacheProfile;

class FrontasticDbalConnection extends \Doctrine\DBAL\Connection
{
    /** {@inheritDoc} */
    public function prepare($sql)
    {
        $sql = $this->appendLoggingInformation($sql);
        return parent::prepare($sql);
    }

    /** {@inheritDoc} */
    public function executeQuery($sql, array $params = [], $types = [], ?QueryCacheProfile $qcp = null)
    {
        $sql = $this->appendLoggingInformation($sql);
        return parent::executeQuery($sql, $params, $types, $qcp);
    }

    /** {@inheritDoc} */
    public function executeStatement($sql, array $params = [], array $types = [])
    {
        $sql = $this->appendLoggingInformation($sql);
        return parent::executeStatement($sql, $params, $types);
    }

    private function appendLoggingInformation(string $sql): string
    {
        $info = ' --';
        if (class_exists(\Tideways\Profiler::class) && $traceId = \Tideways\Profiler::currentTraceId()) {
            $info .= ' tidewaysTraceId: ' . $traceId;
        }
        return $sql . ' -- RequestId + SessionId + Tideways.php :) ';
    }
}
