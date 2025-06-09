class VMOptimizer {
  constructor() {
    this.apiClient = new APIClient();
    this.currentVMId = null;
    this.subscribers = new Set();
  }

  async getRecommendations(vmId) {
    try {
      const response = await this.apiClient.get(
        `/api/vcenter/vms/${vmId}/recommendations`
      );
      this.notifySubscribers("recommendations", response.data.recommendations);
      return response.data.recommendations;
    } catch (error) {
      console.error("Error fetching VM recommendations:", error);
      throw new Error("خطا در دریافت توصیه‌های بهینه‌سازی");
    }
  }

  async optimizeVM(vmId) {
    try {
      const response = await this.apiClient.post(
        `/api/vcenter/vms/${vmId}/optimize`
      );
      this.notifySubscribers("optimization", response.data);
      return response.data;
    } catch (error) {
      console.error("Error optimizing VM:", error);
      throw new Error("خطا در بهینه‌سازی منابع سرور");
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

  formatRecommendation(recommendation) {
    const typeMap = {
      cpu: "پردازنده",
      memory: "حافظه",
      storage: "فضای ذخیره‌سازی",
      network: "پهنای باند",
    };

    const unitMap = {
      cpu: "vCPU",
      memory: "GB",
      storage: "GB",
      network: "Mbps",
    };

    return {
      type: typeMap[recommendation.type] || recommendation.type,
      current: `${recommendation.current} ${unitMap[recommendation.type]}`,
      recommended: `${recommendation.recommended} ${
        unitMap[recommendation.type]
      }`,
      reason: recommendation.reason,
    };
  }
}

// Create singleton instance
const vmOptimizer = new VMOptimizer();
