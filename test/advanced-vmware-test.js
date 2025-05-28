/**
 * Advanced VMware Connection Test Script
 * 
 * This script performs comprehensive connectivity testing to VMware services including:
 * - TCP port scanning on common VMware ports
 * - SSL/TLS protocol version testing
 * - Custom header/parameter testing
 * - API protocol detection
 * 
 * Useful for diagnosing connectivity issues with vCenter or ESXi
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const net = require('net');
const tls = require('tls');
const axios = require('axios');
const { URL } = require('url');
const dns = require('dns').promises;

// Configure TLS and debug options
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Disable SSL verification for testing

// IP address override if hostname resolution is causing problems
const IP_OVERRIDE = "84.241.8.88"; // Based on earlier DNS resolution

// Settings for tests
const CONNECTION_TIMEOUT = 5000; // 5 seconds for basic connection tests
const REQUEST_TIMEOUT = 10000; // 10 seconds for API requests
const DETAILED_TLS_INFO = true; // Show detailed TLS info
const TEST_ALL_TLS_VERSIONS = true; // Test various TLS protocol versions

// Load environment variables from any env file
function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    
    const envContent = fs.readFileSync(filePath, "utf-8");
    const envVars = {};

    // Parse each line in the env file
    envContent.split("\n").forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;

      const index = line.indexOf("=");
      if (index !== -1) {
        const key = line.slice(0, index).trim();
        let value = line.slice(index + 1).trim();

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

// Sleep function for delays between requests
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test DNS resolution
 */
async function testDNS(hostname) {
  console.log(`\n=== Testing DNS resolution for ${hostname} ===`);
  
  try {
    // Try IPv4 resolution
    console.log("Resolving IPv4 addresses...");
    const ipv4Results = await dns.resolve4(hostname);
    console.log(`Found ${ipv4Results.length} IPv4 addresses:`);
    ipv4Results.forEach(ip => console.log(`  - ${ip}`));
    
    // Try IPv6 resolution (if available)
    try {
      console.log("\nResolving IPv6 addresses...");
      const ipv6Results = await dns.resolve6(hostname);
      console.log(`Found ${ipv6Results.length} IPv6 addresses:`);
      ipv6Results.forEach(ip => console.log(`  - ${ip}`));
    } catch (ipv6Error) {
      console.log("No IPv6 addresses found or IPv6 not supported");
    }
    
    // Get all DNS records
    console.log("\nChecking all DNS records...");
    const allRecords = await dns.resolveAny(hostname);
    console.log(`Found ${allRecords.length} DNS records of various types`);
    allRecords.forEach(record => {
      console.log(`  - Type: ${record.type}, Value: ${JSON.stringify(record)}`);
    });
    
    return true;
  } catch (error) {
    console.error(`❌ DNS resolution failed: ${error.message}`);
    return false;
  }
}

/**
 * Test TCP port connectivity
 */
async function testTcpPort(host, port) {
  return new Promise((resolve) => {
    console.log(`Testing TCP connection to ${host}:${port}...`);
    
    const socket = new net.Socket();
    let status = false;
    
    socket.setTimeout(CONNECTION_TIMEOUT);
    
    socket.on('connect', () => {
      status = true;
      console.log(`✅ Successfully connected to ${host}:${port}`);
      socket.end();
    });
    
    socket.on('timeout', () => {
      console.log(`Connection to ${host}:${port} timed out`);
      socket.destroy();
    });
    
    socket.on('error', (err) => {
      console.log(`Connection to ${host}:${port} failed: ${err.message}`);
    });
    
    socket.on('close', () => {
      resolve(status);
    });
    
    socket.connect(port, host);
  });
}

/**
 * Scan multiple TCP ports
 */
async function scanPorts(host, ports) {
  console.log(`\n=== Scanning TCP ports on ${host} ===`);
  const results = {};
  
  for (const port of ports) {
    results[port] = await testTcpPort(host, port);
    // Small delay to avoid overwhelming the target
    await sleep(300);
  }
  
  // Summary
  console.log("\nPort scan results:");
  for (const [port, open] of Object.entries(results)) {
    console.log(`  Port ${port}: ${open ? '✅ OPEN' : '❌ CLOSED/FILTERED'}`);
  }
  
  return results;
}

/**
 * Test TLS connection with specific protocol version
 */
