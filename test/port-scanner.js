/**
 * Simple TCP port scanner
 * Tests a range of ports on a given host
 */

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

// Test connection to a single port
function testPort(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = {
      port: port,
      open: false,
      error: null
    };

    // Set timeout
    socket.setTimeout(timeout);

    // Handle connection
    socket.on('connect', () => {
      status.open = true;
      socket.destroy();
      resolve(status);
    });

    // Handle errors
    socket.on('error', (err) => {
      status.error = err.message;
      resolve(status);
    });

    // Handle timeouts
    socket.on('timeout', () => {
      status.error = 'Connection timeout';
      socket.destroy();
      resolve(status);
    });

    // Try to connect
    socket.connect(port, host);
  });
}

// Test a range of ports
async function scanPorts(host, startPort, endPort) {
  const results = [];
  
  console.log(`Scanning ${host} for open ports (${startPort}-${endPort})...`);
  
  for (let port = startPort; port <= endPort; port++) {
    const status = await testPort(host, port);
    results.push(status);
    
    if (status.open) {
      console.log(`✅ Port ${port}: OPEN`);
    } else {
      console.log(`❌ Port ${port}: CLOSED (${status.error})`);
    }
  }
  
  return results;
}

// Main function
async function main() {
  try {
    console.log('=== Simple TCP Port Scanner ===\n');
    
    // Get hostname from user
    const hostname = await promptUserInput('Enter hostname to scan: ');
    
    // Get port range
    const startPort = parseInt(await promptUserInput('Enter start port (default: 443): ') || '443', 10);
    const endPort = parseInt(await promptUserInput('Enter end port (default: 9443): ') || '9443', 10);
    
    // Run port scan
    await scanPorts(hostname, startPort, endPort);
    
    console.log('\nScan complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 