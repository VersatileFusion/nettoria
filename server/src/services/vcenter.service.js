const axios = require('axios');

console.log('Initializing vCenter Service...');

// Configuration
const VCENTER_API_URL = process.env.VCENTER_API_URL;
const VCENTER_USERNAME = process.env.VCENTER_USERNAME;
const VCENTER_PASSWORD = process.env.VCENTER_PASSWORD;

// Authenticate and get session token
const getAuthToken = async () => {
  console.log('Getting vCenter auth token');
  
  try {
    const response = await axios.post(`${VCENTER_API_URL}/session`, {}, {
      auth: {
        username: VCENTER_USERNAME,
        password: VCENTER_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Auth token obtained successfully');
    return response.data;
  } catch (error) {
    console.error('Error getting auth token:', error.message);
    throw new Error('Failed to authenticate with vCenter');
  }
};

// Create a new VM
const createVM = async (config) => {
  console.log('Creating VM with config:', JSON.stringify(config));
  
  try {
    const token = await getAuthToken();
    
    // Prepare VM creation payload
    const vmPayload = {
      name: config.name,
      placement: {
        datastore: config.datastoreId,
        folder: config.folderId,
        host: config.hostId,
        cluster: config.clusterId
      },
      guest_OS: config.operatingSystem,
      cpu: {
        count: config.cpu
      },
      memory: {
        size_MiB: config.memoryMB
      },
      disks: [
        {
          new_vmdk: {
            capacity: config.diskSizeGB * 1024 * 1024 * 1024
          }
        }
      ],
      nics: [
        {
          network: config.networkId,
          start_connected: true
        }
      ]
    };
    
    const response = await axios.post(`${VCENTER_API_URL}/vcenter/vm`, vmPayload, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    console.log(`VM created successfully with ID: ${response.data.vm}`);
    return response.data;
  } catch (error) {
    console.error('Error creating VM:', error.message);
    throw new Error('Failed to create VM in vCenter');
  }
};

// Get VM details
const getVM = async (vmId) => {
  console.log(`Getting details for VM ID: ${vmId}`);
  
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(`${VCENTER_API_URL}/vcenter/vm/${vmId}`, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    console.log(`Retrieved details for VM ID: ${vmId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting VM details for ID ${vmId}:`, error.message);
    throw new Error('Failed to get VM details from vCenter');
  }
};

// Power operations: on, off, reset
const powerOperation = async (vmId, operation) => {
  console.log(`Performing power operation ${operation} on VM ID: ${vmId}`);
  
  try {
    const token = await getAuthToken();
    
    let endpoint;
    switch (operation) {
      case 'on':
        endpoint = 'power/on';
        break;
      case 'off':
        endpoint = 'power/off';
        break;
      case 'reset':
        endpoint = 'power/reset';
        break;
      default:
        throw new Error(`Unsupported power operation: ${operation}`);
    }
    
    await axios.post(`${VCENTER_API_URL}/vcenter/vm/${vmId}/${endpoint}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    console.log(`Power operation ${operation} successful on VM ID: ${vmId}`);
    return { success: true, operation };
  } catch (error) {
    console.error(`Error performing power operation ${operation} on VM ID ${vmId}:`, error.message);
    throw new Error(`Failed to perform power operation ${operation} on VM`);
  }
};

// Delete VM
const deleteVM = async (vmId) => {
  console.log(`Deleting VM ID: ${vmId}`);
  
  try {
    const token = await getAuthToken();
    
    // First power off the VM if it's running
    try {
      const vmDetails = await getVM(vmId);
      if (vmDetails.power_state === 'POWERED_ON') {
        await powerOperation(vmId, 'off');
      }
    } catch (error) {
      console.warn(`Could not check power state or power off VM ${vmId} before deletion:`, error.message);
    }
    
    // Delete the VM
    await axios.delete(`${VCENTER_API_URL}/vcenter/vm/${vmId}`, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    console.log(`VM ID ${vmId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting VM ID ${vmId}:`, error.message);
    throw new Error('Failed to delete VM from vCenter');
  }
};

// Get VM statistics
const getVMStats = async (vmId) => {
  console.log(`Getting statistics for VM ID: ${vmId}`);
  
  try {
    const token = await getAuthToken();
    
    // Get CPU usage
    const cpuResponse = await axios.get(`${VCENTER_API_URL}/vcenter/vm/${vmId}/stats/cpu`, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    // Get memory usage
    const memoryResponse = await axios.get(`${VCENTER_API_URL}/vcenter/vm/${vmId}/stats/memory`, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    // Get disk usage
    const diskResponse = await axios.get(`${VCENTER_API_URL}/vcenter/vm/${vmId}/stats/disk`, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    // Get network usage
    const networkResponse = await axios.get(`${VCENTER_API_URL}/vcenter/vm/${vmId}/stats/network`, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    console.log(`Statistics retrieved for VM ID: ${vmId}`);
    
    return {
      cpu: cpuResponse.data,
      memory: memoryResponse.data,
      disk: diskResponse.data,
      network: networkResponse.data
    };
  } catch (error) {
    console.error(`Error getting VM statistics for ID ${vmId}:`, error.message);
    throw new Error('Failed to get VM statistics from vCenter');
  }
};

// Rebuild VM (change OS)
const rebuildVM = async (vmId, newOsConfig) => {
  console.log(`Rebuilding VM ID: ${vmId} with new OS: ${newOsConfig.operatingSystem}`);
  
  try {
    const token = await getAuthToken();
    
    // First power off the VM if it's running
    try {
      const vmDetails = await getVM(vmId);
      if (vmDetails.power_state === 'POWERED_ON') {
        await powerOperation(vmId, 'off');
      }
    } catch (error) {
      console.warn(`Could not check power state or power off VM ${vmId} before rebuild:`, error.message);
    }
    
    // Update VM with new OS
    await axios.patch(`${VCENTER_API_URL}/vcenter/vm/${vmId}`, {
      guest_OS: newOsConfig.operatingSystem
    }, {
      headers: {
        'Content-Type': 'application/json',
        'vmware-api-session-id': token
      }
    });
    
    // Power on VM
    await powerOperation(vmId, 'on');
    
    console.log(`VM ID ${vmId} rebuilt successfully with new OS`);
    return { success: true };
  } catch (error) {
    console.error(`Error rebuilding VM ID ${vmId}:`, error.message);
    throw new Error('Failed to rebuild VM in vCenter');
  }
};

console.log('vCenter Service initialized successfully');

module.exports = {
  createVM,
  getVM,
  powerOperation,
  deleteVM,
  getVMStats,
  rebuildVM
}; 