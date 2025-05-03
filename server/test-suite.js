const axios = require('axios');
require('dotenv').config();
const { Smsir } = require('smsir-js');

/**
 * Nettoria Server Test Suite
 * 
 * This test suite verifies the functionality of the Nettoria server,
 * with a focus on authentication and SMS integration.
 * 
 * NOTE: A running PostgreSQL database is required for all tests to pass.
 * The direct SMS tests will work without a database connection.
 * 
 * Usage: node test-suite.js
 */

// API Base URL
const API_URL = 'http://localhost:5000/api';

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
    if (error) console.log(`   Error: ${typeof error === 'object' ? JSON.stringify(error) : error}`);
  }
}

// ========== AUTHENTICATION TESTS ==========

// Test user registration
async function testRegistration() {
  console.log('\n----- Testing User Registration -----');
  
  try {
    // Generate unique email and phone number
    const timestamp = Date.now();
    const uniqueEmail = `test${timestamp}@example.com`;
    const uniquePhone = `0910${timestamp.toString().substr(-7)}`;
    
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: uniqueEmail,
      phoneNumber: uniquePhone,
      password: 'Password123'
    };
    
    console.log('Registering with:', userData);
    
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    recordTest('User Registration', true, response.data);
    
    return {
      token: response.data.data?.token,
      email: uniqueEmail,
      phoneNumber: uniquePhone,
      password: 'Password123'
    };
  } catch (error) {
    recordTest('User Registration', false, null, error.response?.data || error.message);
    return null;
  }
}

// Test login with email
async function testEmailLogin(email, password) {
  console.log('\n----- Testing Email Login -----');
  
  try {
    console.log(`Logging in with email: ${email}`);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    recordTest('Email Login', true, response.data);
    return response.data.data?.token;
  } catch (error) {
    recordTest('Email Login', false, null, error.response?.data || error.message);
    return null;
  }
}

// Test login with phone
async function testPhoneLogin(phoneNumber, password) {
  console.log('\n----- Testing Phone Login -----');
  
  try {
    console.log(`Logging in with phone: ${phoneNumber}`);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      phoneNumber,
      password
    });
    
    recordTest('Phone Login', true, response.data);
    return response.data.data?.token;
  } catch (error) {
    recordTest('Phone Login', false, null, error.response?.data || error.message);
    return null;
  }
}

// Test login with identifier field
async function testIdentifierLogin(identifier, password) {
  console.log('\n----- Testing Identifier Login -----');
  
  try {
    console.log(`Logging in with identifier: ${identifier}`);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      identifier,
      password
    });
    
    recordTest('Identifier Login', true, response.data);
    return response.data.data?.token;
  } catch (error) {
    recordTest('Identifier Login', false, null, error.response?.data || error.message);
    return null;
  }
}

