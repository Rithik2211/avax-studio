const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const avalancheService = require('../services/avalancheService');

/**
 * GET /monitor - Get all deployed subnets for a user
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Please provide userId query parameter'
      });
    }

    // Handle demo users (non-UUID user IDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      // Return demo data for demo users
      const demoSubnets = [
        {
          id: 'demo-subnet-1',
          name: 'Demo Subnet 1',
          description: 'A demo EVM subnet for testing',
          vmType: 'evm',
          network: 'fuji',
          status: 'active',
          subnetId: '2b175hLJhG1qLbGN1MfG7NvtY7DbCgQnPBC1K5R8GoAz9nCHD',
          blockchainId: '2b175hLJhG1qLbGN1MfG7NvtY7DbCgQnPBC1K5R8GoAz9nCHD',
          rpcEndpoint: 'https://api.avax-test.network/ext/bc/2b175hLJhG1qLbGN1MfG7NvtY7DbCgQnPBC1K5R8GoAz9nCHD/rpc',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deployment: {
            id: 'demo-deployment-1',
            status: 'completed',
            startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            completedAt: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
            transactionHash: '0xd8da314ef69a4b7c8e9f2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
            blockNumber: 1389931,
            gasUsed: 1225054
          }
        },
        {
          id: 'demo-subnet-2',
          name: 'Demo Subnet 2',
          description: 'Another demo EVM subnet',
          vmType: 'evm',
          network: 'fuji',
          status: 'active',
          subnetId: '2b175hLJhG1qLbGN1MfG7NvtY7DbCgQnPBC1K5R8GoAz9nCHD',
          blockchainId: '2b175hLJhG1qLbGN1MfG7NvtY7DbCgQnPBC1K5R8GoAz9nCHD',
          rpcEndpoint: 'https://api.avax-test.network/ext/bc/2b175hLJhG1qLbGN1MfG7NvtY7DbCgQnPBC1K5R8GoAz9nCHD/rpc',
          createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          updatedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          deployment: {
            id: 'demo-deployment-2',
            status: 'completed',
            startedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
            completedAt: new Date(Date.now() - 480000).toISOString(), // 8 minutes ago
            transactionHash: '0xe9eb425f70b5c8d9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
            blockNumber: 1390456,
            gasUsed: 987654
          }
        }
      ];
      
      return res.json({
        success: true,
        subnets: demoSubnets,
        total: demoSubnets.length
      });
    }

    // Get all subnet configurations for the user
    const subnetConfigs = await databaseService.getSubnetConfigs(userId, 'active');
    
    // Get deployment history
    const deployments = await databaseService.getDeployments(userId, 'completed');
    
    // Combine subnet configs with deployment data
    const subnets = subnetConfigs.map(config => {
      const deployment = deployments.find(d => d.subnet_config_id === config.id);
      return {
        id: config.id,
        name: config.name,
        description: config.description,
        vmType: config.vm_type,
        network: config.network,
        status: config.status,
        subnetId: config.subnet_id,
        blockchainId: config.blockchain_id,
        rpcEndpoint: config.rpc_endpoint,
        createdAt: config.created_at,
        updatedAt: config.updated_at,
        deployment: deployment ? {
          id: deployment.id,
          status: deployment.status,
          startedAt: deployment.started_at,
          completedAt: deployment.completed_at,
          transactionHash: deployment.transaction_hash,
          blockNumber: deployment.block_number,
          gasUsed: deployment.gas_used
        } : null
      };
    });

    res.json({
      success: true,
      subnets,
      total: subnets.length
    });

  } catch (error) {
    console.error('Error fetching subnets:', error);
    res.status(500).json({
      error: 'Failed to fetch subnets',
      message: error.message
    });
  }
});

/**
 * GET /monitor/:subnetId - Get detailed metrics for a specific subnet
 */
router.get('/:subnetId', async (req, res) => {
  try {
    const { subnetId } = req.params;
    
    // Get subnet configuration
    const subnetConfig = await databaseService.getSubnetConfig(subnetId);
    
    if (!subnetConfig) {
      return res.status(404).json({
        error: 'Subnet not found',
        message: `Subnet with ID ${subnetId} does not exist`
      });
    }

    // Get deployment data
    const deployments = await databaseService.getDeployments(subnetConfig.user_id, 'completed');
    const deployment = deployments.find(d => d.subnet_config_id === subnetId);

    // Get validators
    const validators = await databaseService.getValidators(subnetId);

    // Get monitoring metrics
    const metrics = await databaseService.getLatestMetrics(subnetId);

    // Try to get real-time metrics from RPC if available
    let realTimeMetrics = null;
    if (subnetConfig.rpc_endpoint) {
      try {
        realTimeMetrics = await avalancheService.getSubnetMetrics(subnetConfig.rpc_endpoint);
      } catch (rpcError) {
        console.warn('Failed to get real-time metrics:', rpcError.message);
      }
    }

    const subnetData = {
      id: subnetConfig.id,
      name: subnetConfig.name,
      description: subnetConfig.description,
      vmType: subnetConfig.vm_type,
      network: subnetConfig.network,
      status: subnetConfig.status,
      subnetId: subnetConfig.subnet_id,
      blockchainId: subnetConfig.blockchain_id,
      rpcEndpoint: subnetConfig.rpc_endpoint,
      createdAt: subnetConfig.created_at,
      updatedAt: subnetConfig.updated_at,
      config: subnetConfig.config_json,
      deployment: deployment ? {
        id: deployment.id,
        status: deployment.status,
        startedAt: deployment.started_at,
        completedAt: deployment.completed_at,
        transactionHash: deployment.transaction_hash,
        blockNumber: deployment.block_number,
        gasUsed: deployment.gas_used,
        logs: deployment.deployment_logs ? JSON.parse(deployment.deployment_logs) : []
      } : null,
      validators: validators.map(v => ({
        id: v.id,
        nodeId: v.node_id,
        name: v.name,
        stakeAmount: v.stake_amount,
        weight: v.weight,
        isPrimary: v.is_primary,
        status: v.status,
        endpoint: v.endpoint
      })),
      metrics: {
        historical: metrics,
        realTime: realTimeMetrics
      }
    };

    res.json({
      success: true,
      subnet: subnetData
    });

  } catch (error) {
    console.error('Error fetching subnet details:', error);
    res.status(500).json({
      error: 'Failed to fetch subnet details',
      message: error.message
    });
  }
});

