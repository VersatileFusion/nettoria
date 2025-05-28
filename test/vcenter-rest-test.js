/**
 * vCenter REST API Connection Test
 * This script tests connectivity to vCenter using the REST API
 */

require('dotenv').config({ path: './vcenter-test.env' });
const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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

// Helper function to write test results to file
function writeResultsToFile(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(
    __dirname,
    `vcenter-rest-test-${timestamp}.json`
  );

  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`\nTest results written to: ${filePath}`);
}

// Helper function for making HTTPS requests
function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignore SSL certificate issues
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = data ? JSON.parse(data) : {};
        } catch (e) {
          parsedData = { raw: data };
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsedData
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

// vCenter REST API Tester Class
class VCenterRestTester {
  constructor(host, username, password) {
    this.host = host;
    this.username = username;
    this.password = password;
    this.sessionId = null;
    this.apiEndpoint = '/rest';
    
    this.testResults = {
      timestamp: new Date().toISOString(),
      connection: {
        success: false,
        error: null
      },
      auth: {
        success: false,
        error: null
      },
      datacenters: {
        success: false,
        count: 0,
        items: [],
        error: null
      },
      hosts: {
        success: false,
        count: 0,
        items: [],
        error: null
      },
      vms: {
        success: false,
        count: 0,
        items: [],
        error: null
      }
    };
  }
  
  // Test basic connectivity
  async testConnectivity() {
    try {
      console.log(`\nTesting connection to vCenter REST API at ${this.host}...`);
      
      const options = {
        hostname: this.host,
        port: 443,
        path: this.apiEndpoint,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };
      
      const response = await httpsRequest(options);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log('✅ Successfully connected to vCenter REST API');
        this.testResults.connection.success = true;
        return true;
      } else {
        console.error(`❌ Connection failed with status ${response.statusCode}`);
        this.testResults.connection.error = `HTTP status ${response.statusCode}`;
        return false;
      }
    } catch (error) {
      console.error('❌ Connection error:', error.message);
      this.testResults.connection.error = error.message;
      return false;
    }
  }
  
  // Authenticate and get session ID
  async authenticate() {
    try {
      console.log('\nAuthenticating with vCenter...');
      
      const options = {
        hostname: this.host,
        port: 443,
        path: `${this.apiEndpoint}/com/vmware/cis/session`,
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64')
        }
      };
      
      const response = await httpsRequest(options);
      
      if (response.statusCode === 200) {
        this.sessionId = response.data.value;
        console.log('✅ Authentication successful');
        this.testResults.auth.success = true;
        return true;
      } else {
        console.error(`❌ Authentication failed with status ${response.statusCode}`);
        this.testResults.auth.error = `HTTP status ${response.statusCode}`;
        return false;
      }
    } catch (error) {
      console.error('❌ Authentication error:', error.message);
      this.testResults.auth.error = error.message;
      return false;
    }
  }
  
  // Get datacenters
  async getDatacenters() {
    try {
      console.log('\nRetrieving datacenter information...');
      
      const options = {
        hostname: this.host,
        port: 443,
        path: `${this.apiEndpoint}/vcenter/datacenter`,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': this.sessionId
        }
      };
      
      const response = await httpsRequest(options);
      
      if (response.statusCode === 200) {
        const datacenters = response.data.value || [];
        console.log(`✅ Found ${datacenters.length} datacenter(s)`);
        
        for (const dc of datacenters) {
          console.log(`- ${dc.name}`);
          this.testResults.datacenters.items.push({
            name: dc.name,
            id: dc.datacenter
          });
        }
        
        this.testResults.datacenters.success = true;
        this.testResults.datacenters.count = datacenters.length;
        return datacenters;
      } else {
        console.error(`❌ Failed to retrieve datacenters: status ${response.statusCode}`);
        this.testResults.datacenters.error = `HTTP status ${response.statusCode}`;
        return [];
      }
    } catch (error) {
      console.error('❌ Error retrieving datacenters:', error.message);
      this.testResults.datacenters.error = error.message;
      return [];
    }
  }
  
  // Get hosts
  async getHosts() {
    try {
      console.log('\nRetrieving host information...');
      
      const options = {
        hostname: this.host,
        port: 443,
        path: `${this.apiEndpoint}/vcenter/host`,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': this.sessionId
        }
      };
      
      const response = await httpsRequest(options);
      
      if (response.statusCode === 200) {
        const hosts = response.data.value || [];
        console.log(`✅ Found ${hosts.length} host(s)`);
        
        for (const host of hosts) {
          console.log(`- ${host.name}`);
          this.testResults.hosts.items.push({
            name: host.name,
            id: host.host
          });
        }
        
        this.testResults.hosts.success = true;
        this.testResults.hosts.count = hosts.length;
        return hosts;
      } else {
        console.error(`❌ Failed to retrieve hosts: status ${response.statusCode}`);
        this.testResults.hosts.error = `HTTP status ${response.statusCode}`;
        return [];
      }
    } catch (error) {
      console.error('❌ Error retrieving hosts:', error.message);
      this.testResults.hosts.error = error.message;
      return [];
    }
  }
  
  // Get VMs
  async getVMs() {
    try {
      console.log('\nRetrieving virtual machine information...');
      
      const options = {
        hostname: this.host,
        port: 443,
        path: `${this.apiEndpoint}/vcenter/vm`,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'vmware-api-session-id': this.sessionId
        }
      };
      
      const response = await httpsRequest(options);
      
      if (response.statusCode === 200) {
        const vms = response.data.value || [];
        console.log(`✅ Found ${vms.length} virtual machine(s)`);
        
        // Display first 10 VMs
        const displayVms = vms.slice(0, 10);
        for (const vm of displayVms) {
          console.log(`- ${vm.name} (Power state: ${vm.power_state})`);
          this.testResults.vms.items.push({
            name: vm.name,
            id: vm.vm,
            power_state: vm.power_state
          });
        }
        
        if (vms.length > 10) {
          console.log(`  (and ${vms.length - 10} more...)`);
        }
        
        this.testResults.vms.success = true;
        this.testResults.vms.count = vms.length;
        return vms;
      } else {
        console.error(`❌ Failed to retrieve VMs: status ${response.statusCode}`);
        this.testResults.vms.error = `HTTP status ${response.statusCode}`;
        return [];
      }
    } catch (error) {
      console.error('❌ Error retrieving VMs:', error.message);
      this.testResults.vms.error = error.message;
      return [];
    }
  }
  
  // Run all tests
  async runTests() {
    try {
      console.log('=== vCenter REST API Connection Test ===');
      
      // Test connectivity
      if (!await this.testConnectivity()) {
        return this.testResults;
      }
      
      // Authenticate
      if (!await this.authenticate()) {
        return this.testResults;
      }
      
      // Get datacenters
      await this.getDatacenters();
      
      // Get hosts
      await this.getHosts();
      
      // Get VMs
      await this.getVMs();
      
      console.log('\n=== Test Summary ===');
      console.log(`✅ Connection: ${this.testResults.connection.success ? 'Success' : 'Failed'}`);
      console.log(`✅ Authentication: ${this.testResults.auth.success ? 'Success' : 'Failed'}`);
      console.log(`✅ Datacenters: ${this.testResults.datacenters.count} found`);
      console.log(`✅ Hosts: ${this.testResults.hosts.count} found`);
      console.log(`✅ VMs: ${this.testResults.vms.count} found`);
      
      return this.testResults;
    } catch (error) {
      console.error('❌ Error during tests:', error.message);
      return this.testResults;
    }
  }
}

// Main function
async function main() {
  try {
    // Get configuration from environment or prompt user
    let host = process.env.VCENTER_HOST;
    let username = process.env.VCENTER_USER;
    let password = process.env.VCENTER_PASS;
    
    // If any config is missing, prompt the user
    if (!host) {
      host = await promptUserInput('Enter vCenter hostname: ');
    }
    
    if (!username) {
      username = await promptUserInput('Enter vCenter username: ');
    }
    
    if (!password) {
      password = await promptUserInput('Enter vCenter password: ');
    }
    
    // Create tester instance
    const tester = new VCenterRestTester(host, username, password);
    
    // Run tests
    const results = await tester.runTests();
    
    // Write results to file
    writeResultsToFile(results);
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main(); 