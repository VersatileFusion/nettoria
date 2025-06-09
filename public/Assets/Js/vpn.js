class VPNSystem {
  constructor() {
    this.statusContainer = document.getElementById("vpnStatus");
    this.serverList = document.getElementById("serverList");
    this.usageStats = document.getElementById("usageStats");
    this.connectButton = document.getElementById("connectButton");
    this.disconnectButton = document.getElementById("disconnectButton");
    this.configContainer = document.getElementById("vpnConfig");

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadStatus();
    await this.loadServers();
    await this.loadUsage();
    await this.loadConfig();
  }

  setupEventListeners() {
    if (this.connectButton) {
      this.connectButton.addEventListener("click", () => this.connect());
    }

    if (this.disconnectButton) {
      this.disconnectButton.addEventListener("click", () => this.disconnect());
    }
  }

  async loadStatus() {
    try {
      showLoading();
      const response = await apiService.getVPNStatus();
      hideLoading();

      if (response.status === "success") {
        this.renderStatus(response.data.status);
      } else {
        showNotification("خطا در دریافت وضعیت VPN", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در دریافت وضعیت VPN", "error");
    }
  }

  renderStatus(status) {
    if (!this.statusContainer) return;

    const { connected, lastConnected, currentServer, dataUsage } = status;
    const lastConnectedDate = lastConnected
      ? new Date(lastConnected).toLocaleString("fa-IR")
      : "بدون اتصال";

    this.statusContainer.innerHTML = `
      <div class="status-card ${connected ? "connected" : "disconnected"}">
        <h3>وضعیت اتصال</h3>
        <p>${connected ? "متصل" : "قطع"}</p>
        ${currentServer ? `<p>سرور فعلی: ${currentServer}</p>` : ""}
        <p>آخرین اتصال: ${lastConnectedDate}</p>
        <div class="data-usage">
          <p>آپلود: ${this.formatBytes(dataUsage.upload)}</p>
          <p>دانلود: ${this.formatBytes(dataUsage.download)}</p>
        </div>
      </div>
    `;
  }

  async loadServers() {
    try {
      showLoading();
      const response = await apiService.getVPNServers();
      hideLoading();

      if (response.status === "success") {
        this.renderServers(response.data.servers);
      } else {
        showNotification("خطا در دریافت لیست سرورها", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در دریافت لیست سرورها", "error");
    }
  }

  renderServers(servers) {
    if (!this.serverList) return;

    this.serverList.innerHTML = servers
      .map(
        (server) => `
      <div class="server-card">
        <h3>${server.name}</h3>
        <p>موقعیت: ${server.location}</p>
        <p>بار: ${server.load}%</p>
        <p>پینگ: ${server.ping}ms</p>
        <button class="btn btn-primary" onclick="vpnSystem.connectToServer('${server.id}')">اتصال</button>
      </div>
    `
      )
      .join("");
  }

  async loadUsage() {
    try {
      showLoading();
      const response = await apiService.getVPNUsage();
      hideLoading();

      if (response.status === "success") {
        this.renderUsage(response.data.usage);
      } else {
        showNotification("خطا در دریافت آمار مصرف", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در دریافت آمار مصرف", "error");
    }
  }

  renderUsage(usage) {
    if (!this.usageStats) return;

    const { total, daily } = usage;
    const dailyUsage = daily
      .map(
        (day) => `
      <div class="daily-usage">
        <p>تاریخ: ${new Date(day.date).toLocaleDateString("fa-IR")}</p>
        <p>آپلود: ${this.formatBytes(day.upload)}</p>
        <p>دانلود: ${this.formatBytes(day.download)}</p>
      </div>
    `
      )
      .join("");

    this.usageStats.innerHTML = `
      <div class="usage-card">
        <h3>آمار مصرف</h3>
        <div class="total-usage">
          <h4>کل مصرف</h4>
          <p>آپلود: ${this.formatBytes(total.upload)}</p>
          <p>دانلود: ${this.formatBytes(total.download)}</p>
        </div>
        <div class="daily-usage-list">
          <h4>مصرف روزانه</h4>
          ${dailyUsage}
        </div>
      </div>
    `;
  }

  async loadConfig() {
    try {
      showLoading();
      const response = await apiService.getVPNConfig();
      hideLoading();

      if (response.status === "success") {
        this.renderConfig(response.data.config);
      } else {
        showNotification("خطا در دریافت تنظیمات VPN", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در دریافت تنظیمات VPN", "error");
    }
  }

  renderConfig(config) {
    if (!this.configContainer) return;

    this.configContainer.innerHTML = `
      <div class="config-card">
        <h3>تنظیمات VPN</h3>
        <p>سرور: ${config.server}</p>
        <p>پورت: ${config.port}</p>
        <p>پروتکل: ${config.protocol}</p>
        <p>نام کاربری: ${config.username}</p>
        <p>وضعیت: ${config.status}</p>
        <button class="btn btn-secondary" onclick="vpnSystem.downloadConfig()">دانلود فایل تنظیمات</button>
      </div>
    `;
  }

  async connect() {
    try {
      showLoading();
      const response = await apiService.connectVPN();
      hideLoading();

      if (response.status === "success") {
        showNotification("اتصال به VPN با موفقیت انجام شد", "success");
        await this.loadStatus();
      } else {
        showNotification("خطا در اتصال به VPN", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در اتصال به VPN", "error");
    }
  }

  async disconnect() {
    try {
      showLoading();
      const response = await apiService.disconnectVPN();
      hideLoading();

      if (response.status === "success") {
        showNotification("قطع اتصال VPN با موفقیت انجام شد", "success");
        await this.loadStatus();
      } else {
        showNotification("خطا در قطع اتصال VPN", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در قطع اتصال VPN", "error");
    }
  }

  async connectToServer(serverId) {
    try {
      showLoading();
      const response = await apiService.connectVPN(serverId);
      hideLoading();

      if (response.status === "success") {
        showNotification("اتصال به سرور با موفقیت انجام شد", "success");
        await this.loadStatus();
      } else {
        showNotification("خطا در اتصال به سرور", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در اتصال به سرور", "error");
    }
  }

  downloadConfig() {
    // TODO: Implement config file download
    showNotification("دانلود فایل تنظیمات", "info");
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Initialize VPN system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.vpnSystem = new VPNSystem();
});