// Test user profile access
async function testUserProfile(token) {
  console.log('\n----- Testing User Profile Access -----');
  
  if (!token) {
    recordTest('User Profile Access', false, null, 'No authentication token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    recordTest('User Profile Access', true, response.data);
    return true;
  } catch (error) {
    recordTest('User Profile Access', false, null, error.response?.data || error.message);
    return false;
  }
}

// ========== SMS FUNCTIONALITY TESTS ==========

// Test SMS credit via API
async function testSmsCredit(token) {
  console.log('\n----- Testing SMS Credit API -----');
  
  if (!token) {
    recordTest('SMS Credit API', false, null, 'No authentication token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_URL}/sms/credit`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    recordTest('SMS Credit API', true, response.data);
    return true;
  } catch (error) {
    recordTest('SMS Credit API', false, null, error.response?.data || error.message);
    return false;
  }
}

// Test SMS sending via API
async function testSmsSending(token, phoneNumber) {
  console.log('\n----- Testing SMS Sending API -----');
  
  if (!token) {
    recordTest('SMS Sending API', false, null, 'No authentication token available');
    return false;
  }
  
  try {
    const response = await axios.post(`${API_URL}/sms/notification`, 
      {
        phoneNumber,
        message: 'Test SMS from Nettoria API'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    recordTest('SMS Sending API', true, response.data);
    return true;
  } catch (error) {
    // This test might fail for regular users (not admin)
    recordTest('SMS Sending API', false, null, error.response?.data || error.message);
    return false;
  }
}

// Test direct SMS functionality
async function testDirectSms() {
  console.log('\n----- Testing Direct SMS Integration -----');
  
  try {
    const smsClient = new Smsir(
      process.env.SMS_API_KEY,
      process.env.SMS_LINE_NUMBER
    );
    
    // Check credit
    console.log('Checking SMS credit...');
    const creditResponse = await smsClient.getCredit();
    recordTest('Direct SMS Credit Check', true, creditResponse.data);
    
    // Send test message
    console.log('Sending test SMS...');
    const message = `Nettoria Test SMS: ${new Date().toISOString()}`;
    const smsResponse = await smsClient.SendBulk(
      message,
      ['09109924707'],
      null
    );
    
    recordTest('Direct SMS Sending', true, smsResponse.data);
    return true;
  } catch (error) {
    recordTest('Direct SMS Integration', false, null, error.response?.data || error.message);
    return false;
  }
}

// ========== DATABASE TESTS ==========

// Test database connection
async function testDatabaseConnection() {
  console.log('\n----- Testing Database Connection -----');
  
  try {
    const response = await axios.get(`${API_URL}/status`);
    
    const connected = response.data.database.connected === true;
    recordTest('Database Connection', connected, response.data);
    return connected;
  } catch (error) {
    recordTest('Database Connection', false, null, error.response?.data || error.message);
    return false;
  }
}

// ========== MAIN TEST RUNNER ==========

async function runTests() {
  console.log('=================================================');
  console.log('        NETTORIA SERVER TEST SUITE');
  console.log('=================================================\n');
  
  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('\n⚠️ Database connection issues detected. Some tests may fail.');
  }
  
  // Test direct SMS integration
  await testDirectSms();
  
  // Test user registration and authentication
  const registrationData = await testRegistration();
  
  let authToken = null;
  
  if (registrationData) {
    authToken = registrationData.token;
    
    if (!authToken) {
      // Try various login methods if registration didn't return a token
      console.log('\nTrying login with registered credentials...');
      
      authToken = await testEmailLogin(registrationData.email, registrationData.password);
      
      if (!authToken) {
        authToken = await testPhoneLogin(registrationData.phoneNumber, registrationData.password);
      }
      
      if (!authToken) {
        authToken = await testIdentifierLogin(registrationData.email, registrationData.password);
      }
    }
  }
  
  // If we have a token, test authenticated endpoints
  if (authToken) {
    await testUserProfile(authToken);
    await testSmsCredit(authToken);
    await testSmsSending(authToken, registrationData ? registrationData.phoneNumber : '09109924707');
  } else {
    console.log('\n⚠️ Authentication failed. Skipping authenticated endpoint tests.');
  }
  
  // Print test summary
  console.log('\n=================================================');
  console.log('                TEST SUMMARY');
  console.log('=================================================');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  // Print details of failed tests
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    Object.keys(results.tests).forEach(testName => {
      if (!results.tests[testName].success) {
        console.log(`\n${testName}:`);
        console.log(`Error: ${results.tests[testName].error}`);
      }
    });
  }
  
  // Final summary about SMS functionality
  console.log('\n=================================================');
  console.log('             SMS FUNCTIONALITY STATUS');
  console.log('=================================================');
  
  const directSmsSuccess = results.tests['Direct SMS Credit Check']?.success;
  const apiSmsSuccess = results.tests['SMS Credit API']?.success;
  
  if (directSmsSuccess) {
    console.log('✅ Direct SMS integration is working correctly');
    console.log(`   SMS API Key: ${process.env.SMS_API_KEY.substring(0, 10)}...`);
    console.log(`   SMS Line Number: ${process.env.SMS_LINE_NUMBER}`);
  } else {
    console.log('❌ Direct SMS integration has issues');
  }
  
  if (apiSmsSuccess) {
    console.log('✅ SMS API endpoints are working correctly');
  } else {
    console.log('❌ SMS API endpoints have issues');
  }
}

// Run all tests
runTests(); 