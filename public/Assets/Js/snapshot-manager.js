class SnapshotManager {
  constructor() {
    this.apiClient = window.apiClient;
  }

  // Get snapshots for a VM
  async getSnapshots(vmId) {
    try {
      const response = await this.apiClient.get(
        `/vcenter/vms/${vmId}/snapshots`
      );
      return response.data.snapshots;
    } catch (error) {
      console.error(`Error fetching snapshots for VM ${vmId}:`, error);
      throw error;
    }
  }

  // Create a new snapshot
  async createSnapshot(vmId, snapshotData) {
    try {
      const response = await this.apiClient.post(
        `/vcenter/vms/${vmId}/snapshots`,
        snapshotData
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating snapshot for VM ${vmId}:`, error);
      throw error;
    }
  }

  // Delete a snapshot
  async deleteSnapshot(vmId, snapshotId) {
    try {
      const response = await this.apiClient.delete(
        `/vcenter/vms/${vmId}/snapshots/${snapshotId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error deleting snapshot ${snapshotId} for VM ${vmId}:`,
        error
      );
      throw error;
    }
  }

  // Revert to a snapshot
  async revertToSnapshot(vmId, snapshotId) {
    try {
      const response = await this.apiClient.post(
        `/vcenter/vms/${vmId}/snapshots/${snapshotId}/revert`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error reverting to snapshot ${snapshotId} for VM ${vmId}:`,
        error
      );
      throw error;
    }
  }

  // Get snapshot details
  async getSnapshotDetails(vmId, snapshotId) {
    try {
      const response = await this.apiClient.get(
        `/vcenter/vms/${vmId}/snapshots/${snapshotId}`
      );
      return response.data.snapshot;
    } catch (error) {
      console.error(
        `Error fetching details for snapshot ${snapshotId} of VM ${vmId}:`,
        error
      );
      throw error;
    }
  }

  // Validate snapshot data
  validateSnapshotData(data) {
    const requiredFields = ["name"];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    if (data.name && data.name.length > 50) {
      throw new Error("Snapshot name must be 50 characters or less");
    }

    if (data.description && data.description.length > 255) {
      throw new Error("Snapshot description must be 255 characters or less");
    }

    return true;
  }

  // Format snapshot size
  formatSnapshotSize(sizeInBytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Get snapshot tree
  async getSnapshotTree(vmId) {
    try {
      const response = await this.apiClient.get(
        `/vcenter/vms/${vmId}/snapshots/tree`
      );
      return response.data.tree;
    } catch (error) {
      console.error(`Error fetching snapshot tree for VM ${vmId}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const snapshotManager = new SnapshotManager();
