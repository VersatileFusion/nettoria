/**
 * vCenter Direct IP Address Connection Test
 * Simple connection test without proxy
 */

const dns = require('dns');
const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file if present
try {
  dotenv.config({ path: path.join(__dirname, 'vcenter-proxy-test.env') });
} catch (error) {
  console.log('No .env file found, continuing without it');
}

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

// Lookup IP address for hostname
function lookupIP(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ address, family });
    });
  });
}

// Test connection to server using IP address
async function testConnection(ip, hostname, port = 443, path = '/') {
  return new Promise((resolve, reject) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignore SSL certificate issues
    
    const options = {
      hostname: ip,
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'Host': hostname, // Important: Set the Host header to the original hostname
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
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
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('=== vCenter Direct IP Connection Test ===\n');
    
    // Get hostname from user
    let hostname;
    if (process.env.VCENTER_HOST) {
      hostname = process.env.VCENTER_HOST;
      console.log(`Using hostname from env: ${hostname}`);
    } else {
      hostname = await promptUserInput('Enter vCenter hostname: ');
    }
    
    // Get port number, default is 443
    let port = 443;
    const customPort = await promptUserInput('Enter port (default: 443): ');
    if (customPort && customPort.trim() !== '') {
      port = parseInt(customPort.trim(), 10);
      if (isNaN(port)) {
        console.log('Invalid port number, using default port 443');
        port = 443;
      }
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      hostname: hostname,
      port: port,
      dns: {
        success: false,
        ip: null,
        error: null
      },
      connection: {
        success: false,
        error: null,
        statusCode: null
      },
      ipAccess: {
        success: false,
        error: null,
        statusCode: null
      }
    };
    
    // Step 1: Lookup IP address
    console.log(`\nLooking up IP address for ${hostname}...`);
    try {
      const { address, family } = await lookupIP(hostname);
      console.log(`✅ Found IP address: ${address} (IPv${family})`);
      results.dns.success = true;
      results.dns.ip = address;
      
      // Step 2: Try connecting to the hostname directly first
      console.log(`\nTesting connection to hostname ${hostname} on port ${port}...`);
      try {
        const response = await testConnection(hostname, hostname, port);
        console.log(`✅ Connected to hostname: Status ${response.statusCode}`);
        results.connection.success = true;
        results.connection.statusCode = response.statusCode;
      } catch (error) {
        console.error(`❌ Failed to connect to hostname: ${error.message}`);
        results.connection.error = error.message;
      }
      
      // Step 3: Try connecting to IP address
      console.log(`\nTesting connection to IP address ${address} on port ${port} (using ${hostname} as Host header)...`);
      try {
        const response = await testConnection(address, hostname, port);
        console.log(`✅ Connected to IP address: Status ${response.statusCode}`);
        results.ipAccess.success = true;
        results.ipAccess.statusCode = response.statusCode;
      } catch (error) {
        console.error(`❌ Failed to connect to IP address: ${error.message}`);
        results.ipAccess.error = error.message;
      }
      
      // Step 4: Try SOAP and REST endpoints
      console.log('\nTesting vCenter SOAP and REST API endpoints...');
      
      const endpoints = [
        { path: '/sdk', name: 'SOAP API' },
        { path: '/rest', name: 'REST API' },
        { path: '/ui', name: 'Web Client UI' }
      ];
      
      results.endpoints = {};
      
      for (const endpoint of endpoints) {
        results.endpoints[endpoint.name] = { success: false, error: null };
        console.log(`\nTesting ${endpoint.name} endpoint (${endpoint.path})...`);
        
        try {
          // Try hostname first
          console.log(`  - via hostname ${hostname} on port ${port}...`);
          try {
            const response = await testConnection(hostname, hostname, port, endpoint.path);
            console.log(`    ✅ Hostname: Status ${response.statusCode}`);
            results.endpoints[endpoint.name].hostname = { success: true, statusCode: response.statusCode };
          } catch (error) {
            console.error(`    ❌ Hostname: ${error.message}`);
            results.endpoints[endpoint.name].hostname = { success: false, error: error.message };
          }
          
          // Try IP address
          console.log(`  - via IP ${address} on port ${port}...`);
          try {
            const response = await testConnection(address, hostname, port, endpoint.path);
            console.log(`    ✅ IP: Status ${response.statusCode}`);
            results.endpoints[endpoint.name].ip = { success: true, statusCode: response.statusCode };
            results.endpoints[endpoint.name].success = true;
          } catch (error) {
            console.error(`    ❌ IP: ${error.message}`);
            results.endpoints[endpoint.name].ip = { success: false, error: error.message };
          }
        } catch (error) {
          console.error(`  ❌ Error: ${error.message}`);
          results.endpoints[endpoint.name].error = error.message;
        }
      }
      
    } catch (dnsError) {
      console.error(`❌ DNS lookup failed: ${dnsError.message}`);
      results.dns.error = dnsError.message;
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`DNS Resolution: ${results.dns.success ? 'Success' : 'Failed'}`);
    if (results.dns.success) {
      console.log(`IP Address: ${results.dns.ip}`);
    }
    console.log(`Connection to hostname: ${results.connection.success ? 'Success' : 'Failed'}`);
    console.log(`Connection to IP address: ${results.ipAccess.success ? 'Success' : 'Failed'}`);
    
    if (results.endpoints) {
      console.log('\nEndpoint Results:');
      for (const [name, result] of Object.entries(results.endpoints)) {
        console.log(`- ${name}: ${result.success ? 'Accessible' : 'Not accessible'}`);
      }
    }
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(
      __dirname,
      `vcenter-ip-test-${timestamp}.json`
    );
    
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`\nTest results written to: ${filePath}`);
    
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 