async function testTlsConnection(host, port, protocolVersion = 'TLSv1.2') {
  return new Promise((resolve) => {
    console.log(`Testing TLS (${protocolVersion}) connection to ${host}:${port}...`);
    
    const options = {
      host: host,
      port: port,
      rejectUnauthorized: false,
      minVersion: protocolVersion,
      maxVersion: protocolVersion,
      timeout: CONNECTION_TIMEOUT
    };
    
    const socket = tls.connect(options, () => {
      const isAuthorized = socket.authorized || false;
      const protocol = socket.getProtocol() || 'unknown';
      const cipher = socket.getCipher() || { name: 'unknown' };
      
      console.log(`✅ TLS Connection established (${protocol})`);
      console.log(`  Authorized: ${isAuthorized}`);
      console.log(`  Protocol: ${protocol}`);
      console.log(`  Cipher: ${cipher.name}`);
      
      if (DETAILED_TLS_INFO) {
        // Get certificate info
        try {
          const cert = socket.getPeerCertificate(true);
          if (cert && Object.keys(cert).length > 0) {
            console.log("  Certificate Information:");
            console.log(`    Subject: ${cert.subject?.CN || 'Unknown'}`);
            console.log(`    Issuer: ${cert.issuer?.CN || 'Unknown'}`);
            console.log(`    Valid from: ${cert.valid_from || 'Unknown'}`);
            console.log(`    Valid to: ${cert.valid_to || 'Unknown'}`);
          }
        } catch (certErr) {
          console.log("  Could not retrieve certificate details");
        }
      }
      
      resolve({success: true, protocol, authorized: isAuthorized});
      socket.end();
    });
    
    socket.on('timeout', () => {
      console.log(`TLS connection to ${host}:${port} timed out`);
      socket.destroy();
      resolve({success: false, error: 'timeout'});
    });
    
    socket.on('error', (err) => {
      console.log(`TLS connection to ${host}:${port} failed: ${err.message}`);
      resolve({success: false, error: err.message});
    });
  });
}

/**
 * Test HTTP/HTTPS request with custom settings
 */
async function testHttpRequest(url, options = {}) {
  const { method = 'GET', headers = {}, auth = null } = options;
  
  console.log(`Testing HTTP request to ${url} (${method})`);
  
  // Add default headers
  const requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VMware Connectivity Test',
    'Connection': 'keep-alive',
    'Accept': '*/*',
    'Cache-Control': 'no-cache',
    ...headers
  };
  
  // Parse URL to determine protocol
  const parsedUrl = new URL(url);
  const useHttps = parsedUrl.protocol === 'https:';
  const httpModule = useHttps ? https : http;
  
  return new Promise((resolve) => {
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (useHttps ? 443 : 80),
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method,
      headers: requestHeaders,
      rejectUnauthorized: false,
      timeout: REQUEST_TIMEOUT
    };
    
    if (auth) {
      requestOptions.auth = `${auth.username}:${auth.password}`;
    }
    
    const req = httpModule.request(requestOptions, (res) => {
      console.log(`Response status: ${res.statusCode} ${res.statusMessage}`);
      
      // Log interesting headers
      const headersToShow = ['server', 'content-type', 'www-authenticate', 'set-cookie'];
      headersToShow.forEach(header => {
        if (res.headers[header]) {
          console.log(`  ${header}: ${res.headers[header]}`);
        }
      });
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Log response size and content type
        console.log(`  Response size: ${data.length} bytes`);
        
        // Detect if it's a VMware-related response
        const isVMwareRelated = 
          data.includes('VMware') || 
          data.includes('vSphere') ||
          data.includes('ESXi') ||
          (res.headers['server'] && res.headers['server'].includes('VMware'));
        
        if (isVMwareRelated) {
          console.log('  ✅ Response contains VMware-related content');
        }
        
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500), // Get first 500 chars only to avoid excessive logging
          dataLength: data.length,
          isVMwareRelated
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`HTTP request failed: ${error.message}`);
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('HTTP request timed out');
      resolve({
        success: false,
        error: 'timeout'
      });
    });
    
    req.end();
  });
}

/**
 * Test a VMware API endpoint (with authentication)
 */
