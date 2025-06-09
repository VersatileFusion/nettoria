const menuIcon = document.querySelector(".bx-menu");
const navbar = document.querySelector(".navbar");

// Open menu
menuIcon.addEventListener("click", () => {
  navbar.classList.toggle("active");
  menuIcon.classList.toggle("menu-fixed");
  // Hide menu icon when menu is open
  menuIcon.style.visibility = menuIcon.classList.contains("bx-menu")
    ? "hidden"
    : "visible";
});

// Close menu when clicking anywhere outside
document.addEventListener("click", (e) => {
  // Check if click is outside both navbar and menu icon
  if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    // Show menu icon when menu is closed
    menuIcon.style.visibility = "visible";
  }
});

// Close menu when clicking on links
document.querySelectorAll(".navbar a").forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    // Show menu icon when menu is closed
    menuIcon.style.visibility = "visible";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.querySelector(".search-btn");
  const domainInput = document.getElementById("domain-input");
  const tldSelect = document.getElementById("tld-select");
  const domainStatus = document.querySelector(".domain-status");
  const domainStatusText = document.getElementById("domain-status-text");
  const domainDetails = document.querySelector(".domain-details");
  const paymentPeriod = document.getElementById("payment-period");
  const totalAmount = document.querySelector(".total-amount");
  const paymentBtn = document.querySelector(".payment-btn");

  // Base price for domain (yearly)
  const basePrice = 1130000;

  // Handle domain search
  searchBtn.addEventListener("click", () => {
    const domain = domainInput.value.trim();
    const tld = tldSelect.value;

    if (domain) {
      const fullDomain = domain + tld;
      // Show success message and domain details
      domainStatus.style.display = "block";
      domainStatusText.textContent = `دامنه ${fullDomain} موجود میباشد.`;
      domainDetails.style.display = "block";
      updateTotal();
    }
  });

  // Handle payment period change
  paymentPeriod.addEventListener("change", updateTotal);

  // Update total amount based on payment period
  function updateTotal() {
    const years = parseInt(paymentPeriod.value);
    const total = basePrice * years;
    totalAmount.textContent = formatPrice(total) + " تومان";
  }

  // Format price with commas
  function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Handle payment button click
  paymentBtn.addEventListener("click", () => {
    const domain = domainInput.value.trim() + tldSelect.value;
    const years = parseInt(paymentPeriod.value);
    const total = basePrice * years;

    // Add to cart
    const cart = new Cart();
    cart.addItem(
      domain,
      "DOM-" + Date.now(),
      years,
      total.toString(),
      "domain"
    );

    // Redirect to cart page
    window.location.href = "cart.html";
  });
});

const apiClient = new ApiClient();

// DOM Elements
const domainList = document.getElementById("domainList");
const domainSearch = document.getElementById("domainSearch");
const domainSearchForm = document.getElementById("domainSearchForm");
const domainRegisterForm = document.getElementById("domainRegisterForm");
const domainRenewForm = document.getElementById("domainRenewForm");
const domainTransferForm = document.getElementById("domainTransferForm");
const dnsRecordForm = document.getElementById("dnsRecordForm");
const dnsRecordList = document.getElementById("dnsRecordList");

// State
let currentPage = 1;
let currentDomain = null;

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadDomains();
  setupEventListeners();
});

function setupEventListeners() {
  // Domain Search
  domainSearchForm?.addEventListener("submit", handleDomainSearch);

  // Domain Registration
  domainRegisterForm?.addEventListener("submit", handleDomainRegistration);

  // Domain Renewal
  domainRenewForm?.addEventListener("submit", handleDomainRenewal);

  // Domain Transfer
  domainTransferForm?.addEventListener("submit", handleDomainTransfer);

  // DNS Record Management
  dnsRecordForm?.addEventListener("submit", handleDNSRecordAdd);
}

// Domain List Functions
async function loadDomains(page = 1, status = "") {
  try {
    const response = await apiClient.getDomains({ page, status });
    renderDomainList(response.data);
  } catch (error) {
    showError("Failed to load domains");
    console.error("Error loading domains:", error);
  }
}

