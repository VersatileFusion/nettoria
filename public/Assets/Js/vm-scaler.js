class VMScaler {
  constructor() {
    this.apiClient = new APIClient();
    this.currentVMId = null;
    this.subscribers = new Set();
  }

  async scaleResources(vmId, scaleData) {
    try {
      const response = await this.apiClient.post(
        `/api/vcenter/vms/${vmId}/scale`,
        scaleData
      );
      this.notifySubscribers("scale", response.data);
      return response.data;
    } catch (error) {
      console.error("Error scaling VM resources:", error);
      throw new Error("خطا در تغییر منابع سرور");
    }
  }

  async getAlerts(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await this.apiClient.get(
        `/api/vcenter/alerts?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw new Error("خطا در دریافت هشدارها");
    }
  }

  async resolveAlert(alertId) {
    try {
      const response = await this.apiClient.post(
        `/api/vcenter/alerts/${alertId}/resolve`
      );
      this.notifySubscribers("alertResolved", { alertId });
      return response.data;
    } catch (error) {
      console.error("Error resolving alert:", error);
      throw new Error("خطا در برطرف کردن هشدار");
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach((callback) => callback(event, data));
  }

  setCurrentVM(vmId) {
    this.currentVMId = vmId;
  }

  getCurrentVM() {
    return this.currentVMId;
  }
}

// Create singleton instance
const vmScaler = new VMScaler();
