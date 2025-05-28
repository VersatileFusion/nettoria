/**
 * TLS Version Test
 * Tests connections with different TLS versions
 */

const tls = require('tls');
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

// Test TLS connection with specific version
function testTlsVersion(host, port, version, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const options = {
      host: host,
      port: port,
      rejectUnauthorized: false, // Ignore certificate validation issues
      timeout: timeout,
      secureContext: tls.createSecureContext({
        secureProtocol: version
      })
    };
    
    console.log(`Testing ${version}...`);
    
    const socket = tls.connect(options, () => {
      const protocol = socket.getProtocol();
      console.log(`✅ Connected using: ${protocol}`);
      socket.end();
      resolve({
        success: true,
        protocol: protocol
      });
    });
    
    socket.on('error', (error) => {
      console.error(`❌ Failed: ${error.message}`);
      reject({
        success: false,
        error: error.message
      });
    });
    
    socket.on('timeout', () => {
      console.error('❌ Connection timeout');
      socket.destroy();
      reject({
        success: false,
        error: 'Connection timeout'
      });
    });
  });
}

// Main function
async function main() {
  try {
    console.log('=== TLS Version Test ===\n');
    
    const host = await promptUserInput('Enter hostname: ');
    const port = parseInt(await promptUserInput('Enter port (default: 443): ') || '443', 10);
    
    console.log(`\nTesting TLS connections to ${host}:${port}...\n`);
    
    // Test different TLS versions
    const versions = [
      { name: 'TLS 1.0', protocol: 'TLSv1_method' },
      { name: 'TLS 1.1', protocol: 'TLSv1_1_method' },
      { name: 'TLS 1.2', protocol: 'TLSv1_2_method' },
      { name: 'TLS 1.3', protocol: 'TLSv1_3_method' },
      { name: 'Default (Auto)', protocol: 'SSLv23_method' }
    ];
    
    const results = [];
    
    for (const version of versions) {
      try {
        console.log(`Testing ${version.name}...`);
        const result = await testTlsVersion(host, port, version.protocol);
        results.push({
          version: version.name,
          success: true,
          protocol: result.protocol
        });
      } catch (error) {
        results.push({
          version: version.name,
          success: false,
          error: error.error
        });
      }
      console.log(); // Add a blank line between tests
    }
    
    // Summary
    console.log('\n=== Results Summary ===');
    for (const result of results) {
      if (result.success) {
        console.log(`✅ ${result.version}: Connected using ${result.protocol}`);
      } else {
        console.log(`❌ ${result.version}: Failed - ${result.error}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 