async function testVMwareApiEndpoint(url, username, password) {
  // Try multiple auth methods
  const authMethods = [
    {
      name: 'Basic Auth in Headers',
      call: async () => {
        const authString = Buffer.from(`${username}:${password}`).toString('base64');
        return await testHttpRequest(url, {
          headers: {
            'Authorization': `Basic ${authString}`
          }
        });
      }
    },
    {
      name: 'Auth in URL Params',
      call: async () => {
        // Append auth params if not already in URL
        const hasParams = url.includes('?');
        const authUrl = `${url}${hasParams ? '&' : '?'}username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        return await testHttpRequest(authUrl);
      }
    },
    {
      name: 'HTTP Basic Auth',
      call: async () => {
        return await testHttpRequest(url, {
          auth: {
            username,
            password
          }
        });
      }
    }
  ];
  
  console.log(`\n=== Testing VMware API endpoint: ${url} ===`);
  
  for (const method of authMethods) {
    console.log(`\nTrying auth method: ${method.name}...`);
    try {
      const result = await method.call();
      
      if (result.success) {
        console.log(`✅ Successful response with ${method.name}`);
        return result;
      } else if (result.statusCode === 401 || result.statusCode === 403) {
        console.log(`❌ Authentication failed with ${method.name}`);
      } else {
        console.log(`⚠️ Unexpected response with ${method.name}: ${result.statusCode}`);
      }
    } catch (error) {
      console.log(`Error with ${method.name}: ${error.message}`);
    }
    
    // Small delay between attempts
    await sleep(1000);
  }
  
  console.log("All authentication methods failed");
  return { success: false };
}

/**
 * Main test function for VMware services
 */
async function testVMwareConnectivity(host, username, password) {
  // Test ports in order of importance
  const portsToTest = [
    443,    // HTTPS/API
    8443,   // Alternative API
    9443,   // VMware legacy
    902,    // VMware server
    903,    // VMware server backup
    5989,   // CIM service
    5988    // CIM HTTP
  ];
  
  // DNS test first
  await testDNS(host);
  
  // Port scanning
  const openPorts = await scanPorts(host, portsToTest);
  
  // Only test TLS on open ports
  const tlsVersionsToTest = TEST_ALL_TLS_VERSIONS ? 
    ['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'] : 
    ['TLSv1.2'];
  
  console.log("\n=== Testing TLS protocols ===");
  for (const port in openPorts) {
    if (openPorts[port]) {
      console.log(`\nTesting TLS protocols on port ${port}:`);
      for (const tlsVersion of tlsVersionsToTest) {
        await testTlsConnection(host, port, tlsVersion);
        await sleep(500); // Small delay between tests
      }
    }
  }
  
  // Test common VMware API endpoints
  console.log("\n=== Testing VMware API endpoints ===");
  
  const apiEndpoints = [
    // vCenter REST API endpoints
    { path: '/rest/com/vmware/cis/session', name: 'vCenter REST API Session' },
    { path: '/api/session', name: 'vCenter API Session' },
    { path: '/sdk/vimService.wsdl', name: 'vSphere SOAP SDK' },
    { path: '/ui/', name: 'vCenter UI' },
    { path: '/mob/', name: 'Managed Object Browser' },
    // ESXi specific paths
    { path: '/ui/', name: 'ESXi UI' },
    { path: '/sdk/', name: 'ESXi SDK' }
  ];
  
  // Filter based on open ports
  const portsToUse = Object.keys(openPorts).filter(port => openPorts[port]);
  if (portsToUse.length === 0) {
    console.log("No open ports found to test APIs");
    return;
  }
  
  for (const port of portsToUse) {
    console.log(`\nTesting APIs on port ${port}:`);
    
    for (const endpoint of apiEndpoints) {
      const apiUrl = `https://${host}:${port}${endpoint.path}`;
      console.log(`\nTesting ${endpoint.name}: ${apiUrl}`);
      
      // First test without auth
      const noAuthResult = await testHttpRequest(apiUrl);
      
      // If unauthorized response or we got success with no auth, try with auth
      if (noAuthResult.statusCode === 401 || 
          noAuthResult.statusCode === 403 || 
          (noAuthResult.success && username && password)) {
        
        console.log("Testing with authentication...");
        await testVMwareApiEndpoint(apiUrl, username, password);
      }
      
      await sleep(1000); // Delay between endpoint tests
    }
  }
}

// Main execution function
async function main() {
  try {
    console.log("=== Advanced VMware Connectivity Test ===\n");
    console.log("This tool tests comprehensive connectivity to VMware services");
    
    // Load credentials from environment files
    const envFiles = ['vmware-test.env', 'vcenter-test.env', 'esxi-test.env'];
    let credentials = {};
    
    for (const envFile of envFiles) {
      const envPath = path.resolve(__dirname, envFile);
      const env = loadEnvFile(envPath);
      
      if (Object.keys(env).length > 0) {
        console.log(`Loaded credentials from ${envFile}`);
        credentials = {
          // Combine all possible credential keys
          host: env.VMWARE_HOST || env.VCENTER_HOST || env.ESXI_HOST,
          username: env.VMWARE_USER || env.VCENTER_USER || env.ESXI_USER,
          password: env.VMWARE_PASS || env.VCENTER_PASS || env.ESXI_PASS
        };
        break;
      }
    }
    
    if (!credentials.host) {
      console.error("❌ No host found in any environment file");
      console.log("Please create one of these files: vmware-test.env, vcenter-test.env, or esxi-test.env");
      console.log("with VMWARE_HOST/VCENTER_HOST/ESXI_HOST, USER, and PASS variables");
      return;
    }
    
    // Parse host to ensure it doesn't include protocol
    let host = credentials.host;
    try {
      if (host.includes("://")) {
        const parsedUrl = new URL(host);
        host = parsedUrl.hostname;
        console.log(`Extracted hostname from URL: ${host}`);
      }
    } catch (e) {
      // Not a URL with protocol, use as is
    }
    
    // If IP override is enabled, use it instead
    const originalHost = host;
    if (IP_OVERRIDE) {
      console.log(`Using IP override: ${IP_OVERRIDE} instead of hostname ${host}`);
      host = IP_OVERRIDE;
    }
    
    console.log(`\nTarget: ${host}`);
    console.log(`Username: ${credentials.username || '<not set>'}`);
    console.log(`Password: ${credentials.password ? '<set>' : '<not set>'}`);
    
    await testVMwareConnectivity(
      host,
      credentials.username,
      credentials.password
    );
    
    console.log("\n=== Test Completed ===");
    
  } catch (error) {
    console.error("\nError during test execution:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}

// Run the main function
console.log("Starting advanced VMware connectivity test...");
main().catch(console.error); 