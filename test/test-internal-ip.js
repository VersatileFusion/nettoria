/**
 * Basic vCenter Internal IP Connectivity Test
 * Tests basic connectivity to the vCenter server IP
 */

const { exec } = require('child_process');
const net = require('net');
const https = require('https');
const axios = require('axios');

// Configuration
const VCENTER_IP = '192.168.120.246';
const VCENTER_PORT = 443;
const TIMEOUT = 30000; // Increased from 10000 to 30000 (30 seconds)
const PING_COUNT = 10; // Increased from 5 to 10
const MAX_RETRIES = 3; // Add retry mechanism

/**
 * Run ping test
 */
function pingTest() {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ping to ${VCENTER_IP}...`);
    
    // Windows ping command with increased count
    const pingCmd = `ping -n ${PING_COUNT} ${VCENTER_IP}`;
    
    exec(pingCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Ping failed: ${error.message}`);
        resolve(false);
        return;
      }
      
      if (stderr) {
        console.error(`❌ Ping error: ${stderr}`);
        resolve(false);
        return;
      }
      
      // Check if ping was successful
      if (stdout.includes('Reply from')) {
        console.log('✅ Ping successful!');
        
        // Extract statistics
        const match = stdout.match(/Packets: Sent = (\d+), Received = (\d+), Lost = (\d+)/);
        if (match) {
          const [, sent, received, lost] = match;
          const lossPercent = Math.round((lost / sent) * 100);
          console.log(`   Packets: Sent = ${sent}, Received = ${received}, Lost = ${lost} (${lossPercent}% loss)`);
          
          // Extract average round trip time
          const rtMatch = stdout.match(/Average = (\d+)ms/);
          if (rtMatch) {
            console.log(`   Average round-trip time: ${rtMatch[1]}ms`);
          }
          
          // Consider test successful even with some packet loss
          if (received > 0) {
            console.log(`   Connection established but with ${lossPercent}% packet loss`);
            resolve(true);
          } else {
            console.error('❌ Ping failed - 100% packet loss');
            resolve(false);
          }
        } else {
          resolve(true);
        }
      } else {
        console.error('❌ Ping failed - no reply received');
        resolve(false);
      }
    });
  });
}

/**
 * Helper function to retry operations
 */
async function withRetry(operation, name, maxRetries = MAX_RETRIES) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`Retry attempt ${attempt}/${maxRetries} for ${name}...`);
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s...
        console.log(`Waiting ${delay}ms before next retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error(`All ${maxRetries} attempts failed`);
}

/**
 * Test TCP connection
 */
function tcpTest() {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing TCP connection to ${VCENTER_IP}:${VCENTER_PORT}...`);
    
    let retryCount = 0;
    const maxRetries = MAX_RETRIES;
    
    const attemptConnection = () => {
      const socket = new net.Socket();
      let connected = false;
      
      socket.setTimeout(TIMEOUT);
      
      socket.on('connect', () => {
        console.log('✅ TCP connection successful!');
        connected = true;
        socket.end();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        console.error('❌ TCP connection timed out');
        socket.destroy();
        
        if (!connected) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying TCP connection (${retryCount}/${maxRetries})...`);
            setTimeout(attemptConnection, 2000); // Wait 2 seconds between retries
          } else {
            console.error(`Failed after ${maxRetries} attempts`);
            resolve(false);
          }
        }
      });
      
      socket.on('error', (err) => {
        console.error(`❌ TCP connection failed: ${err.message}`);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying TCP connection (${retryCount}/${maxRetries})...`);
          setTimeout(attemptConnection, 2000);
        } else {
          console.error(`Failed after ${maxRetries} attempts`);
          resolve(false);
        }
      });
      
      socket.on('close', () => {
        if (connected) {
          resolve(true);
        }
      });
      
      socket.connect(VCENTER_PORT, VCENTER_IP);
    };
    
    attemptConnection();
  });
}

/**
 * Test HTTPS connection
 */
async function httpsTest() {
  console.log(`\n🔍 Testing HTTPS connection to https://${VCENTER_IP}/...`);
  
  try {
    const result = await withRetry(async () => {
      const response = await axios.get(`https://${VCENTER_IP}/`, {
        timeout: TIMEOUT,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Accept self-signed certificates
          keepAlive: true, // Use keep-alive for better connection stability
        }),
        validateStatus: () => true, // Accept any status code
        maxRedirects: 5, // Handle redirects
        headers: {
          'User-Agent': 'Mozilla/5.0 vCenter Connection Test',
          'Connection': 'keep-alive'
        }
      });
      
      console.log(`✅ HTTPS connection successful! Status code: ${response.status}`);
      
      // Check if it's likely a vCenter server
      const isVCenter = 
        (response.headers['server'] && response.headers['server'].toLowerCase().includes('vmware')) ||
        (typeof response.data === 'string' && 
          (response.data.toLowerCase().includes('vmware') || 
           response.data.toLowerCase().includes('vcenter')));
      
      if (isVCenter) {
        console.log('✅ Confirmed VMware vCenter server!');
      } else {
        console.log('⚠️ Connected to server but not confirmed as VMware vCenter');
      }
      
      return true;
    }, 'HTTPS connection');
    
    return result;
  } catch (error) {
    console.error(`❌ HTTPS connection failed after all retries: ${error.message}`);
    return false;
  }
}

/**
 * Display summary of test results
 */
function displaySummary(results) {
  console.log('\n=== Connectivity Test Summary ===');
  console.log(`Ping test: ${results.ping ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TCP connection: ${results.tcp ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`HTTPS connection: ${results.https ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const passRate = Math.round((passCount / totalTests) * 100);
  
  console.log(`\nOverall: ${passCount}/${totalTests} tests passed (${passRate}%)`);
  
  if (passRate === 100) {
    console.log('\n✅ Connection to vCenter internal IP is working properly!');
  } else if (passRate >= 50) {
    console.log('\n⚠️ Connection is partially working. Some services may be unavailable.');
  } else {
    console.log('\n❌ Connection to vCenter internal IP is not working properly.');
    console.log('Please check your VPN connection and network settings.');
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('=== Starting vCenter Internal IP Connectivity Tests ===');
  console.log(`Target: ${VCENTER_IP}:${VCENTER_PORT}`);
  
  const results = {
    ping: false,
    tcp: false,
    https: false
  };
  
  // Run tests
  results.ping = await pingTest();
  
  // Continue with other tests even if ping has some packet loss
  if (results.ping) {
    results.tcp = await tcpTest();
    results.https = await httpsTest();
  } else {
    console.log('\n⚠️ Ping test failed. Continuing with TCP and HTTPS tests anyway...');
    results.tcp = await tcpTest();
    results.https = await httpsTest();
  }
  
  displaySummary(results);
}

// Start the tests
runAllTests();
