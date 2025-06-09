class VCenterClient {
  constructor() {
    this.apiClient = window.apiClient;
  }

  // Get list of virtual machines
  async getVirtualMachines() {
    try {
      const response = await this.apiClient.get("/vcenter/vms");
      return response.data.vms;
    } catch (error) {
      console.error("Error fetching virtual machines:", error);
      throw error;
    }
  }

  // Get virtual machine details
  async getVirtualMachineDetails(vmId) {
    try {
      const response = await this.apiClient.get(`/vcenter/vms/${vmId}`);
      return response.data.vm;
    } catch (error) {
      console.error("Error fetching virtual machine details:", error);
      throw error;
    }
  }

  // Power on virtual machine
  async powerOnVM(vmId) {
    try {
      const response = await this.apiClient.post(
        `/vcenter/vms/${vmId}/power-on`
      );
      return response.data;
    } catch (error) {
      console.error("Error powering on virtual machine:", error);
      throw error;
    }
  }

  // Power off virtual machine
  async powerOffVM(vmId) {
    try {
      const response = await this.apiClient.post(
        `/vcenter/vms/${vmId}/power-off`
      );
      return response.data;
    } catch (error) {
      console.error("Error powering off virtual machine:", error);
      throw error;
    }
  }

  // Get VM metrics
  async getVMMetrics(vmId) {
    try {
      const response = await this.apiClient.get(`/vcenter/vms/${vmId}/metrics`);
      return response.data.metrics;
    } catch (error) {
      console.error("Error fetching VM metrics:", error);
      throw error;
    }
  }

  // Get VM console URL
  async getVMConsoleURL(vmId) {
    try {
      const response = await this.apiClient.get(
        `/vcenter/vms/${vmId}/console-url`
      );
      return response.data.consoleUrl;
    } catch (error) {
      console.error("Error fetching VM console URL:", error);
      throw error;
    }
  }

  // Get VM snapshots
  async getVMSnapshots(vmId) {
    try {
      const response = await this.apiClient.get(
        `/vcenter/vms/${vmId}/snapshots`
      );
      return response.data.snapshots;
    } catch (error) {
      console.error("Error fetching VM snapshots:", error);
      throw error;
    }
  }

  // Create VM snapshot
  async createVMSnapshot(vmId, snapshotData) {
    try {
      const response = await this.apiClient.post(
        `/vcenter/vms/${vmId}/snapshots`,
        snapshotData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating VM snapshot:", error);
      throw error;
    }
  }

  // Get VM network adapters
  async getVMNetworkAdapters(vmId) {
    try {
      const response = await this.apiClient.get(
        `/vcenter/vms/${vmId}/network-adapters`
      );
      return response.data.networkAdapters;
    } catch (error) {
      console.error("Error fetching VM network adapters:", error);
      throw error;
    }
  }

  // Get VM disks
  async getVMDisks(vmId) {
    try {
      const response = await this.apiClient.get(`/vcenter/vms/${vmId}/disks`);
      return response.data.disks;
    } catch (error) {
      console.error("Error fetching VM disks:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const vcenterClient = new VCenterClient();
