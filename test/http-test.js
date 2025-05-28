/**
 * Simple HTTP connection test
 * Tests plain HTTP connection instead of HTTPS
 */

const http = require('http');
const net = require('net');
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

// Test raw TCP connection
function testTcpConnection(host, port, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`✅ TCP connection to ${host}:${port} successful`);
      socket.end();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.error(`❌ TCP connection error: ${err.message}`);
      reject(err);
    });
    
    socket.on('timeout', () => {
      console.error(`❌ TCP connection timeout`);
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    
    socket.connect(port, host);
  });
}

// Test HTTP connection
function testHttpConnection(host, port, path = '/', timeout = 5000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: timeout,
      headers: {
        'Host': host,
        'User-Agent': 'Mozilla/5.0 vCenter Connection Test',
        'Accept': '*/*'
      }
    };
    
    const req = http.request(options, (res) => {
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
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('=== HTTP Connection Test ===\n');
    
    const host = await promptUserInput('Enter hostname: ');
    const port = parseInt(await promptUserInput('Enter port (default: 80): ') || '80', 10);
    
    // Test TCP connection first
    console.log('\nTesting TCP connection...');
    try {
      await testTcpConnection(host, port);
    } catch (error) {
      console.error(`TCP connection failed: ${error.message}`);
    }
    
    // Test HTTP connection
    console.log('\nTesting HTTP connection...');
    try {
      const response = await testHttpConnection(host, port);
      console.log(`✅ HTTP response: ${response.statusCode}`);
      console.log('Headers:', JSON.stringify(response.headers, null, 2));
      console.log('Response data (first 200 chars):');
      console.log(response.data.substring(0, 200) + (response.data.length > 200 ? '...' : ''));
    } catch (error) {
      console.error(`❌ HTTP connection failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 