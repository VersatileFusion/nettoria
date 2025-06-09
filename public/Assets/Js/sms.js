class SMSSystem {
  constructor() {
    this.form = document.getElementById("sms-form");
    this.recipientInput = document.getElementById("recipient");
    this.messageInput = document.getElementById("message");
    this.charCount = document.getElementById("char-count");
    this.historyList = document.querySelector(".history-list");
    this.pagination = document.querySelector(".pagination");
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
  }

  async init() {
    try {
      showLoading();
      await this.loadHistory();
      this.setupEventListeners();
    } catch (error) {
      showError("خطا در بارگذاری سیستم پیامک");
    } finally {
      hideLoading();
    }
  }

  setupEventListeners() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.messageInput.addEventListener("input", () => this.updateCharCount());
  }

  updateCharCount() {
    const count = this.messageInput.value.length;
    this.charCount.textContent = count;

    if (count > 160) {
      this.charCount.style.color = "red";
    } else {
      this.charCount.style.color = "inherit";
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const recipient = this.recipientInput.value;
    const message = this.messageInput.value;

    if (!this.validateInputs(recipient, message)) {
      return;
    }

    try {
      showLoading();
      await apiService.sendSMS(recipient, message);
      showSuccess("پیامک با موفقیت ارسال شد");
      this.form.reset();
      this.updateCharCount();
      await this.loadHistory();
    } catch (error) {
      showError("خطا در ارسال پیامک");
    } finally {
      hideLoading();
    }
  }

  validateInputs(recipient, message) {
    if (!recipient.match(/^09[0-9]{9}$/)) {
      showError("شماره موبایل نامعتبر است");
      return false;
    }

    if (!message.trim()) {
      showError("لطفا متن پیام را وارد کنید");
      return false;
    }

    if (message.length > 160) {
      showError("طول پیام نباید بیشتر از 160 کاراکتر باشد");
      return false;
    }

    return true;
  }

  async loadHistory() {
    try {
      const response = await apiService.getSMSHistory(
        this.currentPage,
        this.itemsPerPage
      );
      this.totalPages = Math.ceil(response.total / this.itemsPerPage);
      this.renderHistory(response.items);
      this.renderPagination();
    } catch (error) {
      showError("خطا در بارگذاری تاریخچه پیامک‌ها");
    }
  }

  renderHistory(items) {
    if (!items.length) {
      this.historyList.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-message-square-x'></i>
                    <p>هیچ پیامکی ارسال نشده است</p>
                </div>
            `;
      return;
    }

    this.historyList.innerHTML = items
      .map(
        (item) => `
            <div class="history-item">
                <div class="history-header">
                    <span class="recipient">${item.recipient}</span>
                    <span class="date">${formatDate(item.created_at)}</span>
                </div>
                <div class="message">${item.message}</div>
                <div class="status ${item.status}">${this.getStatusText(
          item.status
        )}</div>
            </div>
        `
      )
      .join("");
  }

  renderPagination() {
    if (this.totalPages <= 1) {
      this.pagination.innerHTML = "";
      return;
    }

    let html = "";

    // Previous button
    html += `
            <button class="pagination-btn" 
                    ${this.currentPage === 1 ? "disabled" : ""}
                    data-page="${this.currentPage - 1}">
                <i class='bx bx-chevron-right'></i>
            </button>
        `;

    // Page numbers
    for (let i = 1; i <= this.totalPages; i++) {
      if (
        i === 1 ||
        i === this.totalPages ||
        (i >= this.currentPage - 2 && i <= this.currentPage + 2)
      ) {
        html += `
                    <button class="pagination-btn ${
                      i === this.currentPage ? "active" : ""
                    }"
                            data-page="${i}">
                        ${i}
                    </button>
                `;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        html += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    // Next button
    html += `
            <button class="pagination-btn" 
                    ${this.currentPage === this.totalPages ? "disabled" : ""}
                    data-page="${this.currentPage + 1}">
                <i class='bx bx-chevron-left'></i>
            </button>
        `;

    this.pagination.innerHTML = html;
    this.addPaginationEventListeners();
  }

  addPaginationEventListeners() {
    const buttons = this.pagination.querySelectorAll(".pagination-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const page = parseInt(button.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          await this.loadHistory();
        }
      });
    });
  }

  getStatusText(status) {
    const statusMap = {
      sent: "ارسال شده",
      delivered: "تحویل داده شده",
      failed: "ناموفق",
      pending: "در انتظار",
    };
    return statusMap[status] || status;
  }
}

// Initialize SMS system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const smsSystem = new SMSSystem();
  smsSystem.init();
});

// SMS service management functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeSMSService();
  loadSMSHistory();
  loadTemplates();
});

// Initialize SMS service
function initializeSMSService() {
  const sendForm = document.getElementById("sendSMSForm");
  if (sendForm) {
    sendForm.addEventListener("submit", handleSMSSend);
  }
}

// Handle SMS sending
async function handleSMSSend(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const smsData = {
    recipient: formData.get("recipient"),
    message: formData.get("message"),
    template: formData.get("template"),
  };

  try {
    showLoading();
    const response = await fetch("/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(smsData),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("SMS sent successfully!", "success");
      event.target.reset();
      loadSMSHistory();
    } else {
      throw new Error(data.message || "Failed to send SMS");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Load SMS history
async function loadSMSHistory() {
  try {
    showLoading();
    const response = await fetch("/api/sms/history");
    const data = await response.json();

    if (response.ok) {
      renderSMSHistory(data.messages);
    } else {
      throw new Error(data.message || "Failed to load SMS history");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render SMS history
function renderSMSHistory(messages) {
  const historyContainer = document.getElementById("smsHistory");
  if (!historyContainer) return;

  if (messages.length === 0) {
    historyContainer.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-comment-slash"></i>
                <p>No SMS history found</p>
            </div>
        `;
    return;
  }

  historyContainer.innerHTML = messages
    .map(
      (message) => `
        <div class="sms-card ${message.status.toLowerCase()}">
            <div class="sms-header">
                <h3>${message.recipient}</h3>
                <span class="sms-status">${message.status}</span>
            </div>
            <div class="sms-body">
                <p>${message.content}</p>
                <div class="sms-meta">
                    <span><i class="fas fa-clock"></i> ${new Date(
                      message.sentAt
                    ).toLocaleString()}</span>
                    <span><i class="fas fa-tag"></i> ${
                      message.template || "Custom"
                    }</span>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Load SMS templates
async function loadTemplates() {
  try {
    showLoading();
    const response = await fetch("/api/sms/templates");
    const data = await response.json();

    if (response.ok) {
      renderTemplates(data.templates);
    } else {
      throw new Error(data.message || "Failed to load templates");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render SMS templates
function renderTemplates(templates) {
  const templatesContainer = document.getElementById("smsTemplates");
  if (!templatesContainer) return;

  templatesContainer.innerHTML = templates
    .map(
      (template) => `
        <div class="template-card">
            <div class="template-header">
                <h3>${template.name}</h3>
                <div class="template-actions">
                    <button onclick="editTemplate('${
                      template._id
                    }')" class="btn btn-secondary">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTemplate('${
                      template._id
                    }')" class="btn btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="template-body">
                <p>${template.content}</p>
                <div class="template-meta">
                    <span><i class="fas fa-clock"></i> Last updated: ${new Date(
                      template.updatedAt
                    ).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Create new template
async function createTemplate() {
  const name = prompt("Enter template name:");
  if (!name) return;

  const content = prompt("Enter template content:");
  if (!content) return;

  try {
    showLoading();
    const response = await fetch("/api/sms/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, content }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Template created successfully!", "success");
      loadTemplates();
    } else {
      throw new Error(data.message || "Failed to create template");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Edit template
async function editTemplate(templateId) {
  try {
    showLoading();
    const response = await fetch(`/api/sms/templates/${templateId}`);
    const data = await response.json();

    if (response.ok) {
      const template = data.template;
      const newName = prompt("Enter new template name:", template.name);
      if (!newName) return;

      const newContent = prompt(
        "Enter new template content:",
        template.content
      );
      if (!newContent) return;

      const updateResponse = await fetch(`/api/sms/templates/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName, content: newContent }),
      });

      const updateData = await updateResponse.json();

      if (updateResponse.ok) {
        showToast("Template updated successfully!", "success");
        loadTemplates();
      } else {
        throw new Error(updateData.message || "Failed to update template");
      }
    } else {
      throw new Error(data.message || "Failed to load template");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Delete template
async function deleteTemplate(templateId) {
  if (!confirm("Are you sure you want to delete this template?")) return;

  try {
    showLoading();
    const response = await fetch(`/api/sms/templates/${templateId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Template deleted successfully!", "success");
      loadTemplates();
    } else {
      throw new Error(data.message || "Failed to delete template");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Utility functions
function showLoading() {
  const loading = document.createElement("div");
  loading.className = "loading-spinner";
  loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.querySelector(".loading-spinner");
  if (loading) {
    loading.remove();
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
