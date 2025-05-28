/**
 * vCenter API Test Script
 * This script tests connection to vCenter server and performs basic API operations
 */

const vpshere = require('node-vsphere-soap');
const readline = require('readline');

// Create readline interface for user input
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

// Main function to test vCenter connection and API
async function testVCenterConnection() {
  try {
    console.log('=== vCenter API Connection Test ===\n');
    
    // Get vCenter credentials from user
    const vcenterUrl = await promptUserInput('Enter vCenter URL (e.g., https://vcenter.example.com): ');
    const username = await promptUserInput('Enter vCenter username: ');
    const password = await promptUserInput('Enter vCenter password: ');
    
    console.log(`\nAttempting to connect to vCenter at ${vcenterUrl}...`);
    
    // Connect to vCenter
    const Client = vpshere.Client;
    const vc = new Client(vcenterUrl, username, password);
    
    // Login to vCenter
    await new Promise((resolve, reject) => {
      vc.once('ready', () => {
        console.log('✅ Successfully connected to vCenter!');
        resolve();
      });
      
      vc.once('error', (err) => {
        console.error('❌ Connection error:', err.message);
        reject(err);
      });
      
      vc.connect();
    });
    
    // Get some basic information to test API access
    console.log('\nRetrieving information about the vCenter server...');
    
    // Get datacenter information
    console.log('\n--- Listing Datacenters ---');
    const datacenters = await new Promise((resolve, reject) => {
      vc.runCommand('FindAllByInventoryPath', { inventoryPath: '/' }, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        vc.runCommand('FindChild', { entity: result, name: 'Datacenters' }, (err, dcFolder) => {
          if (err) {
            reject(err);
            return;
          }
          
          vc.runCommand('FindAllByType', { type: 'Datacenter', begin: dcFolder }, (err, dcs) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(dcs);
          });
        });
      });
    });
    
    if (datacenters && datacenters.length > 0) {
      console.log(`Found ${datacenters.length} datacenter(s):`);
      for (const dc of datacenters) {
        console.log(`- ${dc.name}`);
      }
    } else {
      console.log('No datacenters found.');
    }
    
    // Get VM information from first datacenter if available
    if (datacenters && datacenters.length > 0) {
      const firstDc = datacenters[0];
      console.log(`\n--- Listing VMs in datacenter: ${firstDc.name} ---`);
      
      const vms = await new Promise((resolve, reject) => {
        vc.runCommand('FindAllByType', { type: 'VirtualMachine', begin: firstDc }, (err, machines) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(machines);
        });
      });
      
      if (vms && vms.length > 0) {
        console.log(`Found ${vms.length} virtual machine(s):`);
        for (const vm of vms.slice(0, 10)) { // Show only first 10 VMs to avoid overwhelming output
          console.log(`- ${vm.name}`);
        }
        if (vms.length > 10) {
          console.log(`  (and ${vms.length - 10} more...)`);
        }
      } else {
        console.log('No virtual machines found.');
      }
    }
    
    console.log('\n✅ API test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during vCenter API test:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    rl.close();
  }
}

// Run the test
testVCenterConnection().catch(err => {
  console.error('Unhandled error:', err);
  rl.close();
}); 