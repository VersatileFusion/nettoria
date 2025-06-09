// API Endpoints
const API_ENDPOINTS = {
  templates: "/api/sms/templates",
  send: "/api/sms/send",
  history: "/api/sms/history",
  groups: "/api/sms/groups",
};

// DOM Elements
const templatesList = document.querySelector(".templates-list");
const addTemplateBtn = document.querySelector(".add-template-btn");
const templateModal = document.querySelector(".template-modal");
const closeModalBtn = document.querySelector(".close-modal");
const templateForm = document.querySelector("#template-form");
const sendSmsForm = document.querySelector("#send-sms-form");
const historyList = document.querySelector(".history-list");
const statusFilter = document.querySelector("#status-filter");
const dateFilter = document.querySelector("#date-filter");
const prevPageBtn = document.querySelector("#prev-page");
const nextPageBtn = document.querySelector("#next-page");
const pageInfo = document.querySelector("#page-info");
const templateSelect = document.querySelector("#template");
const recipientsType = document.querySelector("#recipients-type");
const recipientsInputContainer = document.querySelector(
  "#recipients-input-container"
);
const messageTextarea = document.querySelector("#message");
const charCount = document.querySelector("#char-count");

// State
let currentPage = 1;
let totalPages = 1;
let selectedTemplate = null;
let templates = [];
let smsHistory = [];

// Template Management
async function loadTemplates() {
  try {
    const response = await fetch(API_ENDPOINTS.templates, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await response.json();
    templates = data.templates;
    renderTemplates();
    updateTemplateSelect();
  } catch (error) {
    console.error("Error loading templates:", error);
    showNotification("خطا در بارگذاری قالب‌ها", "error");
  }
}

async function saveTemplate(event) {
  event.preventDefault();

  const formData = new FormData(templateForm);
  const templateData = {
    name: formData.get("template-name"),
    content: formData.get("template-content"),
  };

  try {
    const response = await fetch(API_ENDPOINTS.templates, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(templateData),
    });

    if (response.ok) {
      closeModal();
      await loadTemplates();
      showNotification("قالب با موفقیت ذخیره شد", "success");
    } else {
      throw new Error("Failed to save template");
    }
  } catch (error) {
    console.error("Error saving template:", error);
    showNotification("خطا در ذخیره قالب", "error");
  }
}

