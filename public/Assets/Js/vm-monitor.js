class VMMonitor {
  constructor() {
    this.apiClient = window.apiClient;
    this.metrics = new Map();
    this.pollingIntervals = new Map();
  }

  // Start monitoring a VM
  startMonitoring(vmId, interval = 10000) {
    if (this.pollingIntervals.has(vmId)) {
      this.stopMonitoring(vmId);
    }

    const intervalId = setInterval(() => this.fetchMetrics(vmId), interval);
    this.pollingIntervals.set(vmId, intervalId);
  }

  // Stop monitoring a VM
  stopMonitoring(vmId) {
    const intervalId = this.pollingIntervals.get(vmId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(vmId);
      this.metrics.delete(vmId);
    }
  }

  // Fetch metrics for a VM
  async fetchMetrics(vmId) {
    try {
      const response = await this.apiClient.get(`/vcenter/vms/${vmId}/metrics`);
      this.metrics.set(vmId, response.data.metrics);
      this.notifyMetricsUpdate(vmId);
      return response.data.metrics;
    } catch (error) {
      console.error(`Error fetching metrics for VM ${vmId}:`, error);
      throw error;
    }
  }

  // Get current metrics for a VM
  getMetrics(vmId) {
    return this.metrics.get(vmId);
  }

  // Get CPU usage
  getCPUUsage(vmId) {
    const metrics = this.metrics.get(vmId);
    return metrics?.cpu?.usage || 0;
  }

  // Get memory usage
  getMemoryUsage(vmId) {
    const metrics = this.metrics.get(vmId);
    return metrics?.memory?.usage || 0;
  }

  // Get disk usage
  getDiskUsage(vmId) {
    const metrics = this.metrics.get(vmId);
    return metrics?.disk?.usage || 0;
  }

  // Get network usage
  getNetworkUsage(vmId) {
    const metrics = this.metrics.get(vmId);
    return {
      rx: metrics?.network?.rx || 0,
      tx: metrics?.network?.tx || 0,
    };
  }

  // Get uptime
  getUptime(vmId) {
    const metrics = this.metrics.get(vmId);
    return metrics?.uptime || 0;
  }

  // Check if VM is healthy
  isVMHealthy(vmId) {
    const metrics = this.metrics.get(vmId);
    if (!metrics) return false;

    const cpuUsage = this.getCPUUsage(vmId);
    const memoryUsage = this.getMemoryUsage(vmId);
    const diskUsage = this.getDiskUsage(vmId);

    return cpuUsage < 90 && memoryUsage < 90 && diskUsage < 90;
  }

  // Get resource utilization trend
  getResourceTrend(vmId, resource, duration = 3600000) {
    // 1 hour by default
    const metrics = this.metrics.get(vmId);
    if (!metrics || !metrics.history) return [];

    const now = Date.now();
    return metrics.history
      .filter((point) => point.timestamp > now - duration)
      .map((point) => ({
        timestamp: point.timestamp,
        value: point[resource],
      }));
  }

  // Notify subscribers of metrics updates
  notifyMetricsUpdate(vmId) {
    const metrics = this.metrics.get(vmId);
    if (metrics && this.onMetricsUpdate) {
      this.onMetricsUpdate(vmId, metrics);
    }
  }

  // Subscribe to metrics updates
  subscribe(callback) {
    this.onMetricsUpdate = callback;
  }

  // Unsubscribe from metrics updates
  unsubscribe() {
    this.onMetricsUpdate = null;
  }
}

// Create and export a singleton instance
const vmMonitor = new VMMonitor();