function renderDomainList(data) {
  if (!domainList) return;

  const { domains, total, currentPage, totalPages } = data;

  domainList.innerHTML = domains
    .map(
      (domain) => `
    <div class="domain-item" data-id="${domain.id}">
      <div class="domain-info">
        <h3>${domain.name}</h3>
        <p>Status: <span class="status-${domain.status}">${
        domain.status
      }</span></p>
        <p>Expiry Date: ${new Date(domain.expiryDate).toLocaleDateString()}</p>
      </div>
      <div class="domain-actions">
        <button onclick="viewDomain('${
          domain.id
        }')" class="btn btn-primary">View Details</button>
        <button onclick="renewDomain('${
          domain.id
        }')" class="btn btn-success">Renew</button>
        <button onclick="transferDomain('${
          domain.id
        }')" class="btn btn-warning">Transfer</button>
      </div>
    </div>
  `
    )
    .join("");

  renderPagination(currentPage, totalPages);
}

function renderPagination(currentPage, totalPages) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  let paginationHTML = "";

  if (currentPage > 1) {
    paginationHTML += `<button onclick="loadDomains(${
      currentPage - 1
    })" class="btn btn-secondary">Previous</button>`;
  }

  paginationHTML += `<span>Page ${currentPage} of ${totalPages}</span>`;

  if (currentPage < totalPages) {
    paginationHTML += `<button onclick="loadDomains(${
      currentPage + 1
    })" class="btn btn-secondary">Next</button>`;
  }

  pagination.innerHTML = paginationHTML;
}

// Domain Search Functions
async function handleDomainSearch(event) {
  event.preventDefault();
  const domain = domainSearch.value.trim();

  if (!domain) {
    showError("Please enter a domain name");
    return;
  }

  try {
    const response = await apiClient.checkDomainAvailability(domain);
    showAvailabilityResult(response.data);
  } catch (error) {
    showError("Failed to check domain availability");
    console.error("Error checking domain availability:", error);
  }
}

function showAvailabilityResult(data) {
  const resultDiv = document.getElementById("availabilityResult");
  if (!resultDiv) return;

  resultDiv.innerHTML = `
    <div class="availability-result ${
      data.available ? "available" : "unavailable"
    }">
      <h3>${data.domain}</h3>
      <p>${
        data.available
          ? "This domain is available!"
          : "This domain is not available."
      }</p>
      ${
        data.available
          ? `<button onclick="showRegistrationForm('${data.domain}')" class="btn btn-primary">Register Now</button>`
          : ""
      }
    </div>
  `;
}

// Domain Registration Functions
async function handleDomainRegistration(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const data = {
    domain: formData.get("domain"),
    period: parseInt(formData.get("period")),
    registrant: {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      country: formData.get("country"),
      postalCode: formData.get("postalCode"),
    },
  };

  try {
    const response = await apiClient.registerDomain(data);
    showSuccess("Domain registered successfully");
    loadDomains();
  } catch (error) {
    showError("Failed to register domain");
    console.error("Error registering domain:", error);
  }
}

// Domain Renewal Functions
async function handleDomainRenewal(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const period = parseInt(formData.get("period"));

  try {
    const response = await apiClient.renewDomain(currentDomain, period);
    showSuccess("Domain renewed successfully");
    loadDomains();
  } catch (error) {
    showError("Failed to renew domain");
    console.error("Error renewing domain:", error);
  }
}

// Domain Transfer Functions
async function handleDomainTransfer(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const data = {
    transferCode: formData.get("transferCode"),
    newRegistrar: formData.get("newRegistrar"),
  };

  try {
    const response = await apiClient.transferDomain(
      currentDomain,
      data.transferCode,
      data.newRegistrar
    );
    showSuccess("Domain transfer initiated");
    loadDomains();
  } catch (error) {
    showError("Failed to initiate domain transfer");
    console.error("Error transferring domain:", error);
  }
}

// DNS Record Functions
async function loadDNSRecords(domainId) {
  try {
    const response = await apiClient.getDNSRecords(domainId);
    renderDNSRecords(response.data);
  } catch (error) {
    showError("Failed to load DNS records");
    console.error("Error loading DNS records:", error);
  }
}

function renderDNSRecords(records) {
  if (!dnsRecordList) return;

  dnsRecordList.innerHTML = records
    .map(
      (record) => `
    <div class="dns-record" data-id="${record.id}">
      <div class="record-info">
        <p>Type: ${record.type}</p>
        <p>Name: ${record.name}</p>
        <p>Value: ${record.value}</p>
        <p>TTL: ${record.ttl}</p>
        ${record.priority ? `<p>Priority: ${record.priority}</p>` : ""}
      </div>
      <div class="record-actions">
        <button onclick="deleteDNSRecord('${
          record.id
        }')" class="btn btn-danger">Delete</button>
      </div>
    </div>
  `
    )
    .join("");
}