async function deleteTemplate(templateId) {
  if (!confirm("آیا از حذف این قالب اطمینان دارید؟")) return;

  try {
    const response = await fetch(`${API_ENDPOINTS.templates}/${templateId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      await loadTemplates();
      showNotification("قالب با موفقیت حذف شد", "success");
    } else {
      throw new Error("Failed to delete template");
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    showNotification("خطا در حذف قالب", "error");
  }
}

function editTemplate(templateId) {
  selectedTemplate = templateId;
  // Load template data and show modal
  fetch(`${API_ENDPOINTS.templates}/${templateId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((template) => {
      document.querySelector("#template-name").value = template.name;
      document.querySelector("#template-content").value = template.content;
      openModal();
    })
    .catch((error) => {
      console.error("Error loading template:", error);
      showNotification("خطا در بارگذاری قالب", "error");
    });
}

// SMS Sending
async function sendSMS(event) {
  event.preventDefault();

  const formData = new FormData(sendSmsForm);
  const smsData = {
    templateId: formData.get("template"),
    recipientType: formData.get("recipient-type"),
    recipients: formData.get("recipients"),
    message: formData.get("message"),
  };

  try {
    const response = await fetch(API_ENDPOINTS.send, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(smsData),
    });

    if (response.ok) {
      showNotification("پیام با موفقیت ارسال شد", "success");
      sendSmsForm.reset();
      await loadHistory();
    } else {
      throw new Error("Failed to send SMS");
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    showNotification("خطا در ارسال پیام", "error");
  }
}

// History Management
async function loadHistory() {
  const status = statusFilter.value;
  const date = dateFilter.value;

  try {
    const response = await fetch(
      `${API_ENDPOINTS.history}?page=${currentPage}&status=${status}&date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await response.json();

    totalPages = data.totalPages;
    updatePagination();

    smsHistory = data.history;
    renderSmsHistory();
  } catch (error) {
    console.error("Error loading history:", error);
    showNotification("خطا در بارگذاری تاریخچه", "error");
  }
}

function updatePagination() {
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  pageInfo.textContent = `صفحه ${currentPage} از ${totalPages}`;
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusText(status) {
  const statusMap = {
    sent: "ارسال شده",
    failed: "ناموفق",
    pending: "در انتظار",
  };
  return statusMap[status] || status;
}

function showNotification(message, type) {
  // Implement notification system
  console.log(`${type}: ${message}`);
}

function openModal() {
  templateModal.classList.add("active");
}

function closeModal() {
  templateModal.classList.remove("active");
  templateForm.reset();
  selectedTemplate = null;
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  initializePage();
});

addTemplateBtn.addEventListener("click", () => {
  selectedTemplate = null;
  templateForm.reset();
  openModal();
});

closeModalBtn.addEventListener("click", closeModal);

templateForm.addEventListener("submit", saveTemplate);
sendSmsForm.addEventListener("submit", sendSMS);

statusFilter.addEventListener("change", loadHistory);
dateFilter.addEventListener("change", loadHistory);

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadHistory();
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadHistory();
  }
});

// Template Variables
document.querySelectorAll(".variable-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const textarea = document.querySelector("#template-content");
    const variable = btn.dataset.variable;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + variable + text.substring(end);
    textarea.value = newText;
    textarea.focus();
    textarea.setSelectionRange(
      start + variable.length,
      start + variable.length
    );
  });
});

// Character Count
messageTextarea.addEventListener("input", () => {
  const count = messageTextarea.value.length;
  charCount.textContent = `${count} کاراکتر`;

  if (count > 160) {
    charCount.classList.add("warning");
  } else {
    charCount.classList.remove("warning");
  }
});

// Update template select dropdown
function updateTemplateSelect() {
  templateSelect.innerHTML = `
    <option value="">انتخاب قالب</option>
    ${templates
      .map(
        (template) => `
      <option value="${template.id}">${template.name}</option>
    `
      )
      .join("")}
  `;
}

// Render SMS history
function renderSmsHistory() {
  historyList.innerHTML = smsHistory
    .map(
      (sms) => `
    <div class="history-item ${sms.status}">
      <div class="history-info">
        <p class="recipient">${sms.recipient}</p>
        <p class="message">${sms.message}</p>
        <p class="timestamp">${formatDate(sms.timestamp)}</p>
      </div>
      <div class="history-status">
        <span class="status-badge">${getStatusText(sms.status)}</span>
      </div>
    </div>
  `
    )
    .join("");
}

// Update recipients input based on type
function updateRecipientsInput() {
  const type = recipientsType.value;
  let html = "";

  switch (type) {
    case "single":
      html =
        '<input type="text" id="recipients" placeholder="شماره موبایل گیرنده" required>';
      break;
    case "multiple":
      html =
        '<textarea id="recipients" placeholder="شماره موبایل گیرندگان (با کاما جدا کنید)" required></textarea>';
      break;
    case "group":
      html =
        '<select id="recipients" required><option value="">انتخاب گروه</option></select>';
      break;
  }

  recipientsInputContainer.innerHTML = html;
}

// Initialize the page
async function initializePage() {
  await Promise.all([loadTemplates(), loadHistory(), loadSmsCredit()]);
}

// Load SMS credit
async function loadSmsCredit() {
  try {
    const response = await fetch(`${API_ENDPOINTS.templates}/credit`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await response.json();
    // Update credit display
    document.querySelector(
      ".credit-display"
    ).textContent = `اعتبار باقیمانده: ${data.credit} پیامک`;
  } catch (error) {
    showNotification("خطا در بارگذاری اعتبار", "error");
  }
}
