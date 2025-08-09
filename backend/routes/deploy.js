const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Store deployment status in memory (in production, use Redis or database)
const deployments = new Map();

// POST /deploy - Deploy a subnet
router.post('/', async (req, res) => {
  try {
    const config = req.body;
    const deploymentId = uuidv4();
    
    // Validate config
    if (!config.name || !config.vmType) {
      return res.status(400).json({
        error: 'Invalid configuration',
        message: 'Name and VM type are required'
      });
    }

    // Update deployment status
    deployments.set(deploymentId, {
      id: deploymentId,
      status: 'deploying',
      config,
      createdAt: new Date(),
      logs: []
    });

    // Start deployment process
    deploySubnet(deploymentId, config);

    res.json({
      deploymentId,
      status: 'deploying',
      message: 'Deployment started successfully'
    });

  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({
      error: 'Deployment failed',
      message: error.message
    });
  }
});

// GET /deploy/:id - Get deployment status
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const deployment = deployments.get(id);
  
  if (!deployment) {
    return res.status(404).json({
      error: 'Deployment not found',
      message: `Deployment with ID ${id} does not exist`
    });
  }

  res.json(deployment);
});

// Deploy subnet using avalanche-cli
async function deploySubnet(deploymentId, config) {
  const deployment = deployments.get(deploymentId);
  
  try {
    // Add log entry
    addLog(deploymentId, 'Starting subnet deployment...');
    
    // Step 1: Create subnet
    addLog(deploymentId, `Creating subnet: ${config.name}`);
    await runAvalancheCommand([
      'subnet', 'create', config.name,
      '--vm', config.vmType
    ], deploymentId);

    // Step 2: Configure validators if specified
    if (config.validators && config.validators.length > 0) {
      addLog(deploymentId, 'Configuring validators...');
      for (const validator of config.validators) {
        await runAvalancheCommand([
          'subnet', 'addValidator', config.name,
          '--nodeID', validator
        ], deploymentId);
      }
    }

    // Step 3: Configure tokenomics if specified
    if (config.tokenomics) {
      addLog(deploymentId, 'Configuring tokenomics...');
      if (config.tokenomics.supply) {
        await runAvalancheCommand([
          'subnet', 'configure', config.name,
          '--supply', config.tokenomics.supply
        ], deploymentId);
      }
      if (config.tokenomics.gasPrice) {
        await runAvalancheCommand([
          'subnet', 'configure', config.name,
          '--gasPrice', config.tokenomics.gasPrice
        ], deploymentId);
      }
    }

    // Step 4: Deploy to testnet
    addLog(deploymentId, 'Deploying to Fuji testnet...');
    await runAvalancheCommand([
      'subnet', 'deploy', config.name,
      '--network', 'fuji'
    ], deploymentId);

    // Step 5: Get subnet info
    addLog(deploymentId, 'Retrieving subnet information...');
    const subnetInfo = await runAvalancheCommand([
      'subnet', 'info', config.name
    ], deploymentId);

    // Update deployment status
    deployment.status = 'success';
    deployment.completedAt = new Date();
    deployment.subnetInfo = subnetInfo;
    addLog(deploymentId, 'Deployment completed successfully!');

  } catch (error) {
    console.error('Deployment failed:', error);
    deployment.status = 'error';
    deployment.error = error.message;
    deployment.completedAt = new Date();
    addLog(deploymentId, `Deployment failed: ${error.message}`);
  }
}

// Run avalanche-cli command
function runAvalancheCommand(args, deploymentId) {
  return new Promise((resolve, reject) => {
    const command = spawn('avalanche', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    command.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      addLog(deploymentId, output.trim());
    });

    command.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      addLog(deploymentId, `ERROR: ${output.trim()}`);
    });

    command.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    command.on('error', (error) => {
      if (error.code === 'ENOENT') {
        addLog(deploymentId, 'ERROR: avalanche-cli is not installed');
        addLog(deploymentId, 'To install: go install github.com/ava-labs/avalanche-cli@latest');
        reject(new Error('avalanche-cli is not installed. Please install it first.'));
      } else {
        reject(error);
      }
    });
  });
}

// Add log entry to deployment
function addLog(deploymentId, message) {
  const deployment = deployments.get(deploymentId);
  if (deployment) {
    deployment.logs.push({
      timestamp: new Date(),
      message: message.trim()
    });
  }
}

module.exports = router;
