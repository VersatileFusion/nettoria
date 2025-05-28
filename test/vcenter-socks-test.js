/**
 * vCenter Connection Test using SOCKS proxy
 * This script tests connecting to vCenter via a SOCKS proxy
 */

const SocksClient = require('socks').SocksClient;
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

// Parse SOCKS proxy URL
function parseSocksUrl(socksUrl) {
  // Format: socks5://username:password@proxy-host:port
  try {
    const url = new URL(socksUrl);
    const auth = url.username ? { username: url.username, password: url.password } : undefined;
    
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 1080,
      type: url.protocol.startsWith('socks5') ? 5 : 4,
      userId: url.username,
      password: url.password
    };
  } catch (error) {
    throw new Error(`Invalid SOCKS URL: ${error.message}`);
  }
}

// Test connection to server using SOCKS proxy
async function testConnection(targetHost, targetPort = 443, path = '/', socksOptions = null) {
  return new Promise((resolve, reject) => {
    if (!socksOptions) {
      reject(new Error('No SOCKS proxy configuration provided'));
      return;
    }
    
    // Establish connection through the SOCKS proxy
    SocksClient.createConnection({
      proxy: socksOptions,
      command: 'connect',
      destination: {
        host: targetHost,
        port: targetPort
      },
      timeout: 10000
    }).then(info => {
      // Connection established, now make an HTTPS request
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignore SSL certificate issues
      
      const socket = info.socket;
      
      const options = {
        createConnection: () => socket,
        path: path,
        method: 'GET',
        headers: {
          'Host': targetHost,
          'Accept': 'application/json'
        }
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
      
    }).catch(error => {
      reject(error);
    });
  });
}

// Main function
async function main() {
  try {
    console.log('=== vCenter SOCKS Proxy Test ===\n');
    
    // Get hostname from user
    let hostname;
    if (process.env.VCENTER_HOST) {
      hostname = process.env.VCENTER_HOST;
      console.log(`Using hostname from env: ${hostname}`);
    } else {
      hostname = await promptUserInput('Enter vCenter hostname: ');
    }
    
    // Get SOCKS proxy URL
    let socksUrl = process.env.PROXY_URL;
    if (!socksUrl || !socksUrl.toLowerCase().startsWith('socks')) {
      socksUrl = await promptUserInput('Enter SOCKS proxy URL (e.g., socks5://proxy:1080): ');
    }
    
    // Get port number
    const port = parseInt(await promptUserInput('Enter port (default: 443): ') || '443', 10);
    
    console.log(`\nTesting connection to ${hostname}:${port} via SOCKS proxy ${socksUrl}...`);
    
    // Parse SOCKS URL
    const socksOptions = parseSocksUrl(socksUrl);
    console.log(`Using SOCKS${socksOptions.type} proxy ${socksOptions.host}:${socksOptions.port}`);
    
    // Test base connection
    try {
      const response = await testConnection(hostname, port, '/', socksOptions);
      console.log(`✅ Connection successful! Status: ${response.statusCode}`);
      
      // Test endpoints
      const endpoints = [
        { path: '/sdk', name: 'SOAP API' },
        { path: '/rest', name: 'REST API' },
        { path: '/ui', name: 'Web Client UI' }
      ];
      
      console.log('\nTesting vCenter endpoints:');
      
      for (const endpoint of endpoints) {
        try {
          const endpointResponse = await testConnection(hostname, port, endpoint.path, socksOptions);
          console.log(`✅ ${endpoint.name} (${endpoint.path}): Status ${endpointResponse.statusCode}`);
        } catch (endpointError) {
          console.error(`❌ ${endpoint.name} (${endpoint.path}): ${endpointError.message}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Connection failed: ${error.message}`);
    }
    
    console.log('\nTest complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 