async function handleDNSRecordAdd(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const record = {
    type: formData.get("type"),
    name: formData.get("name"),
    value: formData.get("value"),
    ttl: parseInt(formData.get("ttl")),
    priority: formData.get("priority")
      ? parseInt(formData.get("priority"))
      : undefined,
  };

  try {
    const response = await apiClient.addDNSRecord(currentDomain, record);
    showSuccess("DNS record added successfully");
    loadDNSRecords(currentDomain);
  } catch (error) {
    showError("Failed to add DNS record");
    console.error("Error adding DNS record:", error);
  }
}

async function deleteDNSRecord(recordId) {
  if (!confirm("Are you sure you want to delete this DNS record?")) return;

  try {
    await apiClient.deleteDNSRecord(currentDomain, recordId);
    showSuccess("DNS record deleted successfully");
    loadDNSRecords(currentDomain);
  } catch (error) {
    showError("Failed to delete DNS record");
    console.error("Error deleting DNS record:", error);
  }
}

// Utility Functions
function showSuccess(message) {
  // Implement your success notification
  alert(message);
}

function showError(message) {
  // Implement your error notification
  alert(message);
}

function showRegistrationForm(domain) {
  const registrationForm = document.getElementById("domainRegistrationForm");
  if (!registrationForm) return;

  registrationForm.querySelector('input[name="domain"]').value = domain;
  registrationForm.style.display = "block";
}

// View Functions
function viewDomain(id) {
  currentDomain = id;
  loadDNSRecords(id);
  // Show domain details view
}

function renewDomain(id) {
  currentDomain = id;
  // Show renewal form
}

function transferDomain(id) {
  currentDomain = id;
  // Show transfer form
}

class DomainSystem {
  constructor() {
    this.form = document.getElementById("domainForm");
    this.searchInput = document.getElementById("domainSearch");
    this.searchButton = document.getElementById("searchButton");
    this.resultsContainer = document.getElementById("searchResults");
    this.domainsList = document.getElementById("domainsList");
    this.pagination = document.getElementById("pagination");
    this.currentPage = 1;
    this.limit = 10;

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadDomains();
  }

  setupEventListeners() {
    if (this.searchButton) {
      this.searchButton.addEventListener("click", () => this.handleSearch());
    }

    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    if (this.pagination) {
      this.pagination.addEventListener("click", (e) =>
        this.handlePagination(e)
      );
    }
  }

