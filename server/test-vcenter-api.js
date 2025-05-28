const axios = require('axios');
require('dotenv').config();

/**
 * vCenter REST API Test
 * 
 * This script tests the vCenter REST API endpoints
 * 
 * Usage: node test-vcenter-api.js
 */

// API Base URL
const API_URL = 'http://localhost:5000/api';
let authToken = null;

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: {}
};

// Helper function to record test results
function recordTest(name, success, response = null, error = null) {
  results.tests[name] = {
    success,
    response: response ? 
      (typeof response === 'object' ? JSON.stringify(response) : response) : null,
    error: error ? 
      (typeof error === 'object' ? JSON.stringify(error) : error) : null
  };
  
  if (success) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (error) console.log(`   Error: ${typeof error === 'object' ? error.response?.data || error.message : error}`);
  }
}

// Login to get auth token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: process.env.TEST_USER_EMAIL || 'admin@nettoria.com',
      password: process.env.TEST_USER_PASSWORD || 'admin123'
    });

    console.log("Login successful");
    authToken = response.data.token || response.data.data?.token;
    recordTest('User Login', true, { authenticated: true });
    return true;
  } catch (error) {
    console.error(
      "Login failed:",
      error.response ? error.response.data : error.message
    );
    recordTest('User Login', false, null, error.response?.data || error.message);
    
    // Try registration if login fails
    return await register();
  }
}

// Register a new admin user if login fails
async function register() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      firstName: "Admin",
      lastName: "User",
      email: "admin@nettoria.com",
      password: "admin123",
      phoneNumber: "09109924707",
      role: "admin",
    });

    console.log("Registration successful");
    authToken = response.data.token || response.data.data?.token;
    recordTest('User Registration', true, { authenticated: true });
    return true;
  } catch (error) {
    console.error(
      "Registration failed:",
      error.response ? error.response.data : error.message
    );
    recordTest('User Registration', false, null, error.response?.data || error.message);
    return false;
  }
}

// Test getting VM list
async function testGetVMs() {
  console.log('\n----- Testing Get VMs API -----');
  
  if (!authToken) {
    recordTest('Get VMs API', false, null, 'No authentication token available');
    return null;
  }
  
  try {
    const response = await axios.get(`${API_URL}/vcenter/vms`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    recordTest('Get VMs API', true, response.data);
    
    // Display the VM list
    if (response.data?.data?.vms) {
      console.log(`Found ${response.data.data.vms.length} VMs.`);
    }
    
    return response.data?.data?.vms || [];
  } catch (error) {
    recordTest('Get VMs API', false, null, error.response?.data || error.message);
    return null;
  }
}

// Test getting VM details
async function testGetVMDetails(vmId) {
  console.log(`\n----- Testing Get VM Details API for VM ${vmId} -----`);
  
  if (!authToken) {
    recordTest('Get VM Details API', false, null, 'No authentication token available');
    return null;
  }
  
  try {
    const response = await axios.get(`${API_URL}/vcenter/vms/${vmId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    recordTest('Get VM Details API', true, response.data);
    return response.data?.data?.vm || null;
  } catch (error) {
    recordTest('Get VM Details API', false, null, error.response?.data || error.message);
    return null;
  }
}

// Test VM power operations
async function testVMPowerOperations(vmId) {
  console.log(`\n----- Testing VM Power Operations API for VM ${vmId} -----`);
  
  if (!authToken) {
    recordTest('VM Power Operations API', false, null, 'No authentication token available');
    return false;
  }
  
  try {
    // Try power on operation
    const powerOnResponse = await axios.post(`${API_URL}/vcenter/vms/${vmId}/power`, 
      { action: 'on' },
      { headers: { Authorization: `Bearer ${authToken}` }}
    );
    
    recordTest('VM Power On API', true, powerOnResponse.data);
    
    // Wait a few seconds
    console.log('Waiting for power state change...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try power off operation
    const powerOffResponse = await axios.post(`${API_URL}/vcenter/vms/${vmId}/power`, 
      { action: 'off' },
      { headers: { Authorization: `Bearer ${authToken}` }}
    );
    
    recordTest('VM Power Off API', true, powerOffResponse.data);
    
    return true;
  } catch (error) {
    recordTest('VM Power Operations API', false, null, error.response?.data || error.message);
    return false;
  }
}

// Test VM console URL generation
async function testVMConsoleURL(vmId) {
  console.log(`\n----- Testing VM Console URL API for VM ${vmId} -----`);
  
  if (!authToken) {
    recordTest('VM Console URL API', false, null, 'No authentication token available');
    return null;
  }
  
  try {
    const response = await axios.get(`${API_URL}/vcenter/vms/${vmId}/console`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    recordTest('VM Console URL API', true, response.data);
    return response.data?.data?.consoleUrl || null;
  } catch (error) {
    recordTest('VM Console URL API', false, null, error.response?.data || error.message);
    return null;
  }
}

// Test vCenter tasks API
async function testVCenterTasks() {
  console.log('\n----- Testing vCenter Tasks API -----');
  
  if (!authToken) {
    recordTest('vCenter Tasks API', false, null, 'No authentication token available');
    return null;
  }
  
  try {
    const response = await axios.get(`${API_URL}/vcenter/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    recordTest('vCenter Tasks API', true, response.data);
    
    // Display the task list
    if (response.data?.data?.tasks) {
      console.log(`Found ${response.data.data.tasks.length} tasks.`);
    }
    
    return response.data?.data?.tasks || [];
  } catch (error) {
    recordTest('vCenter Tasks API', false, null, error.response?.data || error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('=================================================');
  console.log('NETTORIA vCENTER REST API TEST SUITE');
  console.log('=================================================');
  console.log('Testing API endpoints for vCenter integration');
  console.log('=================================================\n');
  
  try {
    // Login first to get the auth token
    const authenticated = await login();
    
    if (authenticated) {
      // Get VMs
      const vms = await testGetVMs();
      
      // If we have VMs, test the operations on the first one
      if (vms && vms.length > 0) {
        const vmId = vms[0].id;
        
        // Test getting VM details
        await testGetVMDetails(vmId);
        
        // Test power operations
        await testVMPowerOperations(vmId);
        
        // Test console URL generation
        await testVMConsoleURL(vmId);
      } else {
        console.log('No VMs found to test with. Using sample VM ID.');
        // Try with a sample VM ID
        await testGetVMDetails('vm-1234');
        await testVMPowerOperations('vm-1234');
        await testVMConsoleURL('vm-1234');
      }
      
      // Test tasks API
      await testVCenterTasks();
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
  
  // Print summary
  console.log('\n=================================================');
  console.log('TEST SUMMARY');
  console.log('=================================================');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('=================================================');
  
  // List failed tests
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    for (const [testName, result] of Object.entries(results.tests)) {
      if (!result.success) {
        console.log(`- ${testName}: ${result.error}`);
      }
    }
    console.log('=================================================');
  }
}

// Run the tests
runTests(); 