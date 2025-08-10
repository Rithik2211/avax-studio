#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFrontendDeployment() {
  console.log('🧪 Testing Frontend Deployment Simulation\n');
  
  // This simulates exactly what the frontend will send
  const frontendPayload = {
    config: {
      name: 'MySubnet',
      description: 'Subnet created via Avax Studio',
      vmType: 'evm',
      network: 'fuji',
      keyName: 'ewoq',
      initialSupply: '1000000000',
      gasPrice: '25000000000',
      governanceEnabled: false,
      governanceThreshold: 2
    },
    userId: 'demo-user-' + Date.now()
  };
  
  try {
    console.log('📤 Sending deployment request...');
    console.log('Payload:', JSON.stringify(frontendPayload, null, 2));
    
    const response = await axios.post(`${BASE_URL}/deploy`, frontendPayload);
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Check deployment status after a moment
    console.log('\n⏳ Checking deployment status in 3 seconds...');
    setTimeout(async () => {
      try {
        const statusResponse = await axios.get(`${BASE_URL}/deploy/${response.data.deploymentId}`);
        console.log('📊 Deployment Status:', JSON.stringify(statusResponse.data, null, 2));
      } catch (error) {
        console.log('⚠️  Status check error:', error.response?.data || error.message);
      }
    }, 3000);
    
  } catch (error) {
    console.log('❌ Deployment failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
  }
}

testFrontendDeployment();