/**
 * POST /monitor/:subnetId/metrics - Add monitoring metrics for a subnet
 */
router.post('/:subnetId/metrics', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const { blockHeight, tps, validatorCount, healthStatus, logs } = req.body;

    // Validate subnet exists
    const subnetConfig = await databaseService.getSubnetConfig(subnetId);
    if (!subnetConfig) {
      return res.status(404).json({
        error: 'Subnet not found',
        message: `Subnet with ID ${subnetId} does not exist`
      });
    }

    // Save metrics
    const metrics = await databaseService.createMonitoringMetric(subnetId, {
      blockHeight: blockHeight || 0,
      tps: tps || 0,
      validatorCount: validatorCount || 0,
      healthStatus: healthStatus || 'unknown',
      logs: logs || '',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('Error saving metrics:', error);
    res.status(500).json({
      error: 'Failed to save metrics',
      message: error.message
    });
  }
});

/**
 * GET /monitor/:subnetId/validators - Get validators for a subnet
 */
router.get('/:subnetId/validators', async (req, res) => {
  try {
    const { subnetId } = req.params;
    
    const validators = await databaseService.getValidators(subnetId);
    
    res.json({
      success: true,
      validators: validators.map(v => ({
        id: v.id,
        nodeId: v.node_id,
        name: v.name,
        stakeAmount: v.stake_amount,
        weight: v.weight,
        isPrimary: v.is_primary,
        status: v.status,
        endpoint: v.endpoint,
        createdAt: v.created_at
      }))
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
 * POST /monitor/:subnetId/validators - Add a validator to a subnet
 */
router.post('/:subnetId/validators', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const { nodeId, name, stakeAmount, weight, isPrimary, endpoint } = req.body;

    // Validate subnet exists
    const subnetConfig = await databaseService.getSubnetConfig(subnetId);
    if (!subnetConfig) {
      return res.status(404).json({
        error: 'Subnet not found',
        message: `Subnet with ID ${subnetId} does not exist`
      });
    }

    // Add validator to database
    const validator = await databaseService.createValidator(subnetId, {
      nodeId,
      name,
      stakeAmount: stakeAmount || 0,
      weight: weight || 1,
      isPrimary: isPrimary || false,
      endpoint
    });

    // Try to add validator to actual subnet using Avalanche CLI
    try {
      await avalancheService.addValidator(subnetConfig.name, {
        nodeId,
        weight: weight || 1
      });
    } catch (cliError) {
      console.warn('Failed to add validator via CLI:', cliError.message);
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
 * GET /monitor/stats - Get overall monitoring statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Please provide userId query parameter'
      });
    }

    // Handle demo users (non-UUID user IDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      // Return demo stats for non-UUID users
      const stats = {
        subnets: {
          total: 2,
          active: 2,
          deploying: 0,
          failed: 0
        },
        templates: {
          total: 3, // Demo templates
          public: 3,
          private: 0,
          usageCount: 35
        },
        deployments: {
          total: 2,
          successful: 2,
          failed: 0
        }
      };
      
      return res.json({
        success: true,
        stats
      });
    }

    // Get subnet statistics
    const subnetStats = await databaseService.getSubnetStats(userId);
    
    // Get template statistics
    const templateStats = await databaseService.getTemplateStats();

    const stats = {
      subnets: {
        total: subnetStats.total || 0,
        active: subnetStats.active || 0,
        deploying: subnetStats.deploying || 0,
        failed: subnetStats.failed || 0
      },
      templates: {
        total: templateStats.total || 0,
        public: templateStats.public || 0,
        private: templateStats.private || 0,
        usageCount: templateStats.totalUsage || 0
      },
      deployments: {
        total: subnetStats.totalDeployments || 0,
        successful: subnetStats.successfulDeployments || 0,
        failed: subnetStats.failedDeployments || 0
      }
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

module.exports = router;
