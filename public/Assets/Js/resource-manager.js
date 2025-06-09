class ResourceManager {
  constructor() {
    this.apiClient = new APIClient();
    this.quotas = null;
    this.subscribers = new Set();
  }

  async fetchQuotas() {
    try {
      const response = await this.apiClient.get("/api/vcenter/quotas");
      this.quotas = response.data;
      this.notifySubscribers();
      return this.quotas;
    } catch (error) {
      console.error("Error fetching resource quotas:", error);
      throw new Error("خطا در دریافت سهمیه‌های منابع");
    }
  }

  async createBackup(vmId, backupData) {
    try {
      const response = await this.apiClient.post(
        `/api/vcenter/vms/${vmId}/backup`,
        backupData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating VM backup:", error);
      throw new Error("خطا در ایجاد پشتیبان");
    }
  }

  getCPUQuota() {
    return {
      limit: this.quotas?.cpu?.limit || 0,
      used: this.quotas?.cpu?.used || 0,
      available: (this.quotas?.cpu?.limit || 0) - (this.quotas?.cpu?.used || 0),
    };
  }

  getMemoryQuota() {
    return {
      limit: this.quotas?.memory?.limit || 0,
      used: this.quotas?.memory?.used || 0,
      available:
        (this.quotas?.memory?.limit || 0) - (this.quotas?.memory?.used || 0),
    };
  }

  getStorageQuota() {
    return {
      limit: this.quotas?.storage?.limit || 0,
      used: this.quotas?.storage?.used || 0,
      available:
        (this.quotas?.storage?.limit || 0) - (this.quotas?.storage?.used || 0),
    };
  }

  getNetworkQuota() {
    return {
      bandwidth: this.quotas?.network?.bandwidth || 0,
      used: this.quotas?.network?.used || 0,
      available:
        (this.quotas?.network?.bandwidth || 0) -
        (this.quotas?.network?.used || 0),
    };
  }

  formatSize(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    if (this.quotas) {
      callback(this.quotas);
    }
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.quotas));
  }
}

// Create and export a singleton instance
const resourceManager = new ResourceManager();
