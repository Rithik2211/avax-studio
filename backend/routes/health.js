const express = require('express');
const axios = require('axios');

const router = express.Router();

// GET /health - Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// GET /health/avalanche - Check Avalanche node health
router.get('/avalanche', async (req, res) => {
  try {
    const avalancheRpc = process.env.AVALANCHE_RPC_URL || 'http://localhost:9650';
    
    // Check node health
    const healthResponse = await axios.get(`${avalancheRpc}/ext/health`);
    
    // Get node info
    const infoResponse = await axios.post(`${avalancheRpc}/ext/info`, {
      jsonrpc: '2.0',
      method: 'info.getNodeVersion',
      params: {},
      id: 1
    });
    
    res.json({
      status: 'healthy',
      avalanche: {
        health: healthResponse.data,
        version: infoResponse.data.result.version,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Avalanche health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Avalanche node is not responding',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /health/database - Check database connection
router.get('/database', async (req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || 
        process.env.SUPABASE_URL === 'your_supabase_url_here' || 
        process.env.SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
      return res.json({
        status: 'not_configured',
        database: {
          connected: false,
          message: 'Supabase credentials not configured',
          timestamp: new Date().toISOString()
        }
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    // Test database connection
    const { data, error } = await supabase
      .from('templates')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      status: 'healthy',
      database: {
        connected: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /health/full - Comprehensive health check
router.get('/full', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {}
  };
  
  try {
    // Check Avalanche node
    const avalancheRpc = process.env.AVALANCHE_RPC_URL || 'http://localhost:9650';
    const healthResponse = await axios.get(`${avalancheRpc}/ext/health`);
    health.services.avalanche = {
      status: 'healthy',
      response: healthResponse.data
    };
  } catch (error) {
    health.status = 'degraded';
    health.services.avalanche = {
      status: 'unhealthy',
      error: error.message
    };
  }
  
  try {
    // Check database
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
        process.env.SUPABASE_URL !== 'your_supabase_url_here' && 
        process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here') {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      
      const { error } = await supabase
        .from('templates')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      health.services.database = {
        status: 'healthy'
      };
    } else {
      health.services.database = {
        status: 'not_configured',
        message: 'Supabase credentials not configured'
      };
    }
  } catch (error) {
    health.status = 'degraded';
    health.services.database = {
      status: 'unhealthy',
      error: error.message
    };
  }
  
  // Check environment variables
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'AVALANCHE_RPC_URL'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    health.status = 'degraded';
    health.services.environment = {
      status: 'unhealthy',
      missing: missingEnvVars
    };
  } else {
    health.services.environment = {
      status: 'healthy'
    };
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
