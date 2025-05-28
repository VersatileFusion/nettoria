/**
 * vCenter API Test Script (Fixed Version)
 */

const https = require('https');
const axios = require('axios');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for user input
function promptUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function to test vCenter connection and API
async function testVCenterConnection() {
  try {
    console.log('=== vCenter SOAP API Connection Test ===\n');
    
    // Get vCenter credentials from user
    const vcenterHost = await promptUserInput('Enter vCenter hostname or IP (without https://): ');
    const username = await promptUserInput('Enter vCenter username: ');
    const password = await promptUserInput('Enter vCenter password: ');
    const ignoreCert = (await promptUserInput('Ignore SSL certificate errors? (y/n): ')).toLowerCase() === 'y';
    
    // Create axios instance with SSL verification disabled if requested
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: !ignoreCert
      })
    });
    
    console.log(`\nAttempting to connect to vCenter at ${vcenterHost}...`);
    
    // Test connection using simple sessionManager API call
    const soapUrl = `https://${vcenterHost}/sdk`;
    
    // Basic SOAP envelope for vSphere login
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <Body>
      <Login xmlns="urn:vim25">
         <_this type="SessionManager">SessionManager</_this>
         <userName>${username}</userName>
         <password>${password}</password>
      </Login>
   </Body>
</Envelope>`;
    
    try {
      // Make SOAP request
      const response = await axiosInstance.post(soapUrl, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'urn:vim25/6.0'
        }
      });
      
      if (response.status === 200) {
        console.log('✅ Successfully connected to vCenter SOAP API!');
        
        // Check if we got a fault
        if (response.data.includes('<faultstring>')) {
          const faultMatch = response.data.match(/<faultstring>(.*?)<\/faultstring>/);
          if (faultMatch && faultMatch[1]) {
            console.error(`❌ SOAP Fault: ${faultMatch[1]}`);
          } else {
            console.error('❌ SOAP Fault detected but couldn\'t extract message');
          }
        } else {
          console.log('✅ Login successful!');
          
          // Extract session key if available
          const sessionKeyMatch = response.data.match(/<returnval>(.*?)<\/returnval>/);
          if (sessionKeyMatch && sessionKeyMatch[1]) {
            console.log(`Session key: ${sessionKeyMatch[1]}`);
          }
        }
      } else {
        console.error(`❌ HTTP Error: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ API request failed:', error.message);
      
      if (error.response) {
        console.error('Status code:', error.response.status);
        if (error.response.status === 401) {
          console.error('Authentication failed. Please check your credentials.');
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused. Please check if the vCenter host is correct and accessible.');
        console.error('This could be due to:');
        console.error('1. The vCenter server is not running');
        console.error('2. A firewall is blocking the connection');
        console.error('3. The hostname/IP address is incorrect');
      } else if (error.code === 'ENOTFOUND') {
        console.error('Host not found. Please check the hostname or IP address.');
      } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
        console.error('SSL certificate error. Try again with the "ignore SSL certificate errors" option set to "y".');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error during vCenter API test:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    rl.close();
  }
}

// Run the test
testVCenterConnection().catch(err => {
  console.error('Unhandled error:', err);
  rl.close();
}); 