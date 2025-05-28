/**
 * vCenter REST API Authentication Test
 * Tests simple authentication with vCenter REST API
 */

const axios = require('axios');
const readline = require('readline');
const https = require('https');

// Create readline interface for user input
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

// Main function to test vCenter REST API auth
async function testVCenterRestAuth() {
  try {
    console.log('=== vCenter REST API Authentication Test ===\n');
    
    // Get vCenter credentials from user
    const vcenterHost = await promptUserInput('Enter vCenter hostname or IP: ');
    const username = await promptUserInput('Enter vCenter username: ');
    const password = await promptUserInput('Enter vCenter password: ');
    const ignoreCert = (await promptUserInput('Ignore SSL certificate errors? (y/n): ')).toLowerCase() === 'y';
    
    // Create axios instance with SSL verification disabled if requested
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: !ignoreCert
      })
    });
    
    console.log(`\nAttempting to authenticate with vCenter at ${vcenterHost}...`);
    
    // First, get a session token
    const authUrl = `https://${vcenterHost}/rest/com/vmware/cis/session`;
    
    try {
      const authResponse = await axiosInstance.post(authUrl, {}, {
        auth: {
          username,
          password
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const sessionId = authResponse.data.value;
      console.log('✅ Authentication successful!');
      console.log('Session ID:', sessionId);
      
      // Now try to get some basic system information to verify API access
      console.log('\nFetching vCenter system information...');
      
      // Get API information
      const apiInfoUrl = `https://${vcenterHost}/rest/appliance/system/version`;
      const apiInfoResponse = await axiosInstance.get(apiInfoUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'vmware-api-session-id': sessionId
        }
      });
      
      const versionInfo = apiInfoResponse.data.value;
      console.log('\nvCenter Version Information:');
      console.log(`- Version: ${versionInfo.version}`);
      console.log(`- Build: ${versionInfo.build}`);
      console.log(`- Product: ${versionInfo.product}`);
      
      // Get health status
      const healthUrl = `https://${vcenterHost}/rest/appliance/health/system`;
      const healthResponse = await axiosInstance.get(healthUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'vmware-api-session-id': sessionId
        }
      });
      
      console.log(`\nSystem Health: ${healthResponse.data.value}`);
      
      // Get VM information
      const vmsUrl = `https://${vcenterHost}/rest/vcenter/vm`;
      const vmsResponse = await axiosInstance.get(vmsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'vmware-api-session-id': sessionId
        }
      });
      
      const vms = vmsResponse.data.value;
      console.log(`\nFound ${vms.length} VMs:`);
      for (let i = 0; i < Math.min(vms.length, 10); i++) {
        const vm = vms[i];
        console.log(`- Name: ${vm.name}, Power State: ${vm.power_state}, VM ID: ${vm.vm}`);
      }
      
      if (vms.length > 10) {
        console.log(`  (and ${vms.length - 10} more...)`);
      }
      
      console.log('\n✅ API test completed successfully!');
    } catch (error) {
      console.error('❌ API request failed:', error.message);
      
      if (error.response) {
        console.error('Status code:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 401) {
          console.error('\nAuthentication failed. Please check your credentials.');
        } else if (error.response.status === 503) {
          console.error('\nService unavailable. The vCenter Server might be starting up or under heavy load.');
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.error('\nConnection refused. Please check if the vCenter host is correct and accessible.');
      } else if (error.code === 'ENOTFOUND') {
        console.error('\nHost not found. Please check the hostname or IP address.');
      } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
        console.error('\nSSL certificate error. Try again with the "ignore SSL certificate errors" option set to "y".');
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
testVCenterRestAuth().catch(err => {
  console.error('Unhandled error:', err);
  rl.close();
}); 