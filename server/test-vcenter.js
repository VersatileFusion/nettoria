// First, directly require the vsphere-soap client to check if it's working properly
const vsphereSoap = require('node-vsphere-soap');
const vCenterService = require('./src/services/vcenter.service');
const config = require('./src/config');
const logger = require('./src/utils/logger');

/**
 * vCenter API Connection Test
 * 
 * This script tests connectivity to vCenter and various API operations
 * 
 * Usage: node test-vcenter.js
 */

// Output the vsphere-soap version to verify it's loaded correctly
console.log('node-vsphere-soap module loaded:', typeof vsphereSoap, 'constructor:', typeof vsphereSoap.Client);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: {}
};

// Helper function to record test results
function recordTest(name, success, response = null, error = null) {
  results.tests[name] = {
    success,
    response: response ? 
      (typeof response === 'object' ? JSON.stringify(response) : response) : null,
    error: error ? 
      (typeof error === 'object' ? JSON.stringify(error) : error) : null
  };
  
  if (success) {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (error) console.log(`   Error: ${typeof error === 'object' ? error.message || JSON.stringify(error) : error}`);
  }
}

// Test vCenter connection
async function testVCenterConnection() {
  console.log('\n----- Testing vCenter Connection -----');
  
  try {
    console.log(`Connecting to vCenter at ${config.VCENTER_HOST}...`);
    const result = await vCenterService.initialize();
    recordTest('vCenter Connection', result, { connected: result });
    return result;
  } catch (error) {
    recordTest('vCenter Connection', false, null, error);
    return false;
  }
}

// Test getting VM list
async function testGetVMs() {
  console.log('\n----- Testing Get VMs -----');
  
  try {
    // This uses internal method to get all VMs
    console.log('Retrieving list of virtual machines...');
    const vms = await vCenterService.vCenterClient.searchManagedEntities('VirtualMachine');
    
    recordTest('Get VMs', true, { count: vms?.length || 0 });
    
    // Print the first few VMs
    if (vms && vms.length > 0) {
      console.log(`Found ${vms.length} VMs. First 3 VMs:`);
      for (let i = 0; i < Math.min(3, vms.length); i++) {
        const vmInfo = await vCenterService.vCenterClient.getProperties(vms[i], ['name', 'runtime.powerState']);
        console.log(`- ${vmInfo.name} (${vmInfo['runtime.powerState']})`);
      }
    }
    
    return vms;
  } catch (error) {
    recordTest('Get VMs', false, null, error);
    return null;
  }
}

// Test getting VM by name (if it exists)
async function testGetVMByName(vmName) {
  console.log(`\n----- Testing Get VM by Name: "${vmName}" -----`);
  
  try {
    console.log(`Retrieving VM with name: ${vmName}`);
    const vm = await vCenterService.getVirtualMachine(vmName);
    
    if (vm) {
      const vmInfo = await vCenterService.vCenterClient.getProperties(
        vm, 
        ['name', 'runtime.powerState', 'config.hardware.numCPU', 'config.hardware.memoryMB']
      );
      
      recordTest('Get VM by Name', true, {
        name: vmInfo.name,
        powerState: vmInfo['runtime.powerState'],
        cpuCount: vmInfo['config.hardware.numCPU'],
        memoryMB: vmInfo['config.hardware.memoryMB']
      });
      
      return vm;
    } else {
      recordTest('Get VM by Name', false, null, `No VM found with name: ${vmName}`);
      return null;
    }
  } catch (error) {
    recordTest('Get VM by Name', false, null, error);
    return null;
  }
}

// Test getting VM power state
async function testGetVMPowerState(vm) {
  console.log('\n----- Testing Get VM Power State -----');
  
  if (!vm) {
    recordTest('Get VM Power State', false, null, 'No VM provided');
    return null;
  }
  
  try {
    console.log('Retrieving VM power state...');
    const powerState = await vCenterService.getVMPowerState(vm);
    recordTest('Get VM Power State', true, { powerState });
    return powerState;
  } catch (error) {
    recordTest('Get VM Power State', false, null, error);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('=================================================');
  console.log('NETTORIA vCENTER API TEST SUITE');
  console.log('=================================================');
  console.log(`Testing connection to: ${config.VCENTER_HOST}`);
  console.log('=================================================\n');
  
  try {
    // Test vCenter connection
    const connected = await testVCenterConnection();
    
    if (connected) {
      // Test getting VMs
      const vms = await testGetVMs();
      
      // If we have VMs, test getting a specific one
      if (vms && vms.length > 0) {
        // Get properties of the first VM to get its name
        const vmInfo = await vCenterService.vCenterClient.getProperties(vms[0], ['name']);
        const vm = await testGetVMByName(vmInfo.name);
        
        if (vm) {
          await testGetVMPowerState(vm);
        }
      } else {
        console.log('No VMs found to test with.');
      }
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
  
  // Print summary
  console.log('\n=================================================');
  console.log('TEST SUMMARY');
  console.log('=================================================');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('=================================================');
  
  // List failed tests
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    for (const [testName, result] of Object.entries(results.tests)) {
      if (!result.success) {
        console.log(`- ${testName}: ${result.error}`);
      }
    }
    console.log('=================================================');
  }
}

// Run the tests
runTests(); 