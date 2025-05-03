/**
 * SMS Service Test Script
 * 
 * This script tests the SMS.ir integration with the correct line number: 983000211985
 */

const { Smsir } = require('smsir-js');
const readline = require('readline');

// Configuration
const config = {
  SMS_API_KEY: 'RY77WbBDE1Ztu2FJpSItlvQ4sE0n8Kqz9jTVmytnOhwujUAP',
  SMS_LINE_NUMBER: '983000211985',
  SMS_VERIFICATION_TEMPLATE_ID: '100000'
};

console.log('=== SMS.ir API Test ===');
console.log('API Key:', config.SMS_API_KEY ? '***' + config.SMS_API_KEY.substring(config.SMS_API_KEY.length - 4) : 'not set');
console.log('Line Number:', config.SMS_LINE_NUMBER);

// Initialize SMS client
const smsClient = new Smsir(config.SMS_API_KEY, config.SMS_LINE_NUMBER);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test functions
async function checkCredit() {
  try {
    console.log('\n1. Checking credit balance...');
    const response = await smsClient.getCredit();
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error checking credit:', error.message);
    if (error.response && error.response.data) {
      console.error('API Error details:', error.response.data);
    }
    throw error;
  }
}

async function sendTestSMS(phoneNumber) {
  try {
    console.log(`\n2. Sending a test SMS to ${phoneNumber}...`);
    const response = await smsClient.SendBulk(
      'This is a test message from Nettoria',
      [phoneNumber],
      null,  // SendDateTime (null for immediate sending)
      null   // line_number (use default)
    );
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    if (error.response && error.response.data) {
      console.error('API Error details:', error.response.data);
    }
    throw error;
  }
}

async function sendTestVerification(phoneNumber) {
  try {
    console.log(`\n3. Sending a verification code to ${phoneNumber}...`);
    const parameters = [
      { name: 'CODE', value: '123456' }
    ];
    
    const response = await smsClient.SendVerifyCode(
      phoneNumber,
      config.SMS_VERIFICATION_TEMPLATE_ID,
      parameters
    );
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error sending verification:', error.message);
    if (error.response && error.response.data) {
      console.error('API Error details:', error.response.data);
    }
    throw error;
  }
}

// Main test function
async function runTests(phoneNumber) {
  try {
    // Test 1: Check credit
    await checkCredit();
    
    if (phoneNumber) {
      // Test 2: Send regular SMS
      await sendTestSMS(phoneNumber);
      
      // Test 3: Send verification code
      await sendTestVerification(phoneNumber);
    }
    
    console.log('\n✅ Tests completed');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
  } finally {
    rl.close();
  }
}

// Ask for a phone number
rl.question('Enter a phone number to test SMS sending (or press Enter to skip): ', (answer) => {
  const phoneNumber = answer.trim();
  if (phoneNumber) {
    console.log(`Will test SMS sending to number: ${phoneNumber}`);
    runTests(phoneNumber);
  } else {
    console.log('Skipping SMS sending tests...');
    runTests();
  }
}); 