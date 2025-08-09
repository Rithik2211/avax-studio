const express = require('express');
const router = express.Router();
const axios = require('axios');
const avalancheService = require('../services/avalancheService');
const databaseService = require('../services/databaseService');

/**
 * GET /monitor/:subnetId - Get subnet monitoring data
 */
router.get('/:subnetId', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const { userId } = req.query;

    // Get subnet configuration from database
    let subnetConfig = null;
    try {
      subnetConfig = await databaseService.getSubnetConfig(subnetId);
    } catch (error) {
      console.warn('Failed to get subnet config from database:', error);
    }

    // Get monitoring metrics from database
    let metrics = null;
    try {
      metrics = await databaseService.getLatestMetrics(subnetId);
    } catch (error) {
      console.warn('Failed to get metrics from database:', error);
    }

    // Get validators from database
    let validators = [];
    try {
      validators = await databaseService.getValidators(subnetId);
    } catch (error) {
      console.warn('Failed to get validators from database:', error);
    }

    // Get real-time metrics from RPC if available
    let realtimeMetrics = null;
    if (subnetConfig && subnetConfig.rpc_endpoint) {
      try {
        const rpcMetrics = await avalancheService.getSubnetMetrics(subnetConfig.rpc_endpoint);
        realtimeMetrics = rpcMetrics.metrics;
      } catch (error) {
        console.warn('Failed to get real-time metrics:', error);
      }
    }

    // Combine metrics
    const combinedMetrics = {
      ...metrics,
      ...realtimeMetrics,
      validators,
      subnetConfig: subnetConfig ? {
        id: subnetConfig.id,
        name: subnetConfig.name,
        vmType: subnetConfig.vm_type,
        network: subnetConfig.network,
        status: subnetConfig.status,
        rpcEndpoint: subnetConfig.rpc_endpoint
      } : null
    };

    res.json({
      success: true,
      metrics: combinedMetrics
    });

  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    res.status(500).json({
      error: 'Failed to fetch monitoring data',
      message: error.message
    });
  }
});

/**
 * GET /monitor/:subnetId/history - Get historical monitoring data
 */
router.get('/:subnetId/history', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const { limit = 100, hours = 24 } = req.query;

    const metrics = await databaseService.getMonitoringMetrics(subnetId, parseInt(limit));

    // Filter by time range if specified
    let filteredMetrics = metrics;
    if (hours) {
      const cutoffTime = new Date(Date.now() - (parseInt(hours) * 60 * 60 * 1000));
      filteredMetrics = metrics.filter(metric => 
        new Date(metric.recorded_at) >= cutoffTime
      );
    }

    res.json({
      success: true,
      metrics: filteredMetrics,
      count: filteredMetrics.length
    });

  } catch (error) {
    console.error('Error fetching monitoring history:', error);
    res.status(500).json({
      error: 'Failed to fetch monitoring history',
      message: error.message
    });
  }
});

/**
 * POST /monitor/:subnetId/metrics - Store monitoring metrics
 */
router.post('/:subnetId/metrics', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const { userId, metricsData } = req.body;

    if (!metricsData) {
      return res.status(400).json({
        error: 'Metrics data required',
        message: 'Please provide metrics data'
      });
    }

    const metric = await databaseService.createMonitoringMetric(subnetId, metricsData);

    res.json({
      success: true,
      metric
    });

  } catch (error) {
    console.error('Error storing monitoring metrics:', error);
    res.status(500).json({
      error: 'Failed to store monitoring metrics',
      message: error.message
    });
  }
});

/**
 * GET /monitor/:subnetId/validators - Get subnet validators
 */
router.get('/:subnetId/validators', async (req, res) => {
  try {
    const { subnetId } = req.params;

    const validators = await databaseService.getValidators(subnetId);

    res.json({
      success: true,
      validators
    });

  } catch (error) {
    console.error('Error fetching validators:', error);
    res.status(500).json({
      error: 'Failed to fetch validators',
      message: error.message
    });
  }
});

/**
 * POST /monitor/:subnetId/validators - Add validator to subnet
 */
router.post('/:subnetId/validators', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const { userId, validatorData } = req.body;

    if (!validatorData || !validatorData.nodeId || !validatorData.name) {
      return res.status(400).json({
        error: 'Invalid validator data',
        message: 'nodeId and name are required'
      });
    }

    const validator = await databaseService.createValidator(subnetId, validatorData);

    // Log activity
    try {
      await databaseService.logActivity(userId, 'validator_added', 
        `Added validator: ${validatorData.name}`, 
        { subnetId, validatorId: validator.id, nodeId: validatorData.nodeId }
      );
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      validator
    });

  } catch (error) {
    console.error('Error adding validator:', error);
    res.status(500).json({
      error: 'Failed to add validator',
      message: error.message
    });
  }
});

/**
 * PUT /monitor/:subnetId/validators/:validatorId - Update validator
 */
router.put('/:subnetId/validators/:validatorId', async (req, res) => {
  try {
    const { validatorId } = req.params;
    const { userId, updates } = req.body;

    const validator = await databaseService.updateValidator(validatorId, updates);

    // Log activity
    try {
      await databaseService.logActivity(userId, 'validator_updated', 
        `Updated validator: ${validator.name}`, 
        { subnetId: req.params.subnetId, validatorId, updates }
      );
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      validator
    });

  } catch (error) {
    console.error('Error updating validator:', error);
    res.status(500).json({
      error: 'Failed to update validator',
      message: error.message
    });
  }
});

