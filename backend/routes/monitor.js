const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client (only if credentials are provided)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
    process.env.SUPABASE_URL !== 'your_supabase_url_here' && 
    process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here') {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

// Avalanche RPC endpoints
const AVALANCHE_RPC = process.env.AVALANCHE_RPC_URL || 'http://localhost:9650';

// GET /monitor/:subnetId - Start monitoring a subnet
router.get('/:subnetId', async (req, res) => {
  try {
    const { subnetId } = req.params;
    
    // Get initial subnet metrics
    const metrics = await getSubnetMetrics(subnetId);
    
    res.json(metrics);
  } catch (error) {
    console.error('Monitoring error:', error);
    res.status(500).json({
      error: 'Failed to start monitoring',
      message: error.message
    });
  }
});

// GET /monitor/:subnetId/metrics - Get current metrics
router.get('/:subnetId/metrics', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const metrics = await getSubnetMetrics(subnetId);
    
    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

// GET /monitor/:subnetId/validators - Get validator list
router.get('/:subnetId/validators', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const validators = await getSubnetValidators(subnetId);
    
    res.json(validators);
  } catch (error) {
    console.error('Validators error:', error);
    res.status(500).json({
      error: 'Failed to fetch validators',
      message: error.message
    });
  }
});

// GET /monitor/:subnetId/logs - Get subnet logs
router.get('/:subnetId/logs', async (req, res) => {
  try {
    const { subnetId } = req.params;
    const { limit = 100 } = req.query;
    
    // Get logs from database
    const { data: logs, error } = await supabase
      .from('subnet_logs')
      .select('*')
      .eq('subnet_id', subnetId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json(logs || []);
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({
      error: 'Failed to fetch logs',
      message: error.message
    });
  }
});

// Get comprehensive subnet metrics
async function getSubnetMetrics(subnetId) {
  try {
    // Get basic subnet info
    const subnetInfo = await getSubnetInfo(subnetId);
    
    // Get block height
    const blockHeight = await getBlockHeight(subnetId);
    
    // Get TPS (approximate)
    const tps = await getTPS(subnetId);
    
    // Get validators
    const validators = await getSubnetValidators(subnetId);
    
    // Determine health status
    const health = determineHealthStatus(subnetInfo, validators, tps);
    
    return {
      subnetId,
      blockHeight,
      tps,
      validators,
      health,
      lastUpdate: new Date().toISOString(),
      subnetInfo
    };
  } catch (error) {
    console.error('Error getting subnet metrics:', error);
    throw error;
  }
}

// Get subnet information
async function getSubnetInfo(subnetId) {
  try {
    const response = await axios.post(`${AVALANCHE_RPC}/ext/info`, {
      jsonrpc: '2.0',
      method: 'info.getSubnets',
      params: {},
      id: 1
    });
    
    const subnets = response.data.result.subnets;
    return subnets.find(subnet => subnet.id === subnetId) || null;
  } catch (error) {
    console.error('Error getting subnet info:', error);
    return null;
  }
}

// Get block height
async function getBlockHeight(subnetId) {
  try {
    const response = await axios.post(`${AVALANCHE_RPC}/ext/bc/${subnetId}/rpc`, {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    });
    
    return parseInt(response.data.result, 16);
  } catch (error) {
    console.error('Error getting block height:', error);
    return 0;
  }
}

// Get TPS (approximate)
async function getTPS(subnetId) {
  try {
    // Get recent blocks to calculate TPS
    const response = await axios.post(`${AVALANCHE_RPC}/ext/bc/${subnetId}/rpc`, {
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
      id: 1
    });
    
    const block = response.data.result;
    if (!block || !block.transactions) return 0;
    
    // This is a simplified TPS calculation
    // In a real implementation, you'd track transactions over time
    return block.transactions.length;
  } catch (error) {
    console.error('Error getting TPS:', error);
    return 0;
  }
}

// Get subnet validators
async function getSubnetValidators(subnetId) {
  try {
    const response = await axios.post(`${AVALANCHE_RPC}/ext/info`, {
      jsonrpc: '2.0',
      method: 'platform.getSubnets',
      params: {},
      id: 1
    });
    
    const subnets = response.data.result.subnets;
    const subnet = subnets.find(s => s.id === subnetId);
    
    if (!subnet) return [];
    
    // Get validator details
    const validators = [];
    for (const validatorId of subnet.validators || []) {
      try {
        const validatorResponse = await axios.post(`${AVALANCHE_RPC}/ext/info`, {
          jsonrpc: '2.0',
          method: 'platform.getValidator',
          params: { id: validatorId },
          id: 1
        });
        
        const validator = validatorResponse.data.result;
        validators.push({
          nodeID: validator.nodeID,
          weight: validator.weight,
          startTime: validator.startTime,
          endTime: validator.endTime,
          uptime: validator.uptime || '0'
        });
      } catch (error) {
        console.error(`Error getting validator ${validatorId}:`, error);
      }
    }
    
    return validators;
  } catch (error) {
    console.error('Error getting validators:', error);
    return [];
  }
}

// Determine health status
function determineHealthStatus(subnetInfo, validators, tps) {
  if (!subnetInfo) return 'red';
  
  // Check if subnet is active
  if (!subnetInfo.validators || subnetInfo.validators.length === 0) {
    return 'red';
  }
  
  // Check validator count
  if (validators.length < 3) {
    return 'yellow';
  }
  
  // Check TPS (basic threshold)
  if (tps < 1) {
    return 'yellow';
  }
  
  return 'green';
}

// Add log entry to database
async function addLog(subnetId, message, level = 'info') {
  try {
    const { error } = await supabase
      .from('subnet_logs')
      .insert({
        subnet_id: subnetId,
        message,
        level,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error adding log:', error);
    }
  } catch (error) {
    console.error('Error adding log:', error);
  }
}

module.exports = router;
