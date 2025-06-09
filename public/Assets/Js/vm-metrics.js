class VMMetrics {
  constructor(vmId) {
    this.vmId = vmId;
    this.apiClient = new APIClient();
    this.metrics = null;
    this.subscribers = new Set();
    this.pollingInterval = null;
    this.duration = "1h";
  }

  async startMonitoring(interval = 10000) {
    if (this.pollingInterval) {
      this.stopMonitoring();
    }

    await this.fetchMetrics();
    this.pollingInterval = setInterval(() => this.fetchMetrics(), interval);
  }

  stopMonitoring() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async fetchMetrics() {
    try {
      const response = await this.apiClient.get(
        `/api/vcenter/vms/${this.vmId}/metrics?duration=${this.duration}`
      );
      this.metrics = response.data;
      this.notifySubscribers();
    } catch (error) {
      console.error("Error fetching VM metrics:", error);
      throw new Error("خطا در دریافت اطلاعات عملکرد سرور");
    }
  }

  getCurrentMetrics() {
    return this.metrics;
  }

  getCPUUsage() {
    return this.metrics?.cpu?.usage || 0;
  }

  getMemoryUsage() {
    if (!this.metrics?.memory) return { used: 0, total: 0 };
    return {
      used: this.metrics.memory.used,
      total: this.metrics.memory.total,
    };
  }

  getDiskIO() {
    if (!this.metrics?.disk) return { read: 0, write: 0 };
    return {
      read: this.metrics.disk.read,
      write: this.metrics.disk.write,
    };
  }

  getNetworkIO() {
    if (!this.metrics?.network) return { rx: 0, tx: 0 };
    return {
      rx: this.metrics.network.rx,
      tx: this.metrics.network.tx,
    };
  }

  getResourceTrends() {
    return {
      cpu: this.metrics?.cpu?.history || [],
      memory: this.metrics?.memory?.history || [],
      disk: this.metrics?.disk?.history || [],
      network: this.metrics?.network?.history || [],
    };
  }

  isHealthy() {
    if (!this.metrics) return false;

    const cpuUsage = this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    const diskIO = this.getDiskIO();
    const networkIO = this.getNetworkIO();

    // Define thresholds
    const thresholds = {
      cpu: 90, // 90% CPU usage
      memory: 85, // 85% memory usage
      diskIO: 1000, // 1000 MB/s
      networkIO: 1000, // 1000 MB/s
    };

    return (
      cpuUsage < thresholds.cpu &&
      (memoryUsage.used / memoryUsage.total) * 100 < thresholds.memory &&
      diskIO.read < thresholds.diskIO &&
      diskIO.write < thresholds.diskIO &&
      networkIO.rx < thresholds.networkIO &&
      networkIO.tx < thresholds.networkIO
    );
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    if (this.metrics) {
      callback(this.metrics);
    }
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.metrics));
  }

  setDuration(duration) {
    if (["1h", "6h", "24h", "7d"].includes(duration)) {
      this.duration = duration;
      this.fetchMetrics();
    }
  }
}

// Export the class
window.VMMetrics = VMMetrics;