/**
 * GET /monitor/health/:subnetId - Get subnet health status
 */
router.get('/health/:subnetId', async (req, res) => {
  try {
    const { subnetId } = req.params;

    // Get latest metrics
    const metrics = await databaseService.getLatestMetrics(subnetId);
    
    // Get validators
    const validators = await databaseService.getValidators(subnetId);

    // Calculate health status
    let healthStatus = 'healthy';
    let issues = [];

    if (!metrics) {
      healthStatus = 'unknown';
      issues.push('No monitoring data available');
    } else {
      // Check block height progression
      if (metrics.current_block_height === 0) {
        healthStatus = 'error';
        issues.push('Block height is 0 - subnet may not be running');
      }

      // Check validator status
      const offlineValidators = validators.filter(v => v.status === 'offline');
      if (offlineValidators.length > 0) {
        healthStatus = healthStatus === 'error' ? 'error' : 'warning';
        issues.push(`${offlineValidators.length} validators offline`);
      }

      // Check TPS
      if (metrics.tps && metrics.tps < 1) {
        healthStatus = healthStatus === 'error' ? 'error' : 'warning';
        issues.push('Low transaction throughput');
      }

      // Check uptime
      if (metrics.uptime_percentage && metrics.uptime_percentage < 95) {
        healthStatus = healthStatus === 'error' ? 'error' : 'warning';
        issues.push('Uptime below 95%');
      }
    }

    res.json({
      success: true,
      health: {
        status: healthStatus,
        issues,
        lastCheck: new Date().toISOString(),
        metrics: metrics ? {
          blockHeight: metrics.current_block_height,
          tps: metrics.tps,
          uptime: metrics.uptime_percentage,
          activeValidators: metrics.active_validators,
          totalValidators: metrics.total_validators
        } : null,
        validators: validators.map(v => ({
          id: v.id,
          name: v.name,
          nodeId: v.node_id,
          status: v.status,
          isPrimary: v.is_primary
        }))
      }
    });

  } catch (error) {
    console.error('Error checking subnet health:', error);
    res.status(500).json({
      error: 'Failed to check subnet health',
      message: error.message
    });
  }
});

/**
 * GET /monitor/alerts/:subnetId - Get monitoring alerts
 */
router.get('/alerts/:subnetId', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const { hours = 24 } = req.query;

    // Get recent activity logs for this subnet
    const logs = await databaseService.getActivityLogs(null, 100);
    const subnetLogs = logs.filter(log => 
      log.subnet_config_id === subnetId &&
      new Date(log.created_at) >= new Date(Date.now() - (parseInt(hours) * 60 * 60 * 1000))
    );

    // Get latest metrics for comparison
    const latestMetrics = await databaseService.getLatestMetrics(subnetId);
    const previousMetrics = await databaseService.getMonitoringMetrics(subnetId, 2);

    const alerts = [];

    // Check for significant changes
    if (latestMetrics && previousMetrics.length > 1) {
      const previous = previousMetrics[1];

      // Block height stagnation
      if (latestMetrics.current_block_height === previous.current_block_height) {
        alerts.push({
          type: 'warning',
          message: 'Block height has not increased',
          timestamp: new Date().toISOString()
        });
      }

      // TPS drop
      if (latestMetrics.tps && previous.tps && 
          latestMetrics.tps < previous.tps * 0.5) {
        alerts.push({
          type: 'warning',
          message: 'Transaction throughput has dropped significantly',
          timestamp: new Date().toISOString()
        });
      }

      // Validator count change
      if (latestMetrics.active_validators !== previous.active_validators) {
        alerts.push({
          type: 'info',
          message: `Validator count changed from ${previous.active_validators} to ${latestMetrics.active_validators}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Add activity-based alerts
    subnetLogs.forEach(log => {
      if (log.action === 'subnet_deployment_failed') {
        alerts.push({
          type: 'error',
          message: log.description,
          timestamp: log.created_at
        });
      }
    });

    res.json({
      success: true,
      alerts: alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
});

/**
 * GET /monitor/network/status - Get Avalanche network status
 */
router.get('/network/status', async (req, res) => {
  try {
    const status = await avalancheService.getNetworkStatus();

    res.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error fetching network status:', error);
    res.status(500).json({
      error: 'Failed to fetch network status',
      message: error.message
    });
  }
});

/**
 * POST /monitor/start - Start monitoring for a subnet
 */
router.post('/start', async (req, res) => {
  try {
    const { subnetId, userId, interval = 30000 } = req.body; // Default 30 seconds

    if (!subnetId || !userId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'subnetId and userId are required'
      });
    }

    // Get subnet configuration
    const subnetConfig = await databaseService.getSubnetConfig(subnetId);
    if (!subnetConfig) {
      return res.status(404).json({
        error: 'Subnet not found',
        message: `Subnet with ID ${subnetId} does not exist`
      });
    }

    // Log monitoring start
    await databaseService.logActivity(userId, 'monitoring_started', 
      `Started monitoring subnet: ${subnetConfig.name}`, 
      { subnetId, interval }
    );

    res.json({
      success: true,
      message: 'Monitoring started',
      subnetId,
      interval
    });

  } catch (error) {
    console.error('Error starting monitoring:', error);
    res.status(500).json({
      error: 'Failed to start monitoring',
      message: error.message
    });
  }
});

module.exports = router;
