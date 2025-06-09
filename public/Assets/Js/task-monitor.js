class TaskMonitor {
  constructor() {
    this.apiClient = window.apiClient;
    this.tasks = [];
    this.pollingInterval = null;
  }

  // Start polling for tasks
  startPolling(interval = 5000) {
    this.pollingInterval = setInterval(() => this.fetchTasks(), interval);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Fetch tasks from the API
  async fetchTasks(limit = 10) {
    try {
      const response = await this.apiClient.get(
        `/vcenter/tasks?limit=${limit}`
      );
      this.tasks = response.data.tasks;
      this.notifyTaskUpdate();
      return this.tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  // Get task by ID
  getTaskById(taskId) {
    return this.tasks.find((task) => task.id === taskId);
  }

  // Get tasks for a specific VM
  getTasksForVM(vmId) {
    return this.tasks.filter((task) => task.target.id === vmId);
  }

  // Get recent tasks
  getRecentTasks(limit = 5) {
    return this.tasks.slice(0, limit);
  }

  // Check if a task is completed
  isTaskCompleted(taskId) {
    const task = this.getTaskById(taskId);
    return task && task.status === "success";
  }

  // Check if a task failed
  isTaskFailed(taskId) {
    const task = this.getTaskById(taskId);
    return task && task.status === "error";
  }

  // Get task duration
  getTaskDuration(taskId) {
    const task = this.getTaskById(taskId);
    if (!task || !task.startTime || !task.endTime) return null;

    const start = new Date(task.startTime);
    const end = new Date(task.endTime);
    return end - start;
  }

  // Notify subscribers of task updates
  notifyTaskUpdate() {
    if (this.onTaskUpdate) {
      this.onTaskUpdate(this.tasks);
    }
  }

  // Subscribe to task updates
  subscribe(callback) {
    this.onTaskUpdate = callback;
  }

  // Unsubscribe from task updates
  unsubscribe() {
    this.onTaskUpdate = null;
  }
}

// Create and export a singleton instance
const taskMonitor = new TaskMonitor();