  async handleSearch() {
    try {
      const domain = this.searchInput.value.trim();
      if (!domain) {
        showNotification("لطفا نام دامنه را وارد کنید", "error");
        return;
      }

      showLoading();
      const response = await apiService.checkDomainAvailability(domain);
      hideLoading();

      if (response.status === "success") {
        this.renderSearchResults(response.data);
      } else {
        showNotification("خطا در بررسی دامنه", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در بررسی دامنه", "error");
    }
  }

  renderSearchResults(data) {
    if (!this.resultsContainer) return;

    const { name, isAvailable, price } = data;
    const formattedPrice = new Intl.NumberFormat("fa-IR").format(price);

    this.resultsContainer.innerHTML = `
      <div class="search-result ${isAvailable ? "available" : "unavailable"}">
        <h3>${name}</h3>
        <p>وضعیت: ${isAvailable ? "قابل ثبت" : "قابل ثبت نیست"}</p>
        ${isAvailable ? `<p>قیمت: ${formattedPrice} ریال</p>` : ""}
        ${
          isAvailable
            ? `<button class="btn btn-primary" onclick="domainSystem.registerDomain('${name}')">ثبت دامنه</button>`
            : ""
        }
      </div>
    `;
  }

  async registerDomain(name) {
    try {
      showLoading();
      const response = await apiService.registerDomain(name, 1); // Default to 1 year
      hideLoading();

      if (response.status === "success") {
        showNotification("دامنه با موفقیت ثبت شد", "success");
        await this.loadDomains();
      } else {
        showNotification("خطا در ثبت دامنه", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در ثبت دامنه", "error");
    }
  }

  async loadDomains() {
    try {
      showLoading();
      const response = await apiService.getDomains(
        this.currentPage,
        this.limit
      );
      hideLoading();

      if (response.status === "success") {
        this.renderDomains(response.data.domains);
        this.renderPagination(response.data.pagination);
      } else {
        showNotification("خطا در دریافت لیست دامنه‌ها", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در دریافت لیست دامنه‌ها", "error");
    }
  }

  renderDomains(domains) {
    if (!this.domainsList) return;

    if (domains.length === 0) {
      this.domainsList.innerHTML = `
        <div class="empty-state">
          <p>شما هنوز دامنه‌ای ثبت نکرده‌اید</p>
        </div>
      `;
      return;
    }

    this.domainsList.innerHTML = domains
      .map(
        (domain) => `
      <div class="domain-item">
        <div class="domain-info">
          <h3>${domain.name}</h3>
          <p>وضعیت: ${this.getStatusText(domain.status)}</p>
          <p>تاریخ انقضا: ${new Date(domain.expiryDate).toLocaleDateString(
            "fa-IR"
          )}</p>
        </div>
        <div class="domain-actions">
          <button class="btn btn-secondary" onclick="domainSystem.showDNSRecords('${
            domain.id
          }')">مدیریت DNS</button>
          <button class="btn btn-danger" onclick="domainSystem.transferDomain('${
            domain.id
          }')">انتقال دامنه</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  getStatusText(status) {
    const statusMap = {
      pending: "در انتظار تایید",
      active: "فعال",
      expired: "منقضی شده",
      transfer_pending: "در انتظار انتقال",
      transferring: "در حال انتقال",
    };
    return statusMap[status] || status;
  }

  renderPagination(pagination) {
    if (!this.pagination) return;

    const { page, pages } = pagination;
    let html = "";

    if (pages > 1) {
      html += `
        <button class="btn btn-secondary" ${page === 1 ? "disabled" : ""} 
          onclick="domainSystem.changePage(${page - 1})">قبلی</button>
        <span>صفحه ${page} از ${pages}</span>
        <button class="btn btn-secondary" ${page === pages ? "disabled" : ""} 
          onclick="domainSystem.changePage(${page + 1})">بعدی</button>
      `;
    }

    this.pagination.innerHTML = html;
  }

  async changePage(page) {
    this.currentPage = page;
    await this.loadDomains();
  }

  async showDNSRecords(domainId) {
    try {
      showLoading();
      const response = await apiService.getDNSRecords(domainId);
      hideLoading();

      if (response.status === "success") {
        this.renderDNSRecords(domainId, response.data.records);
      } else {
        showNotification("خطا در دریافت رکوردهای DNS", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در دریافت رکوردهای DNS", "error");
    }
  }

  renderDNSRecords(domainId, records) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>مدیریت رکوردهای DNS</h2>
          <button class="close-button" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="dnsForm" onsubmit="event.preventDefault(); domainSystem.addDNSRecord('${domainId}')">
            <div class="form-group">
              <label for="recordType">نوع رکورد</label>
              <select id="recordType" required>
                <option value="A">A</option>
                <option value="AAAA">AAAA</option>
                <option value="CNAME">CNAME</option>
                <option value="MX">MX</option>
                <option value="TXT">TXT</option>
              </select>
            </div>
            <div class="form-group">
              <label for="recordName">نام</label>
              <input type="text" id="recordName" required>
            </div>
            <div class="form-group">
              <label for="recordValue">مقدار</label>
              <input type="text" id="recordValue" required>
            </div>
            <div class="form-group">
              <label for="recordTTL">TTL</label>
              <input type="number" id="recordTTL" value="3600" min="60" required>
            </div>
            <button type="submit" class="btn btn-primary">افزودن رکورد</button>
          </form>
          <div class="records-list">
            ${this.renderRecordsList(records)}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  renderRecordsList(records) {
    if (records.length === 0) {
      return `<p class="empty-state">هیچ رکوردی یافت نشد</p>`;
    }

    return `
      <table>
        <thead>
          <tr>
            <th>نوع</th>
            <th>نام</th>
            <th>مقدار</th>
            <th>TTL</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${records
            .map(
              (record) => `
            <tr>
              <td>${record.type}</td>
              <td>${record.name}</td>
              <td>${record.value}</td>
              <td>${record.ttl}</td>
              <td>
                <button class="btn btn-danger" onclick="domainSystem.deleteDNSRecord('${record.id}')">حذف</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  async addDNSRecord(domainId) {
    try {
      const type = document.getElementById("recordType").value;
      const name = document.getElementById("recordName").value;
      const value = document.getElementById("recordValue").value;
      const ttl = parseInt(document.getElementById("recordTTL").value);

      showLoading();
      const response = await apiService.addDNSRecord(domainId, {
        type,
        name,
        value,
        ttl,
      });
      hideLoading();

      if (response.status === "success") {
        showNotification("رکورد DNS با موفقیت اضافه شد", "success");
        await this.showDNSRecords(domainId);
      } else {
        showNotification("خطا در افزودن رکورد DNS", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در افزودن رکورد DNS", "error");
    }
  }

  async deleteDNSRecord(recordId) {
    if (!confirm("آیا از حذف این رکورد اطمینان دارید؟")) return;

    try {
      showLoading();
      const response = await apiService.deleteDNSRecord(recordId);
      hideLoading();

      if (response.status === "success") {
        showNotification("رکورد DNS با موفقیت حذف شد", "success");
        await this.showDNSRecords(domainId);
      } else {
        showNotification("خطا در حذف رکورد DNS", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در حذف رکورد DNS", "error");
    }
  }

  async transferDomain(domainId) {
    const authCode = prompt("لطفا کد انتقال دامنه را وارد کنید:");
    if (!authCode) return;

    try {
      showLoading();
      const response = await apiService.transferDomain(domainId, authCode);
      hideLoading();

      if (response.status === "success") {
        showNotification("درخواست انتقال دامنه با موفقیت ثبت شد", "success");
        await this.loadDomains();
      } else {
        showNotification("خطا در ثبت درخواست انتقال دامنه", "error");
      }
    } catch (error) {
      hideLoading();
      showNotification("خطا در ثبت درخواست انتقال دامنه", "error");
    }
  }
}

// Initialize domain system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.domainSystem = new DomainSystem();
});

// Domain management functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeDomainSearch();
  initializeDomainManagement();
});

// Initialize domain search
function initializeDomainSearch() {
  const searchForm = document.getElementById("domainSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", handleDomainSearch);
  }
}

// Handle domain search
async function handleDomainSearch(event) {
  event.preventDefault();

  const domainInput = document.getElementById("domainName");
  const domain = domainInput.value.trim();

  if (!domain) {
    showToast("Please enter a domain name", "error");
    return;
  }

  try {
    showLoading();
    const response = await fetch(`/api/domains/check/${domain}`);
    const data = await response.json();

    if (response.ok) {
      renderDomainResults(data);
    } else {
      throw new Error(data.message || "Failed to check domain availability");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render domain search results
function renderDomainResults(data) {
  const resultsContainer = document.getElementById("domainResults");
  if (!resultsContainer) return;

  if (data.available) {
    resultsContainer.innerHTML = `
            <div class="domain-result available">
                <h3>${data.domain} is available!</h3>
                <p class="price">$${data.price}/year</p>
                <button onclick="registerDomain('${data.domain}')" class="btn btn-primary">Register Now</button>
            </div>
        `;
  } else {
    resultsContainer.innerHTML = `
            <div class="domain-result unavailable">
                <h3>${data.domain} is not available</h3>
                <p>Try searching for a different domain name</p>
            </div>
        `;
  }
}

// Register domain
async function registerDomain(domain) {
  try {
    showLoading();
    const response = await fetch("/api/domains/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Domain registered successfully!", "success");
      loadUserDomains();
    } else {
      throw new Error(data.message || "Failed to register domain");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Initialize domain management
function initializeDomainManagement() {
  const domainsContainer = document.getElementById("userDomains");
  if (domainsContainer) {
    loadUserDomains();
  }
}

// Load user's domains
async function loadUserDomains() {
  try {
    showLoading();
    const response = await fetch("/api/domains");
    const data = await response.json();

    if (response.ok) {
      renderUserDomains(data.domains);
    } else {
      throw new Error(data.message || "Failed to load domains");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render user's domains
function renderUserDomains(domains) {
  const domainsContainer = document.getElementById("userDomains");
  if (!domainsContainer) return;

  if (domains.length === 0) {
    domainsContainer.innerHTML = `
            <div class="empty-domains">
                <i class="fas fa-globe"></i>
                <p>No domains found</p>
                <button onclick="showDomainSearch()" class="btn btn-primary">Register a Domain</button>
            </div>
        `;
    return;
  }

  domainsContainer.innerHTML = domains
    .map(
      (domain) => `
        <div class="domain-card">
            <div class="domain-header">
                <h3>${domain.name}</h3>
                <span class="domain-status ${domain.status.toLowerCase()}">${
        domain.status
      }</span>
            </div>
            <div class="domain-details">
                <p><strong>Registration Date:</strong> ${new Date(
                  domain.registrationDate
                ).toLocaleDateString()}</p>
                <p><strong>Expiry Date:</strong> ${new Date(
                  domain.expiryDate
                ).toLocaleDateString()}</p>
                <p><strong>Auto-renew:</strong> ${
                  domain.autoRenew ? "Enabled" : "Disabled"
                }</p>
            </div>
            <div class="domain-actions">
                <button onclick="manageDNS('${
                  domain._id
                }')" class="btn btn-secondary">Manage DNS</button>
                <button onclick="toggleAutoRenew('${
                  domain._id
                }', ${!domain.autoRenew})" class="btn btn-info">
                    ${domain.autoRenew ? "Disable" : "Enable"} Auto-renew
                </button>
                <button onclick="renewDomain('${
                  domain._id
                }')" class="btn btn-primary">Renew Domain</button>
            </div>
        </div>
    `
    )
    .join("");
}

// Manage DNS settings
async function manageDNS(domainId) {
  try {
    showLoading();
    const response = await fetch(`/api/domains/${domainId}/dns`);
    const data = await response.json();

    if (response.ok) {
      showDNSModal(domainId, data.records);
    } else {
      throw new Error(data.message || "Failed to load DNS records");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Show DNS management modal
function showDNSModal(domainId, records) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>DNS Management</h2>
                <button onclick="this.closest('.modal').remove()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="dns-records">
                    ${records
                      .map(
                        (record) => `
                        <div class="dns-record">
                            <div class="record-header">
                                <span class="record-type">${record.type}</span>
                                <span class="record-name">${record.name}</span>
                            </div>
                            <div class="record-content">
                                <p>${record.content}</p>
                                <div class="record-actions">
                                    <button onclick="editDNSRecord('${domainId}', '${record._id}')" class="btn btn-sm btn-secondary">Edit</button>
                                    <button onclick="deleteDNSRecord('${domainId}', '${record._id}')" class="btn btn-sm btn-danger">Delete</button>
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
                <div class="add-record-form">
                    <h3>Add New Record</h3>
                    <form onsubmit="addDNSRecord(event, '${domainId}')">
                        <div class="form-group">
                            <label for="recordType">Type</label>
                            <select id="recordType" required>
                                <option value="A">A</option>
                                <option value="AAAA">AAAA</option>
                                <option value="CNAME">CNAME</option>
                                <option value="MX">MX</option>
                                <option value="TXT">TXT</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="recordName">Name</label>
                            <input type="text" id="recordName" required>
                        </div>
                        <div class="form-group">
                            <label for="recordContent">Content</label>
                            <input type="text" id="recordContent" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Add Record</button>
                    </form>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
}

// Add DNS record
async function addDNSRecord(event, domainId) {
  event.preventDefault();

  const type = document.getElementById("recordType").value;
  const name = document.getElementById("recordName").value;
  const content = document.getElementById("recordContent").value;

  try {
    showLoading();
    const response = await fetch(`/api/domains/${domainId}/dns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, name, content }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("DNS record added successfully!", "success");
      manageDNS(domainId);
    } else {
      throw new Error(data.message || "Failed to add DNS record");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Edit DNS record
async function editDNSRecord(domainId, recordId) {
  // Implementation for editing DNS records
  // This would typically show a modal with the current record details
  // and allow the user to modify them
}

// Delete DNS record
async function deleteDNSRecord(domainId, recordId) {
  if (!confirm("Are you sure you want to delete this DNS record?")) return;

  try {
    showLoading();
    const response = await fetch(`/api/domains/${domainId}/dns/${recordId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      showToast("DNS record deleted successfully!", "success");
      manageDNS(domainId);
    } else {
      throw new Error(data.message || "Failed to delete DNS record");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Toggle auto-renew
async function toggleAutoRenew(domainId, enable) {
  try {
    showLoading();
    const response = await fetch(`/api/domains/${domainId}/auto-renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ autoRenew: enable }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast(
        `Auto-renew ${enable ? "enabled" : "disabled"} successfully!`,
        "success"
      );
      loadUserDomains();
    } else {
      throw new Error(data.message || "Failed to update auto-renew setting");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Renew domain
async function renewDomain(domainId) {
  try {
    showLoading();
    const response = await fetch(`/api/domains/${domainId}/renew`, {
      method: "POST",
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Domain renewed successfully!", "success");
      loadUserDomains();
    } else {
      throw new Error(data.message || "Failed to renew domain");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Show domain search section
function showDomainSearch() {
  const searchSection = document.getElementById("domainSearch");
  if (searchSection) {
    searchSection.scrollIntoView({ behavior: "smooth" });
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
