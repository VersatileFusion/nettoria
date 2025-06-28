class VCenterAlertsManager {
  constructor() {
    this.alerts = [];
    this.currentAlert = null;
    this.alertTypes = ["info", "warning", "error", "critical"];
  }

  // Initialize the vCenter alerts manager
  async initialize() {
    try {
      await this.loadAlerts();
      this.setupEventListeners();
      this.renderAlerts();
      this.startPolling();
    } catch (error) {
      console.error("Error initializing vCenter alerts:", error);
      this.showError("خطا در بارگذاری هشدارهای vCenter");
    }
  }

  // Load alerts from backend
  async loadAlerts() {
    try {
      const response = await fetch("/api/vcenter/alerts", {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vCenter alerts");
      }

      const data = await response.json();
      this.alerts = data.data || [];
    } catch (error) {
      console.error("Error loading vCenter alerts:", error);
      throw error;
    }
  }

  // Get authentication token
  getAuthToken() {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  // Render alerts in the UI
  renderAlerts() {
    const alertsContainer = document.querySelector(".vcenter-alerts-container");
    if (!alertsContainer) return;

    if (this.alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div class="no-alerts">
          <i class="bx bx-check-circle"></i>
          <h3>هیچ هشداری وجود ندارد</h3>
          <p>همه سیستم‌ها در وضعیت عادی هستند</p>
        </div>
      `;
      return;
    }

    alertsContainer.innerHTML = `
      <div class="alerts-header">
        <h2>هشدارهای vCenter</h2>
        <div class="alerts-filters">
          <select id="alert-type-filter" class="form-control">
            <option value="">همه انواع</option>
            ${this.alertTypes
              .map(
                (type) =>
                  `<option value="${type}">${this.getAlertTypeLabel(
                    type
                  )}</option>`
              )
              .join("")}
          </select>
          <select id="alert-status-filter" class="form-control">
            <option value="">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="resolved">حل شده</option>
          </select>
        </div>
      </div>
      <div class="alerts-list">
        ${this.alerts
          .map(
            (alert) => `
          <div class="alert-item alert-${alert.severity}" data-alert-id="${
              alert.id
            }" data-type="${alert.type}" data-status="${alert.status}">
            <div class="alert-header">
              <div class="alert-icon">
                <i class="bx ${this.getAlertIcon(alert.severity)}"></i>
              </div>
              <div class="alert-info">
                <h4>${alert.title}</h4>
                <p class="alert-description">${alert.description}</p>
                <div class="alert-meta">
                  <span class="alert-time">${this.formatDate(
                    alert.createdAt
                  )}</span>
                  <span class="alert-source">${alert.source}</span>
                  <span class="alert-status status-${
                    alert.status
                  }">${this.getStatusLabel(alert.status)}</span>
                </div>
              </div>
            </div>
            <div class="alert-actions">
              ${
                alert.status === "active"
                  ? `
                <button class="btn btn-sm btn-primary resolve-alert" data-alert-id="${alert.id}">
                  حل کردن
                </button>
              `
                  : ""
              }
              <button class="btn btn-sm btn-secondary view-details" data-alert-id="${
                alert.id
              }">
                جزئیات
              </button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  // Get alert type label
  getAlertTypeLabel(type) {
    const labels = {
      info: "اطلاعات",
      warning: "هشدار",
      error: "خطا",
      critical: "بحرانی",
    };
    return labels[type] || type;
  }

  // Get alert icon
  getAlertIcon(severity) {
    const icons = {
      info: "bx-info-circle",
      warning: "bx-error",
      error: "bx-x-circle",
      critical: "bx-error-circle",
    };
    return icons[severity] || "bx-info-circle";
  }

  // Get status label
  getStatusLabel(status) {
    const labels = {
      active: "فعال",
      resolved: "حل شده",
      acknowledged: "تایید شده",
    };
    return labels[status] || status;
  }

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("fa-IR");
  }

  // Setup event listeners
  setupEventListeners() {
    // Alert type filter
    const typeFilter = document.getElementById("alert-type-filter");
    if (typeFilter) {
      typeFilter.addEventListener("change", (e) => {
        this.filterAlerts();
      });
    }

    // Alert status filter
    const statusFilter = document.getElementById("alert-status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filterAlerts();
      });
    }

    // Resolve alert buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("resolve-alert")) {
        const alertId = e.target.dataset.alertId;
        this.resolveAlert(alertId);
      }

      if (e.target.classList.contains("view-details")) {
        const alertId = e.target.dataset.alertId;
        this.viewAlertDetails(alertId);
      }
    });
  }

  // Filter alerts
  filterAlerts() {
    const typeFilter = document.getElementById("alert-type-filter")?.value;
    const statusFilter = document.getElementById("alert-status-filter")?.value;

    const alertItems = document.querySelectorAll(".alert-item");

    alertItems.forEach((item) => {
      const type = item.dataset.type;
      const status = item.dataset.status;

      const typeMatch = !typeFilter || type === typeFilter;
      const statusMatch = !statusFilter || status === statusFilter;

      if (typeMatch && statusMatch) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Resolve alert
  async resolveAlert(alertId) {
    try {
      const response = await fetch(`/api/vcenter/alerts/${alertId}/resolve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to resolve alert");
      }

      this.showSuccess("هشدار با موفقیت حل شد");
      await this.loadAlerts();
      this.renderAlerts();
    } catch (error) {
      console.error("Error resolving alert:", error);
      this.showError("خطا در حل کردن هشدار");
    }
  }

  // View alert details
  viewAlertDetails(alertId) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return;

    this.currentAlert = alert;
    this.showAlertModal(alert);
  }

  // Show alert modal
  showAlertModal(alert) {
    const modal = document.createElement("div");
    modal.className = "modal alert-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>جزئیات هشدار</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert-detail">
            <h4>${alert.title}</h4>
            <p>${alert.description}</p>
            <div class="alert-details">
              <div class="detail-item">
                <strong>منبع:</strong> ${alert.source}
              </div>
              <div class="detail-item">
                <strong>نوع:</strong> ${this.getAlertTypeLabel(alert.type)}
              </div>
              <div class="detail-item">
                <strong>شدت:</strong> ${this.getAlertTypeLabel(alert.severity)}
              </div>
              <div class="detail-item">
                <strong>وضعیت:</strong> ${this.getStatusLabel(alert.status)}
              </div>
              <div class="detail-item">
                <strong>تاریخ ایجاد:</strong> ${this.formatDate(
                  alert.createdAt
                )}
              </div>
              ${
                alert.resolvedAt
                  ? `
                <div class="detail-item">
                  <strong>تاریخ حل:</strong> ${this.formatDate(
                    alert.resolvedAt
                  )}
                </div>
              `
                  : ""
              }
            </div>
            ${
              alert.additionalInfo
                ? `
              <div class="additional-info">
                <h5>اطلاعات اضافی:</h5>
                <pre>${JSON.stringify(alert.additionalInfo, null, 2)}</pre>
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Start polling for new alerts
  startPolling() {
    setInterval(async () => {
      try {
        await this.loadAlerts();
        this.renderAlerts();
      } catch (error) {
        console.error("Error polling for alerts:", error);
      }
    }, 30000); // Poll every 30 seconds
  }

  // Show success message
  showSuccess(message) {
    this.showToast(message, "success");
  }

  // Show error message
  showError(message) {
    this.showToast(message, "error");
  }

  // Show info message
  showInfo(message) {
    this.showToast(message, "info");
  }

  // Show toast notification
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const vcenterAlertsManager = new VCenterAlertsManager();
  vcenterAlertsManager.initialize();
});
