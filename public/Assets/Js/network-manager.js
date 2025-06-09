class NetworkManager {
  constructor() {
    this.apiClient = window.apiClient;
  }

  // Get network adapters for a VM
  async getNetworkAdapters(vmId) {
    try {
      const response = await this.apiClient.get(
        `/vcenter/vms/${vmId}/network-adapters`
      );
      return response.data.networkAdapters;
    } catch (error) {
      console.error(`Error fetching network adapters for VM ${vmId}:`, error);
      throw error;
    }
  }

  // Add a new network adapter
  async addNetworkAdapter(vmId, adapterConfig) {
    try {
      const response = await this.apiClient.post(
        `/vcenter/vms/${vmId}/network-adapters`,
        adapterConfig
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding network adapter to VM ${vmId}:`, error);
      throw error;
    }
  }

  // Update network adapter configuration
  async updateNetworkAdapter(vmId, adapterId, adapterConfig) {
    try {
      const response = await this.apiClient.put(
        `/vcenter/vms/${vmId}/network-adapters/${adapterId}`,
        adapterConfig
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating network adapter ${adapterId} for VM ${vmId}:`,
        error
      );
      throw error;
    }
  }

  // Remove a network adapter
  async removeNetworkAdapter(vmId, adapterId) {
    try {
      const response = await this.apiClient.delete(
        `/vcenter/vms/${vmId}/network-adapters/${adapterId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error removing network adapter ${adapterId} from VM ${vmId}:`,
        error
      );
      throw error;
    }
  }

  // Get available networks
  async getAvailableNetworks() {
    try {
      const response = await this.apiClient.get("/vcenter/networks");
      return response.data.networks;
    } catch (error) {
      console.error("Error fetching available networks:", error);
      throw error;
    }
  }

  // Get network adapter types
  async getAdapterTypes() {
    try {
      const response = await this.apiClient.get(
        "/vcenter/network-adapter-types"
      );
      return response.data.types;
    } catch (error) {
      console.error("Error fetching network adapter types:", error);
      throw error;
    }
  }

  // Validate network configuration
  validateNetworkConfig(config) {
    const requiredFields = ["type", "network", "connected"];
    const missingFields = requiredFields.filter((field) => !config[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (
      config.type &&
      !["E1000", "E1000E", "PCNet32", "VMXNET", "VMXNET2", "VMXNET3"].includes(
        config.type
      )
    ) {
      throw new Error("Invalid network adapter type");
    }

    return true;
  }
}

// Create and export a singleton instance
const networkManager = new NetworkManager();
