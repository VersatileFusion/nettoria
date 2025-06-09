class VMCreator {
  constructor() {
    this.apiClient = new APIClient();
    this.config = {
      name: "",
      cpuCount: 1,
      memoryGB: 1,
      diskGB: 10,
      hostSystem: "",
      datastore: "",
      osType: "",
      networkConfig: [],
    };
  }

  // Initialize VM creation workflow
  async initialize() {
    try {
      const [hosts, datastores] = await Promise.all([
        this.getAvailableHosts(),
        this.getAvailableDatastores(),
      ]);

      return {
        hosts,
        datastores,
      };
    } catch (error) {
      console.error("Error initializing VM creation:", error);
      throw new Error("خطا در بارگذاری منابع");
    }
  }

  // Get available hosts
  async getAvailableHosts() {
    try {
      const response = await this.apiClient.get("/api/vcenter/hosts");
      return response.data;
    } catch (error) {
      console.error("Error fetching hosts:", error);
      throw new Error("خطا در دریافت لیست هاست‌ها");
    }
  }

  // Get available datastores
  async getAvailableDatastores() {
    try {
      const response = await this.apiClient.get("/api/vcenter/datastores");
      return response.data;
    } catch (error) {
      console.error("Error fetching datastores:", error);
      throw new Error("خطا در دریافت لیست فضای ذخیره‌سازی");
    }
  }

  // Get available networks
  async getAvailableNetworks() {
    try {
      const response = await this.apiClient.get("/api/vcenter/networks");
      return response.data;
    } catch (error) {
      console.error("Error fetching networks:", error);
      throw new Error("خطا در دریافت لیست شبکه‌ها");
    }
  }

  // Get available OS templates
  async getOSTemplates() {
    try {
      const response = await this.apiClient.get("/api/vcenter/templates");
      return response.data;
    } catch (error) {
      console.error("Error fetching OS templates:", error);
      throw new Error("خطا در دریافت لیست قالب‌های سیستم عامل");
    }
  }

  // Validate VM configuration
  validateVMConfig() {
    const errors = [];

    if (!this.config.name) {
      errors.push("نام سرور الزامی است");
    } else if (this.config.name.length < 3 || this.config.name.length > 50) {
      errors.push("نام سرور باید بین 3 تا 50 کاراکتر باشد");
    }

    if (
      !this.config.cpuCount ||
      this.config.cpuCount < 1 ||
      this.config.cpuCount > 32
    ) {
      errors.push("تعداد CPU باید بین 1 تا 32 باشد");
    }

    if (
      !this.config.memoryGB ||
      this.config.memoryGB < 1 ||
      this.config.memoryGB > 256
    ) {
      errors.push("حافظه باید بین 1 تا 256 گیگابایت باشد");
    }

    if (
      !this.config.diskGB ||
      this.config.diskGB < 10 ||
      this.config.diskGB > 2000
    ) {
      errors.push("فضای ذخیره‌سازی باید بین 10 تا 2000 گیگابایت باشد");
    }

    if (!this.config.hostSystem) {
      errors.push("انتخاب هاست الزامی است");
    }

    if (!this.config.datastore) {
      errors.push("انتخاب فضای ذخیره‌سازی الزامی است");
    }

    if (!this.config.osType) {
      errors.push("انتخاب سیستم عامل الزامی است");
    }

    if (this.config.networkConfig.length === 0) {
      errors.push("حداقل یک کارت شبکه باید اضافه شود");
    }

    return errors;
  }

  // Create VM
  async createVM() {
    const errors = this.validateVMConfig();
    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }

    try {
      const response = await this.apiClient.post(
        "/api/vcenter/vms",
        this.config
      );
      return response.data;
    } catch (error) {
      console.error("Error creating VM:", error);
      throw new Error("خطا در ایجاد سرور مجازی");
    }
  }

  // Update VM configuration
  updateConfig(key, value) {
    if (key in this.config) {
      this.config[key] = value;
    }
  }

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }

  // Reset configuration
  resetConfig() {
    this.config = {
      name: "",
      cpuCount: 1,
      memoryGB: 1,
      diskGB: 10,
      hostSystem: "",
      datastore: "",
      osType: "",
      networkConfig: [],
    };
  }
}

// Create and export a singleton instance
const vmCreator = new VMCreator();
