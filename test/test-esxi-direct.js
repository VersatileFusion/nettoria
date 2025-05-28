/**
 * ESXi Direct Connection Test Script
 * 
 * This script tests connection directly to an ESXi host using both REST and SOAP APIs
 * Sometimes ESXi hosts are more accessible than vCenter servers
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const { URL } = require('url');

// Configure TLS and debug options
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Disable SSL verification for testing
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first"; // Force IPv4 first

// IP address override if hostname resolution is causing problems
const IP_OVERRIDE = "84.241.8.88"; // Based on earlier DNS resolution

// Load environment variables from esxi-test.env or vcenter-test.env file
function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Environment file ${filePath} not found, checking fallback options...`);
      return {};
    }
    
    const envContent = fs.readFileSync(filePath, "utf-8");
    const envVars = {};

    // Parse each line in the env file
    envContent.split("\n").forEach((line) => {
      line = line.trim();
      // Skip empty lines and comments
      if (!line || line.startsWith("#")) return;

      // Split by the first equals sign
      const index = line.indexOf("=");
      if (index !== -1) {
        const key = line.slice(0, index).trim();
        let value = line.slice(index + 1).trim();

        // Remove surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
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

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test basic HTTP/HTTPS connectivity to a host
 */
async function testBasicConnectivity(hostname, port = 443) {
  return new Promise((resolve, reject) => {
    console.log(`Testing basic connection to ${hostname}:${port}...`);
    
    const req = https.request({
      hostname,
      port,
      path: '/',
      method: 'GET',
      rejectUnauthorized: false,
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'Cache-Control': 'no-cache'
      }
    }, (res) => {
      console.log(`✅ Server responded with status code: ${res.statusCode}`);
      
      // Log response headers to see if we can identify the server type
      console.log('Response headers:');
      Object.keys(res.headers).forEach(key => {
        console.log(`  ${key}: ${res.headers[key]}`);
      });
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response length: ${data.length} bytes`);
        
        // Try to determine if this is an ESXi host
        const isEsxiLikely = 
          data.includes('VMware') || 
          data.includes('ESXi') || 
          (res.headers['server'] && res.headers['server'].includes('VMware'));
          
        if (isEsxiLikely) {
          console.log('✅ Server appears to be VMware ESXi/vSphere related');
        }
        
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      console.warn(`⚠️ Basic connectivity test failed: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.warn('⚠️ Basic connectivity test timed out');
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Test connection to ESXi host API endpoints
 */
async function testESXiDirectAPI(host, username, password) {
  console.log("\n=== Testing Direct ESXi Host Connection ===");
  
  // Check common ports for ESXi
  const portsToTest = [443, 8443, 9443, 902];
  let connectedPort = null;
  
  for (const port of portsToTest) {
    if (await testBasicConnectivity(host, port)) {
      console.log(`Successfully connected to port ${port}`);
      connectedPort = port;
      break;
    } else {
      console.log(`Could not connect to port ${port}`);
    }
  }
  
  if (!connectedPort) {
    console.error("❌ Failed to connect to any common ESXi ports");
    return false;
  }
  
  // Create an axios instance for API calls
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
      timeout: 15000
    }),
    timeout: 30000,
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Connection': 'keep-alive'
    }
  });
  
  // Test ESXi REST API endpoints
  const apiEndpoints = [
    { name: 'ESXi Host API', url: `https://${host}/ui/` },
    { name: 'ESXi MOB', url: `https://${host}/mob/` },
    { name: 'ESXi SDK', url: `https://${host}/sdk/` },
    { name: 'ESXi API', url: `https://${host}/api/` }
  ];
  
  console.log("\nTesting ESXi API endpoints:");
  
  for (const endpoint of apiEndpoints) {
    try {
      console.log(`Trying ${endpoint.name}: ${endpoint.url}`);
      
      const response = await axiosInstance.get(endpoint.url, {
        validateStatus: () => true,
        auth: {
          username,
          password
        },
        timeout: 10000
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (response.status >= 200 && response.status < 400) {
        console.log(`✅ Successfully accessed ${endpoint.name}`);
        
        // If we get a successful response, check if authentication is required
        if (response.status === 200) {
          console.log('Endpoint accessible without authentication');
        } else if (response.status === 302 || response.status === 307) {
          console.log('Endpoint redirected - likely requires authentication');
        }
        
        // Try to authenticate if we got a redirect or auth challenge
        if (response.status === 302 || response.status === 307 || response.status === 401) {
          try {
            const authResponse = await axiosInstance.get(endpoint.url, {
              auth: {
                username,
                password
              },
              maxRedirects: 5,
              validateStatus: () => true
            });
            
            console.log(`Authentication response: ${authResponse.status}`);
            
            if (authResponse.status >= 200 && authResponse.status < 300) {
              console.log('✅ Authentication successful!');
            } else {
              console.log('❌ Authentication failed');
            }
          } catch (authError) {
            console.log(`Authentication error: ${authError.message}`);
          }
        }
      } else if (response.status === 401) {
        console.log('Endpoint requires authentication');
      } else {
        console.log('Endpoint not accessible or not recognized');
      }
    } catch (error) {
      console.log(`Error accessing ${endpoint.name}: ${error.message}`);
    }
    
    // Add a small delay between requests
    await sleep(1000);
  }
  
  // Try to get system information through various methods
  console.log("\nAttempting to get ESXi system information...");
  
  try {
    // Try the about API if available
    const aboutUrl = `https://${host}/sdk/vimService.wsdl`;
    const response = await axiosInstance.get(aboutUrl, {
      auth: {
        username,
        password
      },
      validateStatus: () => true
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Successfully retrieved system information');
      
      // Check if response contains version info
      const versionMatch = response.data.match(/version="([^"]+)"/);
      if (versionMatch) {
        console.log(`ESXi Version: ${versionMatch[1]}`);
      }
    } else {
      console.log(`Could not get system information: Status ${response.status}`);
    }
  } catch (error) {
    console.log(`Error getting system information: ${error.message}`);
  }
  
  return true;
}

// Main function to test ESXi direct connection
async function main() {
  try {
    console.log("=== ESXi Direct Connection Test ===\n");

    // First try to load ESXi-specific credentials
    let envPath = path.resolve(__dirname, "esxi-test.env");
    let env = loadEnvFile(envPath);
    
    // If ESXi credentials not found, fall back to vCenter credentials
    if (!env.ESXI_HOST || !env.ESXI_USER || !env.ESXI_PASS) {
      console.log("ESXi-specific credentials not found, falling back to vCenter credentials");
      envPath = path.resolve(__dirname, "vcenter-test.env");
      env = loadEnvFile(envPath);
      
      // Map vCenter credentials to ESXi if needed
      if (env.VCENTER_HOST && !env.ESXI_HOST) env.ESXI_HOST = env.VCENTER_HOST;
      if (env.VCENTER_USER && !env.ESXI_USER) env.ESXI_USER = env.VCENTER_USER;
      if (env.VCENTER_PASS && !env.ESXI_PASS) env.ESXI_PASS = env.VCENTER_PASS;
    }

    if (!env.ESXI_HOST) {
      console.error("❌ No ESXi host specified in environment files");
      console.log("Please create esxi-test.env or vcenter-test.env with ESXI_HOST, ESXI_USER, ESXI_PASS");
      return;
    }
    
    // Parse host to ensure it doesn't include protocol
    let esxiHost = env.ESXI_HOST;
    try {
      // Check if it's already a URL with protocol
      if (esxiHost.includes("://")) {
        const parsedUrl = new URL(esxiHost);
        esxiHost = parsedUrl.hostname;
        console.log(`Extracted hostname from URL: ${esxiHost}`);
      }
    } catch (e) {
      // Not a URL with protocol, use as is
    }

    // If IP override is enabled, use it instead
    const originalHost = esxiHost;
    if (IP_OVERRIDE) {
      console.log(`Using IP override: ${IP_OVERRIDE} instead of hostname ${esxiHost}`);
      esxiHost = IP_OVERRIDE;
    }
    
    console.log(`ESXi Host: ${esxiHost}`);
    console.log(`ESXi User: ${env.ESXI_USER || '<not set>'}`);
    
    await testESXiDirectAPI(
      esxiHost, 
      env.ESXI_USER || env.VCENTER_USER, 
      env.ESXI_PASS || env.VCENTER_PASS
    );
  } catch (error) {
    console.error("Error during ESXi test:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}

// Run the main function
console.log("Starting ESXi direct connection test...");
main().catch(console.error); 