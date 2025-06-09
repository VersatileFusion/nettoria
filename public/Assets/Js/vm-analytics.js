class VMAnalytics {
  constructor() {
    this.apiClient = new APIClient();
    this.currentVMId = null;
    this.subscribers = new Set();
    this.analyticsCharts = {};
    this.forecastCharts = {};
  }

  async getAnalytics(vmId, period = "day") {
    try {
      const response = await this.apiClient.get(
        `/api/vcenter/vms/${vmId}/analytics?period=${period}`
      );
      this.notifySubscribers("analytics", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching VM analytics:", error);
      throw new Error("خطا در دریافت تحلیل‌های عملکرد");
    }
  }

  async getForecast(vmId, horizon = "24h") {
    try {
      const response = await this.apiClient.get(
        `/api/vcenter/vms/${vmId}/forecast?horizon=${horizon}`
      );
      this.notifySubscribers("forecast", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching VM forecast:", error);
      throw new Error("خطا در دریافت پیش‌بینی مصرف منابع");
    }
  }

  initializeCharts() {
    // CPU Analytics Chart
    this.analyticsCharts.cpu = new Chart(
      document.getElementById("cpu-analytics-chart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "CPU Usage",
              borderColor: "#4CAF50",
              data: [],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "time",
              time: {
                unit: "hour",
              },
            },
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      }
    );

    // Memory Analytics Chart
    this.analyticsCharts.memory = new Chart(
      document.getElementById("memory-analytics-chart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Memory Usage",
              borderColor: "#2196F3",
              data: [],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "time",
              time: {
                unit: "hour",
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      }
    );

    // CPU Forecast Chart
    this.forecastCharts.cpu = new Chart(
      document.getElementById("cpu-forecast-chart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Predicted CPU Usage",
              borderColor: "#4CAF50",
              data: [],
            },
            {
              label: "Confidence Interval",
              borderColor: "rgba(76, 175, 80, 0.2)",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              data: [],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "time",
              time: {
                unit: "hour",
              },
            },
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      }
    );

    // Memory Forecast Chart
    this.forecastCharts.memory = new Chart(
      document.getElementById("memory-forecast-chart"),
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Predicted Memory Usage",
              borderColor: "#2196F3",
              data: [],
            },
            {
              label: "Confidence Interval",
              borderColor: "rgba(33, 150, 243, 0.2)",
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              data: [],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "time",
              time: {
                unit: "hour",
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      }
    );
  }

  updateAnalyticsCharts(analytics) {
    if (!analytics) return;

    // Update CPU chart
    const cpuData = analytics.cpu.utilization.map((point) => ({
      x: new Date(point.timestamp),
      y: point.value,
    }));
    this.analyticsCharts.cpu.data.datasets[0].data = cpuData;
    this.analyticsCharts.cpu.update();

    // Update Memory chart
    const memoryData = analytics.memory.utilization.map((point) => ({
      x: new Date(point.timestamp),
      y: point.value,
    }));
    this.analyticsCharts.memory.data.datasets[0].data = memoryData;
    this.analyticsCharts.memory.update();
  }

  updateForecastCharts(forecast) {
    if (!forecast) return;

    // Update CPU forecast chart
    const cpuData = forecast.cpu.map((point) => ({
      x: new Date(point.timestamp),
      y: point.predicted,
    }));
    const cpuConfidence = forecast.cpu.map((point) => ({
      x: new Date(point.timestamp),
      y: point.confidence,
    }));
    this.forecastCharts.cpu.data.datasets[0].data = cpuData;
    this.forecastCharts.cpu.data.datasets[1].data = cpuConfidence;
    this.forecastCharts.cpu.update();

    // Update Memory forecast chart
    const memoryData = forecast.memory.map((point) => ({
      x: new Date(point.timestamp),
      y: point.predicted,
    }));
    const memoryConfidence = forecast.memory.map((point) => ({
      x: new Date(point.timestamp),
      y: point.confidence,
    }));
    this.forecastCharts.memory.data.datasets[0].data = memoryData;
    this.forecastCharts.memory.data.datasets[1].data = memoryConfidence;
    this.forecastCharts.memory.update();
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

  destroyCharts() {
    Object.values(this.analyticsCharts).forEach((chart) => chart.destroy());
    Object.values(this.forecastCharts).forEach((chart) => chart.destroy());
    this.analyticsCharts = {};
    this.forecastCharts = {};
  }
}

// Create singleton instance
const vmAnalytics = new VMAnalytics();
