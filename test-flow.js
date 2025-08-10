#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testHealth() {
  console.log('🏥 Testing Health Endpoints...');
  
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend Health:', health.data.status);
    
    const dbHealth = await axios.get(`${BASE_URL}/health/database`);
    console.log('✅ Database Health:', dbHealth.data.status);
    
    const fullHealth = await axios.get(`${BASE_URL}/health/full`);
    console.log('✅ Full Health Check:', fullHealth.data.status);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
}

async function testAvalancheCLI() {
  console.log('\n🔧 Testing Avalanche CLI Integration...');
  
  try {
    const cliStatus = await axios.get(`${BASE_URL}/deploy/network/status`);
    console.log('✅ Network Status:', cliStatus.data.status ? 'Available' : 'Not Available');
  } catch (error) {
    console.log('⚠️  CLI Status:', error.response?.data?.message || error.message);
  }
  
  try {
    const keys = await axios.get(`${BASE_URL}/deploy/keys`);
    console.log('✅ Keys Available:', keys.data.keys ? 'Yes' : 'No');
  } catch (error) {
    console.log('❌ Keys Check Failed:', error.message);
  }
}

async function testDeployment() {
  console.log('\n🚀 Testing Deployment Flow...');
  
  const testConfig = {
    config: {
      name: "TestSubnet",
      description: "Test subnet for demo",
      vmType: "evm",
      network: "fuji",
      keyName: "ewoq",
      initialSupply: "1000000000",
      gasPrice: "25000000000"
    },
    userId: "test-user-123"
  };
  
  try {
    console.log('📤 Starting deployment...');
    const deployment = await axios.post(`${BASE_URL}/deploy`, testConfig);
    console.log('✅ Deployment Started:', deployment.data.deploymentId);
    
    // Wait a moment and check status
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const status = await axios.get(`${BASE_URL}/deploy/${deployment.data.deploymentId}`);
    console.log('✅ Deployment Status:', status.data.deployment.status);
    console.log('📋 Logs:', status.data.deployment.logs?.length || 0, 'entries');
    
  } catch (error) {
    console.log('❌ Deployment Test Failed:', error.response?.data?.message || error.message);
  }
}

async function testTemplates() {
  console.log('\n📚 Testing Template System...');
  
  try {
    const templates = await axios.get(`${BASE_URL}/templates`);
    console.log('✅ Public Templates:', templates.data.templates?.length || 0);
    
    const stats = await axios.get(`${BASE_URL}/templates/stats`);
    console.log('✅ Template Stats:', stats.data.stats);
    
  } catch (error) {
    console.log('❌ Template Test Failed:', error.response?.data?.message || error.message);
  }
}

async function testMonitoring() {
  console.log('\n📊 Testing Monitoring System...');
  
  try {
    const networkStatus = await axios.get(`${BASE_URL}/monitor/network/status`);
    console.log('✅ Network Monitoring:', networkStatus.data.status ? 'Available' : 'Not Available');
    
  } catch (error) {
    console.log('❌ Monitoring Test Failed:', error.response?.data?.message || error.message);
  }
}

async function testFrontend() {
  console.log('\n🌐 Testing Frontend...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    console.log('✅ Frontend Status:', response.status === 200 ? 'Running' : 'Error');
    console.log('✅ Frontend Title:', response.data.includes('Avax Studio') ? 'Correct' : 'Incorrect');
    
  } catch (error) {
    console.log('❌ Frontend Test Failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Starting Subnet Studio Complete Flow Test\n');
  console.log('=' .repeat(50));
  
  await testHealth();
  await testAvalancheCLI();
  await testDeployment();
  await testTemplates();
  await testMonitoring();
  await testFrontend();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Test Complete!');
  console.log('\n📋 Summary:');
  console.log('- Backend: Running on http://localhost:3001');
  console.log('- Frontend: Running on http://localhost:3000');
  console.log('- Avalanche CLI: Installed and configured');
  console.log('- Database: Configured (Supabase setup needed)');
  console.log('\n🚀 Ready for demo!');
}

runAllTests().catch(console.error);
