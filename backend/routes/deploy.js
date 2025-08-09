const express = require('express');
const router = express.Router();
const avalancheService = require('../services/avalancheService');
const databaseService = require('../services/databaseService');

// In-memory storage for deployment status (in production, use Redis)
const deployments = new Map();

/**
 * POST /deploy - Deploy a subnet configuration
 */
router.post('/', async (req, res) => {
  try {
    const { config, userId } = req.body;

    if (!config) {
      return res.status(400).json({
        error: 'Configuration is required',
        message: 'Please provide subnet configuration'
      });
    }

    // Validate configuration
    const validation = avalancheService.validateSubnetConfig(config);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid configuration',
        message: 'Configuration validation failed',
        details: validation.errors
      });
    }

    // Check if Avalanche CLI is available
    const cliStatus = await avalancheService.checkCLI();
    if (!cliStatus.installed) {
      return res.status(500).json({
        error: 'Avalanche CLI not available',
        message: 'Please install Avalanche CLI first',
        details: cliStatus.error
      });
    }

    // Generate unique deployment ID
    const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize deployment status
    deployments.set(deploymentId, {
      id: deploymentId,
      status: 'pending',
      logs: [],
      config,
      userId,
      createdAt: new Date().toISOString()
    });

    // Start deployment process asynchronously
    deploySubnetAsync(deploymentId, config, userId);

    res.json({
      success: true,
      deploymentId,
      message: 'Deployment started',
      status: 'pending'
    });

  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({
      error: 'Deployment failed',
      message: error.message
    });
  }
});

/**
 * GET /deploy/:id - Get deployment status
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deployment = deployments.get(id);

    if (!deployment) {
      return res.status(404).json({
        error: 'Deployment not found',
        message: `Deployment with ID ${id} does not exist`
      });
    }

    res.json({
      success: true,
      deployment
    });

  } catch (error) {
    console.error('Error fetching deployment:', error);
    res.status(500).json({
      error: 'Failed to fetch deployment',
      message: error.message
    });
  }
});

/**
 * GET /deploy - Get all deployments for a user
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Please provide userId parameter'
      });
    }

    // Get deployments from database
    const dbDeployments = await databaseService.getDeployments(userId);
    
    // Get in-memory deployments for this user
    const memoryDeployments = Array.from(deployments.values())
      .filter(d => d.userId === userId);

    // Combine and sort by creation date
    const allDeployments = [...dbDeployments, ...memoryDeployments]
      .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

    res.json({
      success: true,
      deployments: allDeployments
    });

  } catch (error) {
    console.error('Error fetching deployments:', error);
    res.status(500).json({
      error: 'Failed to fetch deployments',
      message: error.message
    });
  }
});

/**
 * POST /deploy/key - Create a new private key
 */
router.post('/key', async (req, res) => {
  try {
    const { keyName } = req.body;

    if (!keyName) {
      return res.status(400).json({
        error: 'Key name required',
        message: 'Please provide a key name'
      });
    }

    const result = await avalancheService.createKey(keyName);

    res.json({
      success: true,
      key: result
    });

  } catch (error) {
    console.error('Key creation error:', error);
    res.status(500).json({
      error: 'Key creation failed',
      message: error.message
    });
  }
});

/**
 * GET /deploy/keys - List all keys
 */
router.get('/keys', async (req, res) => {
  try {
    const result = await avalancheService.listKeys();

    res.json({
      success: true,
      keys: result
    });

  } catch (error) {
    console.error('Error listing keys:', error);
    res.status(500).json({
      error: 'Failed to list keys',
      message: error.message
    });
  }
});

/**
 * POST /deploy/network/start - Start local network
 */
router.post('/network/start', async (req, res) => {
  try {
    const result = await avalancheService.startNetwork();

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Network start error:', error);
    res.status(500).json({
      error: 'Failed to start network',
      message: error.message
    });
  }
});

/**
 * POST /deploy/network/stop - Stop local network
 */
router.post('/network/stop', async (req, res) => {
  try {
    const result = await avalancheService.stopNetwork();

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Network stop error:', error);
    res.status(500).json({
      error: 'Failed to stop network',
      message: error.message
    });
  }
});

/**
 * GET /deploy/network/status - Get network status
 */
router.get('/network/status', async (req, res) => {
  try {
    const result = await avalancheService.getNetworkStatus();

    res.json({
      success: true,
      status: result
    });

  } catch (error) {
    console.error('Network status error:', error);
    res.status(500).json({
      error: 'Failed to get network status',
      message: error.message
    });
  }
});

/**
 * Async function to handle subnet deployment
 */
