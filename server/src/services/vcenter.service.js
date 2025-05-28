const vsphereSoap = require("node-vsphere-soap");
const config = require("../config");
const logger = require("../utils/logger");

// Extract the Client constructor from the module
const Client = vsphereSoap.Client;

class VCenterService {
  constructor() {
    this.vCenterClient = null;
    this.serviceContent = null;
    this.isConnected = false;
  }

  /**
   * Initialize connection to vCenter
   * @returns {Promise<boolean>} Connection status
   */
  async initialize() {
    try {
      if (this.isConnected) {
        return true;
      }

      this.vCenterClient = new Client(
        config.VCENTER_HOST,
        config.VCENTER_USER,
        config.VCENTER_PASS,
        false
      );

      // Connect to vCenter
      logger.info(`Connecting to vCenter at ${config.VCENTER_HOST}`);

      return new Promise((resolve, reject) => {
        this.vCenterClient.once("ready", () => {
          logger.info("Connected to vCenter successfully");
          this.isConnected = true;

          // Get service content for further operations
          this.vCenterClient
            .getServiceContent()
            .then((serviceContent) => {
              this.serviceContent = serviceContent;
              resolve(true);
            })
            .catch((error) => {
              logger.error("Failed to get vCenter service content:", error);
              reject(error);
            });
        });

        this.vCenterClient.once("error", (error) => {
          logger.error("Failed to connect to vCenter:", error);
          this.isConnected = false;
          reject(error);
        });

        // Initialize connection
        this.vCenterClient.connect();
      });
    } catch (error) {
      logger.error("Error initializing vCenter connection:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Ensure the connection to vCenter is established
   * @returns {Promise<boolean>} Connection status
   */
  async ensureConnection() {
    if (!this.isConnected) {
      return await this.initialize();
    }
    return true;
  }

  /**
   * Get a virtual machine by name
   * @param {string} vmName - Name of the VM
   * @returns {Promise<Object>} VM object
   */
  async getVirtualMachine(vmName) {
    try {
      await this.ensureConnection();

      logger.info(`Retrieving VM: ${vmName}`);
      const results = await this.vCenterClient.searchManagedEntities(
        "VirtualMachine",
        { name: vmName }
      );

      if (!results || results.length === 0) {
        logger.warn(`No VM found with name: ${vmName}`);
        return null;
      }

      return results[0];
    } catch (error) {
      logger.error(`Error retrieving VM ${vmName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new virtual machine
   * @param {Object} vmConfig - VM configuration
   * @returns {Promise<Object>} Created VM details
   */
  async createVM(vmConfig) {
    try {
      await this.ensureConnection();

      const {
        name,
        numCPUs,
        memoryGB,
        diskGB,
        osType,
        datastoreName,
        networkName,
        hostName,
        datacenterName,
      } = vmConfig;

      logger.info(
        `Creating VM: ${name} with ${numCPUs} CPUs, ${memoryGB}GB RAM, ${diskGB}GB disk`
      );

      // Find datacenter
      const datacenters = await this.vCenterClient.searchManagedEntities(
        "Datacenter",
        { name: datacenterName }
      );
      if (!datacenters || datacenters.length === 0) {
        throw new Error(`Datacenter not found: ${datacenterName}`);
      }
      const datacenter = datacenters[0];

      // Find host
      const hosts = await this.vCenterClient.searchManagedEntities(
        "HostSystem",
        { name: hostName }
      );
      if (!hosts || hosts.length === 0) {
        throw new Error(`Host not found: ${hostName}`);
      }
      const host = hosts[0];

      // Find datastore
      const datastores = await this.vCenterClient.searchManagedEntities(
        "Datastore",
        { name: datastoreName }
      );
      if (!datastores || datastores.length === 0) {
        throw new Error(`Datastore not found: ${datastoreName}`);
      }
      const datastore = datastores[0];

      // Find network
      const networks = await this.vCenterClient.searchManagedEntities(
        "Network",
        { name: networkName }
      );
      if (!networks || networks.length === 0) {
        throw new Error(`Network not found: ${networkName}`);
      }
      const network = networks[0];

      // VM creation specifications
      const vmCreateSpec = {
        name: name,
        guestId: this.getGuestOSId(osType),
        files: {
          vmPathName: `[${datastoreName}]`,
        },
        numCPUs: numCPUs,
        memoryMB: memoryGB * 1024,
        deviceChange: [
          {
            operation: "add",
            device: {
              key: 0,
              backing: {
                fileName: `[${datastoreName}] ${name}/${name}.vmdk`,
                diskMode: "persistent",
              },
              controllerKey: 1000,
              unitNumber: 0,
              capacityInKB: diskGB * 1024 * 1024,
            },
          },
          {
            operation: "add",
            device: {
              key: 1,
              backing: {
                deviceName: networkName,
                useAutoDetect: false,
              },
              connectable: {
                startConnected: true,
                allowGuestControl: true,
              },
            },
          },
        ],
      };

      // Create VM
      const vmFolder = await this.vCenterClient.getVmFolder(datacenter);
      const resourcePool = await this.vCenterClient.getResourcePool(host);

      const task = await this.vCenterClient.createVM(
        vmFolder,
        vmCreateSpec,
        resourcePool,
        host
      );
      const result = await this.vCenterClient.waitForTask(task);

      if (result.state === "success") {
        logger.info(`Successfully created VM: ${name}`);
        return await this.getVirtualMachine(name);
      } else {
        throw new Error(
          `Failed to create VM: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      logger.error("Error creating VM:", error);
      throw error;
    }
  }

  /**
   * Power on a virtual machine
   * @param {string} vmName - Name of the VM
   * @returns {Promise<boolean>} Success status
   */
  async powerOnVM(vmName) {
    try {
      const vm = await this.getVirtualMachine(vmName);
      if (!vm) {
        throw new Error(`VM not found: ${vmName}`);
      }

      logger.info(`Powering on VM: ${vmName}`);
      const task = await this.vCenterClient.powerOnVM(vm);
      const result = await this.vCenterClient.waitForTask(task);

      if (result.state === "success") {
        logger.info(`Successfully powered on VM: ${vmName}`);
        return true;
      } else {
        logger.error(
          `Failed to power on VM ${vmName}:`,
          result.error || "Unknown error"
        );
        return false;
      }
    } catch (error) {
      logger.error(`Error powering on VM ${vmName}:`, error);
      return false;
    }
  }

  /**
   * Power off a virtual machine
   * @param {string} vmName - Name of the VM
   * @returns {Promise<boolean>} Success status
   */
  async powerOffVM(vmName) {
    try {
      const vm = await this.getVirtualMachine(vmName);
      if (!vm) {
        throw new Error(`VM not found: ${vmName}`);
      }

      logger.info(`Powering off VM: ${vmName}`);
      const task = await this.vCenterClient.powerOffVM(vm);
      const result = await this.vCenterClient.waitForTask(task);

      if (result.state === "success") {
        logger.info(`Successfully powered off VM: ${vmName}`);
        return true;
      } else {
        logger.error(
          `Failed to power off VM ${vmName}:`,
          result.error || "Unknown error"
        );
        return false;
      }
    } catch (error) {
      logger.error(`Error powering off VM ${vmName}:`, error);
      return false;
    }
  }

  /**
   * Restart a virtual machine
   * @param {string} vmName - Name of the VM
   * @returns {Promise<boolean>} Success status
   */
  async restartVM(vmName) {
    try {
      const vm = await this.getVirtualMachine(vmName);
      if (!vm) {
        throw new Error(`VM not found: ${vmName}`);
      }

      logger.info(`Restarting VM: ${vmName}`);
      const task = await this.vCenterClient.rebootVM(vm);
      const result = await this.vCenterClient.waitForTask(task);

      if (result.state === "success") {
        logger.info(`Successfully restarted VM: ${vmName}`);
        return true;
      } else {
        logger.error(
          `Failed to restart VM ${vmName}:`,
          result.error || "Unknown error"
        );
        return false;
      }
    } catch (error) {
      logger.error(`Error restarting VM ${vmName}:`, error);
      return false;
    }
  }

  /**
   * Rebuild a virtual machine (reinstall OS)
   * @param {string} vmName - Name of the VM
   * @param {string} osType - Type of OS to install
   * @returns {Promise<boolean>} Success status
   */
  async rebuildVM(vmName, osType) {
    try {
      // This is a complex operation that involves:
      // 1. Power off the VM
      // 2. Get VM configuration
      // 3. Delete the VM
      // 4. Create a new VM with the same configuration but different OS

      const vm = await this.getVirtualMachine(vmName);
      if (!vm) {
        throw new Error(`VM not found: ${vmName}`);
      }

      // Get VM configuration before deleting
      const vmConfig = await this.getVMConfiguration(vm);

      // Power off VM if it's running
      const powerState = await this.getVMPowerState(vm);
      if (powerState === "poweredOn") {
        await this.powerOffVM(vmName);
      }

      // Delete the VM
      await this.deleteVM(vmName);

      // Create a new VM with the same configuration but different OS
      vmConfig.osType = osType;
      await this.createVM(vmConfig);

      logger.info(`Successfully rebuilt VM: ${vmName} with OS: ${osType}`);
      return true;
    } catch (error) {
      logger.error(`Error rebuilding VM ${vmName}:`, error);
      return false;
    }
  }

  /**
   * Delete a virtual machine
   * @param {string} vmName - Name of the VM
   * @returns {Promise<boolean>} Success status
   */
  async deleteVM(vmName) {
    try {
      const vm = await this.getVirtualMachine(vmName);
      if (!vm) {
        logger.warn(`VM not found for deletion: ${vmName}`);
        return true; // Already deleted
      }

      // Power off VM if it's running
      const powerState = await this.getVMPowerState(vm);
      if (powerState === "poweredOn") {
        await this.powerOffVM(vmName);
      }

      logger.info(`Deleting VM: ${vmName}`);
      const task = await this.vCenterClient.destroyVM(vm);
      const result = await this.vCenterClient.waitForTask(task);

      if (result.state === "success") {
        logger.info(`Successfully deleted VM: ${vmName}`);
        return true;
      } else {
        logger.error(
          `Failed to delete VM ${vmName}:`,
          result.error || "Unknown error"
        );
        return false;
      }
    } catch (error) {
      logger.error(`Error deleting VM ${vmName}:`, error);
      return false;
    }
  }

  /**
   * Get the power state of a virtual machine
   * @param {Object} vm - VM object
   * @returns {Promise<string>} Power state (poweredOn, poweredOff, suspended)
   */
  async getVMPowerState(vm) {
    try {
      const properties = await this.vCenterClient.getProperties(vm, [
        "runtime.powerState",
      ]);
      return properties["runtime.powerState"];
    } catch (error) {
      logger.error("Error getting VM power state:", error);
      throw error;
    }
  }

  /**
   * Get VM configuration details
   * @param {Object} vm - VM object
   * @returns {Promise<Object>} VM configuration
   */
  async getVMConfiguration(vm) {
    try {
      const properties = await this.vCenterClient.getProperties(vm, [
        "name",
        "config.hardware.numCPU",
        "config.hardware.memoryMB",
        "config.guestFullName",
        "datastore",
        "network",
        "runtime.host",
        "parent",
      ]);

      // Get datacenter
      const datacenter = await this.getVMDatacenter(vm);

      // Convert memory from MB to GB
      const memoryGB = Math.round(
        properties["config.hardware.memoryMB"] / 1024
      );

      // Get disk size
      const disks = await this.getVMDisks(vm);
      const diskGB = disks.reduce((total, disk) => total + disk.capacityGB, 0);

      // Get datastore name
      const datastoreName = await this.getDatastoreName(
        properties.datastore[0]
      );

      // Get network name
      const networkName = await this.getNetworkName(properties.network[0]);

      // Get host name
      const hostName = await this.getHostName(properties["runtime.host"]);

      return {
        name: properties.name,
        numCPUs: properties["config.hardware.numCPU"],
        memoryGB: memoryGB,
        diskGB: diskGB,
        osType: this.getOSTypeFromGuest(properties["config.guestFullName"]),
        datastoreName: datastoreName,
        networkName: networkName,
        hostName: hostName,
        datacenterName: datacenter.name,
      };
    } catch (error) {
      logger.error("Error getting VM configuration:", error);
      throw error;
    }
  }

  /**
   * Get VM disks information
   * @param {Object} vm - VM object
   * @returns {Promise<Array>} Array of disk objects
   */
  async getVMDisks(vm) {
    try {
      const properties = await this.vCenterClient.getProperties(vm, [
        "config.hardware.device",
      ]);
      const devices = properties["config.hardware.device"];

      const disks = devices.filter(
        (device) =>
          device.deviceInfo &&
          device.deviceInfo.label &&
          device.deviceInfo.label.includes("Hard disk")
      );

      return disks.map((disk) => ({
        label: disk.deviceInfo.label,
        capacityGB: disk.capacityInKB / (1024 * 1024),
        fileName: disk.backing ? disk.backing.fileName : null,
      }));
    } catch (error) {
      logger.error("Error getting VM disks:", error);
      return [];
    }
  }

  /**
   * Get VM datacenter
   * @param {Object} vm - VM object
   * @returns {Promise<Object>} Datacenter object
   */
  async getVMDatacenter(vm) {
    try {
      // Navigate up the inventory path to find the datacenter
      let parent = vm.parent;
      while (parent) {
        const properties = await this.vCenterClient.getProperties(parent, [
          "name",
          "parent",
        ]);
        if (parent._type === "Datacenter") {
          return {
            ref: parent,
            name: properties.name,
          };
        }
        parent = properties.parent;
      }
      throw new Error("Could not find datacenter for VM");
    } catch (error) {
      logger.error("Error getting VM datacenter:", error);
      throw error;
    }
  }

  /**
   * Get datastore name from reference
   * @param {Object} datastoreRef - Datastore reference
   * @returns {Promise<string>} Datastore name
   */
  async getDatastoreName(datastoreRef) {
    try {
      const properties = await this.vCenterClient.getProperties(datastoreRef, [
        "name",
      ]);
      return properties.name;
    } catch (error) {
      logger.error("Error getting datastore name:", error);
      return "unknown-datastore";
    }
  }

  /**
   * Get network name from reference
   * @param {Object} networkRef - Network reference
   * @returns {Promise<string>} Network name
   */
  async getNetworkName(networkRef) {
    try {
      const properties = await this.vCenterClient.getProperties(networkRef, [
        "name",
      ]);
      return properties.name;
    } catch (error) {
      logger.error("Error getting network name:", error);
      return "unknown-network";
    }
  }

  /**
   * Get host name from reference
   * @param {Object} hostRef - Host reference
   * @returns {Promise<string>} Host name
   */
  async getHostName(hostRef) {
    try {
      const properties = await this.vCenterClient.getProperties(hostRef, [
        "name",
      ]);
      return properties.name;
    } catch (error) {
      logger.error("Error getting host name:", error);
      return "unknown-host";
    }
  }

  /**
   * Map OS type to vCenter guestId
   * @param {string} osType - OS type (e.g., windows, ubuntu, centos)
   * @returns {string} vCenter guestId
   */
  getGuestOSId(osType) {
    const osMap = {
      windows10: "windows9_64Guest",
      windows2019: "windows9Server64Guest",
      windows2022: "windows11Server64Guest",
      "ubuntu20.04": "ubuntu64Guest",
      "ubuntu22.04": "ubuntu64Guest",
      centos7: "centos7_64Guest",
      centos8: "centos8_64Guest",
      debian10: "debian10_64Guest",
      debian11: "debian11_64Guest",
      rhel8: "rhel8_64Guest",
      rhel9: "rhel9_64Guest",
    };

    return osMap[osType] || "otherGuest64";
  }

  /**
   * Map vCenter guest OS name to simple OS type
   * @param {string} guestFullName - vCenter guest OS full name
   * @returns {string} Simple OS type
   */
  getOSTypeFromGuest(guestFullName) {
    const guestName = guestFullName.toLowerCase();

    if (guestName.includes("windows 10")) return "windows10";
    if (guestName.includes("windows server 2019")) return "windows2019";
    if (guestName.includes("windows server 2022")) return "windows2022";
    if (guestName.includes("ubuntu 20.04")) return "ubuntu20.04";
    if (guestName.includes("ubuntu 22.04")) return "ubuntu22.04";
    if (guestName.includes("centos 7")) return "centos7";
    if (guestName.includes("centos 8")) return "centos8";
    if (guestName.includes("debian 10")) return "debian10";
    if (guestName.includes("debian 11")) return "debian11";
    if (guestName.includes("red hat enterprise linux 8")) return "rhel8";
    if (guestName.includes("red hat enterprise linux 9")) return "rhel9";

    return "unknown";
  }
}

module.exports = new VCenterService();
