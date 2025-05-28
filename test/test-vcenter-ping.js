/**
 * vCenter Basic Connectivity Test
 * Simple script to check if the vCenter server is reachable
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const dns = require('dns');
const net = require('net');

// Load environment variables from vcenter-test.env file
function loadEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf-8');
    const envVars = {};
    
    // Parse each line in the env file
    envContent.split('\n').forEach(line => {
      line = line.trim();
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) return;
      
      // Split by the first equals sign
      const index = line.indexOf('=');
      if (index !== -1) {
        const key = line.slice(0, index).trim();
        let value = line.slice(index + 1).trim();
        
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error(`Error loading env file ${filePath}:`, error.message);
    return {};
  }
}

// DNS lookup promise wrapper
function dnsLookup(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        reject(err);
      } else {
        resolve({ address, family });
      }
    });
  });
}

// TCP connection test
function testTcpConnection(host, port, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    // Set timeout
    socket.setTimeout(timeout);
    
    // Handle connection success
    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });
    
    // Handle errors
    socket.on('error', (err) => {
      reject(err);
    });
    
    // Handle timeout
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    
    // Start connection attempt
    socket.connect(port, host);
  });
}

// HTTPS GET request
function testHttpsConnection(hostname, path = '/', timeout = 5000) {
  return new Promise((resolve, reject) => {
    // Disable SSL verification for testing
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const options = {
      hostname,
      port: 443,
      path,
      method: 'GET',
      timeout,
      rejectUnauthorized: false
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Main function to test vCenter connectivity
async function testVCenterConnectivity() {
  try {
    console.log('=== vCenter Basic Connectivity Test ===\n');
    
    // Load credentials from env file
    const envPath = path.resolve(__dirname, 'vcenter-test.env');
    console.log(`Loading configuration from ${envPath}`);
    const env = loadEnvFile(envPath);
    
    if (!env.VCENTER_HOST) {
      console.error('❌ Missing VCENTER_HOST in vcenter-test.env file!');
      process.exit(1);
    }
    
    const vcenterHost = env.VCENTER_HOST;
    console.log(`Testing connectivity to vCenter host: ${vcenterHost}\n`);
    
    // Test 1: DNS resolution
    console.log('Test 1: DNS resolution');
    try {
      const dnsResult = await dnsLookup(vcenterHost);
      console.log(`✅ DNS resolution successful: ${vcenterHost} resolves to ${dnsResult.address} (IPv${dnsResult.family})`);
    } catch (error) {
      console.error(`❌ DNS resolution failed: ${error.message}`);
      console.error('The hostname could not be resolved to an IP address.');
      return;
    }
    
    // Test 2: TCP connection to HTTPS port (443)
    console.log('\nTest 2: TCP connection to HTTPS port (443)');
    try {
      await testTcpConnection(vcenterHost, 443);
      console.log('✅ TCP connection successful: Port 443 is open and accepting connections');
    } catch (error) {
      console.error(`❌ TCP connection failed: ${error.message}`);
      console.error('Cannot establish a TCP connection to port 443.');
      console.error('This could be due to a firewall blocking the connection or the service not running.');
      return;
    }
    
    // Test 3: HTTPS connection
    console.log('\nTest 3: HTTPS connection');
    try {
      const result = await testHttpsConnection(vcenterHost);
      console.log(`✅ HTTPS connection successful: Server responded with status code ${result.statusCode}`);
      console.log(`Server responded with ${result.data.length} bytes of data`);
      
      // Check for vCenter-specific headers or content
      if (result.headers.server && result.headers.server.toLowerCase().includes('vmware')) {
        console.log('✅ Response contains VMware-specific server header.');
      } else {
        console.log('⚠️ Response does not contain VMware-specific server header.');
      }
      
      // Check for VMware or vCenter in response
      if (result.data.toLowerCase().includes('vmware') || result.data.toLowerCase().includes('vcenter')) {
        console.log('✅ Response contains VMware/vCenter-specific content.');
      } else {
        console.log('⚠️ Response does not contain obvious VMware/vCenter-specific content.');
      }
      
    } catch (error) {
      console.error(`❌ HTTPS connection failed: ${error.message}`);
      console.error('Cannot establish an HTTPS connection.');
      console.error('This could be due to SSL/TLS issues or the web server not responding properly.');
      return;
    }
    
    // Test 4: vCenter REST API endpoint check
    console.log('\nTest 4: vCenter REST API endpoint check');
    try {
      const result = await testHttpsConnection(vcenterHost, '/rest');
      console.log(`✅ REST API endpoint check: Server responded with status code ${result.statusCode}`);
      
      if (result.statusCode === 404) {
        console.log('⚠️ REST API endpoint returned 404 Not Found - this may be normal for some vCenter versions.');
      } else if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log('✅ REST API endpoint is available');
      }
    } catch (error) {
      console.error(`❌ REST API endpoint check failed: ${error.message}`);
    }
    
    console.log('\nSummary:');
    console.log('The vCenter server appears to be reachable.');
    console.log('If you are still having connection issues with the API, please check:');
    console.log('- Credentials are correct');
    console.log('- API endpoints are configured correctly');
    console.log('- Server is properly configured to accept API requests');
    console.log('- Network restrictions or firewall rules are not blocking specific API traffic');
    
  } catch (error) {
    console.error('\n❌ Error during connectivity test:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testVCenterConnectivity().catch(err => {
  console.error('Unhandled error:', err);
}); 