async function deploySubnetAsync(deploymentId, config, userId) {
  const deployment = deployments.get(deploymentId);
  
  try {
    // Update status to deploying
    deployment.status = 'deploying';
    deployment.logs.push({
      timestamp: new Date().toISOString(),
      message: 'Starting subnet deployment...'
    });

    // Create subnet configuration in database
    let subnetConfigId = null;
    try {
      const subnetConfig = await databaseService.createSubnetConfig(userId, {
        name: config.name,
        description: config.description,
        vmType: config.vmType,
        network: config.network || 'fuji',
        initialSupply: config.initialSupply,
        gasPrice: config.gasPrice,
        governanceThreshold: config.governanceThreshold,
        votingPeriodHours: config.votingPeriodHours,
        configJson: config
      });
      subnetConfigId = subnetConfig.id;

      deployment.logs.push({
        timestamp: new Date().toISOString(),
        message: 'Subnet configuration saved to database'
      });
    } catch (dbError) {
      console.warn('Database save failed, continuing with deployment:', dbError);
    }

    // Create deployment record in database
    let dbDeploymentId = null;
    if (subnetConfigId) {
      try {
        const dbDeployment = await databaseService.createDeployment(userId, subnetConfigId, {
          network: config.network || 'fuji',
          logs: 'Deployment started'
        });
        dbDeploymentId = dbDeployment.id;
      } catch (dbError) {
        console.warn('Deployment record creation failed:', dbError);
      }
    }

    // Generate unique subnet name
    const subnetName = `${config.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;
    
    deployment.logs.push({
      timestamp: new Date().toISOString(),
      message: `Creating subnet configuration: ${subnetName}`
    });

    // Create subnet configuration using Avalanche CLI
    const createResult = await avalancheService.createSubnet(subnetName, {
      vmType: config.vmType,
      consensus: config.consensus || 'pos',
      chainId: config.chainId
    });

    deployment.logs.push({
      timestamp: new Date().toISOString(),
      message: 'Subnet configuration created successfully'
    });

    // Deploy subnet to network
    deployment.logs.push({
      timestamp: new Date().toISOString(),
      message: `Deploying subnet to ${config.network || 'fuji'} network...`
    });

    const deployResult = await avalancheService.deploySubnet(
      subnetName, 
      config.keyName || 'default', 
      config.network || 'fuji'
    );

    // Update deployment with success
    deployment.status = 'completed';
    deployment.result = deployResult;
    deployment.subnetId = deployResult.subnetId;
    deployment.blockchainId = deployResult.blockchainId;
    deployment.rpcUrl = deployResult.rpcUrl;
    deployment.completedAt = new Date().toISOString();

    deployment.logs.push({
      timestamp: new Date().toISOString(),
      message: 'Subnet deployed successfully!',
      details: {
        subnetId: deployResult.subnetId,
        blockchainId: deployResult.blockchainId,
        rpcUrl: deployResult.rpcUrl
      }
    });

    // Update database records
    if (subnetConfigId) {
      try {
        await databaseService.updateSubnetConfig(subnetConfigId, {
          status: 'active',
          subnet_id: deployResult.subnetId,
          blockchain_id: deployResult.blockchainId,
          rpc_endpoint: deployResult.rpcUrl
        });
      } catch (dbError) {
        console.warn('Failed to update subnet config:', dbError);
      }
    }

    if (dbDeploymentId) {
      try {
        await databaseService.updateDeployment(dbDeploymentId, {
          status: 'completed',
          deployment_logs: deployment.logs.map(log => `${log.timestamp}: ${log.message}`).join('\n'),
          transaction_hash: deployResult.subnetId, // Using subnet ID as transaction reference
          block_number: 0
        });
      } catch (dbError) {
        console.warn('Failed to update deployment record:', dbError);
      }
    }

    // Log activity
    try {
      await databaseService.logActivity(userId, 'subnet_deployed', 
        `Successfully deployed subnet ${config.name}`, 
        { subnetId: deployResult.subnetId, blockchainId: deployResult.blockchainId },
        subnetConfigId
      );
    } catch (dbError) {
      console.warn('Failed to log activity:', dbError);
    }

  } catch (error) {
    // Update deployment with error
    deployment.status = 'failed';
    deployment.error = error.message;
    deployment.completedAt = new Date().toISOString();

    deployment.logs.push({
      timestamp: new Date().toISOString(),
      message: `Deployment failed: ${error.message}`,
      level: 'error'
    });

    // Update database records
    if (subnetConfigId) {
      try {
        await databaseService.updateSubnetConfig(subnetConfigId, {
          status: 'failed'
        });
      } catch (dbError) {
        console.warn('Failed to update subnet config status:', dbError);
      }
    }

    if (dbDeploymentId) {
      try {
        await databaseService.updateDeployment(dbDeploymentId, {
          status: 'failed',
          deployment_logs: deployment.logs.map(log => `${log.timestamp}: ${log.message}`).join('\n'),
          error_message: error.message
        });
      } catch (dbError) {
        console.warn('Failed to update deployment record:', dbError);
      }
    }

    // Log activity
    try {
      await databaseService.logActivity(userId, 'subnet_deployment_failed', 
        `Failed to deploy subnet ${config.name}`, 
        { error: error.message },
        subnetConfigId
      );
    } catch (dbError) {
      console.warn('Failed to log activity:', dbError);
    }

    console.error('Deployment failed:', error);
  }
}

module.exports = router;
