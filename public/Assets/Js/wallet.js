document.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated
  if (!utils.isAuthenticated()) {
    utils.redirectTo("/login.html");
    return;
  }

  const currentBalance = document.getElementById("currentBalance");
  const transactionsList = document.getElementById("transactionsList");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const addFundsBtn = document.querySelector(".add-funds-btn");
  const withdrawBtn = document.querySelector(".withdraw-btn");
  const addFundsModal = document.getElementById("addFundsModal");
  const withdrawModal = document.getElementById("withdrawModal");
  const dateRangeModal = document.getElementById("dateRangeModal");
  const addFundsForm = document.getElementById("addFundsForm");
  const withdrawForm = document.getElementById("withdrawForm");
  const dateRangeForm = document.getElementById("dateRangeForm");
  const exportButtons = document.querySelectorAll(".export-btn");
  const presetButtons = document.querySelectorAll(".preset-btn");
  const paymentMethod = document.getElementById("paymentMethod");
  const bankTransferOptions = document.getElementById("bankTransferOptions");

  // Set default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  document.getElementById("startDate").value = thirtyDaysAgo
    .toISOString()
    .split("T")[0];
  document.getElementById("endDate").value = today.toISOString().split("T")[0];

  // Function to set date range based on preset
  function setDateRange(range) {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (range) {
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "all":
        startDate.setFullYear(2000); // Set to a reasonable past date
        break;
      default:
        return;
    }

    document.getElementById("startDate").value = startDate
      .toISOString()
      .split("T")[0];
    document.getElementById("endDate").value = endDate
      .toISOString()
      .split("T")[0];
  }

  // Handle preset button clicks
  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      presetButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");
      // Set date range based on preset
      setDateRange(button.dataset.range);
    });
  });

  // Load wallet data
  async function loadWalletData() {
    try {
      utils.showLoading("errorMessage");
      const [balanceResponse, transactionsResponse] = await Promise.all([
        apiClient.getWalletBalance(),
        apiClient.getTransactions({
          startDate: document.getElementById("startDate").value,
          endDate: document.getElementById("endDate").value,
        }),
      ]);

      if (balanceResponse.success) {
        currentBalance.textContent =
          balanceResponse.data.balance.toLocaleString();
      } else {
        utils.showError(
          "errorMessage",
          balanceResponse.message || "خطا در دریافت موجودی"
        );
      }

      if (transactionsResponse.success) {
        displayTransactions(transactionsResponse.data);
      } else {
        utils.showError(
          "errorMessage",
          transactionsResponse.message || "خطا در دریافت تراکنش‌ها"
        );
      }
    } catch (error) {
      utils.showError("errorMessage", "خطا در دریافت اطلاعات کیف پول");
      console.error("Load wallet data error:", error);
    }
  }

  // Display transactions in the list
  function displayTransactions(transactions) {
    if (!transactionsList) return;

    transactionsList.innerHTML = transactions
      .map(
        (transaction) => `
          <div class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-title">${transaction.description}</div>
              <div class="transaction-date">${new Date(
                transaction.transactionDate
              ).toLocaleDateString("fa-IR")}</div>
            </div>
            <div class="transaction-details">
              <span class="transaction-status ${transaction.status.toLowerCase()}">${
          transaction.status
        }</span>
              <span class="transaction-amount ${transaction.type.toLowerCase()}">${transaction.amount.toLocaleString()} تومان</span>
            </div>
          </div>
        `
      )
      .join("");
  }

  // Handle add funds button click
  addFundsBtn.addEventListener("click", () => {
    addFundsModal.style.display = "flex";
  });

  // Handle withdraw button click
  withdrawBtn.addEventListener("click", () => {
    withdrawModal.style.display = "flex";
  });

  // Handle modal close
  document.querySelectorAll(".close-modal").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      addFundsModal.style.display = "none";
      withdrawModal.style.display = "none";
      dateRangeModal.style.display = "none";
      // Reset preset buttons
      presetButtons.forEach((btn) => btn.classList.remove("active"));
    });
  });

  // Handle modal close when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === addFundsModal) {
      addFundsModal.style.display = "none";
    }
    if (e.target === withdrawModal) {
      withdrawModal.style.display = "none";
    }
    if (e.target === dateRangeModal) {
      dateRangeModal.style.display = "none";
      // Reset preset buttons
      presetButtons.forEach((btn) => btn.classList.remove("active"));
    }
  });

  // Handle payment method change
  paymentMethod.addEventListener("change", () => {
    // Hide all additional options first
    bankTransferOptions.style.display = "none";

    // Show relevant options based on selection
    if (paymentMethod.value === "pm-bank-transfer") {
      bankTransferOptions.style.display = "block";
    }
  });

  // Handle add funds form submission
  addFundsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);
    const paymentMethodId = document.getElementById("paymentMethod").value;

    try {
      utils.showLoading("errorMessage");
      const response = await apiClient.addFunds(amount, paymentMethodId);
      utils.showSuccess(
        "successMessage",
        "درخواست افزایش اعتبار با موفقیت ثبت شد"
      );
      addFundsModal.style.display = "none";
      loadWalletData();
    } catch (error) {
      utils.showError("errorMessage", error.message || "خطا در افزایش اعتبار");
    }
  });

  // Handle withdraw form submission
  withdrawForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("withdrawAmount").value);
    const withdrawalMethodId =
      document.getElementById("withdrawalMethod").value;

    try {
      utils.showLoading("errorMessage");
      const response = await apiClient.requestWithdrawal(
        amount,
        withdrawalMethodId
      );
      utils.showSuccess(
        "successMessage",
        "درخواست برداشت وجه با موفقیت ثبت شد"
      );
      withdrawModal.style.display = "none";
      withdrawForm.reset();
      loadWalletData();
    } catch (error) {
      utils.showError(
        "errorMessage",
        error.message || "خطا در ثبت درخواست برداشت وجه"
      );
    }
  });

  // Handle date range form submission
  dateRangeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(dateRangeForm);
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const format = dateRangeForm.dataset.format;

    try {
      utils.showLoading("errorMessage");
      await apiClient.exportTransactions(format, { startDate, endDate });
      utils.showSuccess(
        "successMessage",
        `خروجی ${format.toUpperCase()} با موفقیت دانلود شد`
      );
      dateRangeModal.style.display = "none";
      // Reset preset buttons
      presetButtons.forEach((btn) => btn.classList.remove("active"));
    } catch (error) {
      utils.showError(
        "errorMessage",
        `خطا در دانلود خروجی ${format.toUpperCase()}`
      );
    }
  });

  // Handle export buttons click
  exportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const format = button.dataset.format;
      dateRangeForm.dataset.format = format;
      dateRangeModal.style.display = "flex";
    });
  });

  // Load wallet data on page load
  loadWalletData();
});

// Wallet functionality
class Wallet {
  constructor() {
    this.balance = 0;
    this.transactions = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.container = document.querySelector(".wallet-container");
    this.balanceElement = document.querySelector(".wallet-balance");
    this.transactionsList = document.querySelector(".transactions-list");
    this.paginationContainer = document.querySelector(".pagination");
  }

  async init() {
    try {
      Utils.showLoading(this.container);
      await this.loadBalance();
      await this.loadTransactions();
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.container);
    }
  }

  async loadBalance() {
    try {
      const response = await apiService.getWalletBalance();
      this.balance = response.balance;
      this.balanceElement.textContent = Utils.formatCurrency(this.balance);
    } catch (error) {
      Utils.handleApiError(error);
    }
  }

  async loadTransactions(page = 1) {
    try {
      Utils.showLoading(this.transactionsList);
      const response = await apiService.getTransactionHistory(
        page,
        this.itemsPerPage
      );
      this.transactions = response.transactions;
      this.totalPages = response.pagination.pages;
      this.currentPage = page;
      this.renderTransactions();
      this.renderPagination();
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.transactionsList);
    }
  }

  renderTransactions() {
    if (!this.transactionsList) return;

    // Clear container
    this.transactionsList.innerHTML = "";

    if (this.transactions.length === 0) {
      this.transactionsList.innerHTML = `
                <div class="empty-transactions">
                    <i class="bx bx-wallet"></i>
                    <p>هیچ تراکنشی یافت نشد</p>
                </div>
            `;
      return;
    }

    // Create table
    const table = document.createElement("table");
    table.className = "table";
    table.innerHTML = `
            <thead>
                <tr>
                    <th>تاریخ</th>
                    <th>نوع تراکنش</th>
                    <th>مبلغ</th>
                    <th>وضعیت</th>
                    <th>توضیحات</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

    // Add transactions
    const tbody = table.querySelector("tbody");
    this.transactions.forEach((transaction) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${Utils.formatDate(transaction.date)}</td>
                <td>${this.getTransactionTypeText(transaction.type)}</td>
                <td class="${
                  transaction.amount >= 0 ? "positive" : "negative"
                }">
                    ${Utils.formatCurrency(transaction.amount)}
                </td>
                <td>
                    <span class="status-badge ${transaction.status}">
                        ${this.getStatusText(transaction.status)}
                    </span>
                </td>
                <td>${transaction.description || "-"}</td>
            `;
      tbody.appendChild(tr);
    });

    this.transactionsList.appendChild(table);
  }

  renderPagination() {
    if (!this.paginationContainer) return;

    // Clear container
    this.paginationContainer.innerHTML = "";

    // Create pagination
    const pagination = Utils.createPagination(
      this.currentPage,
      this.totalPages,
      (page) => this.loadTransactions(page)
    );

    this.paginationContainer.appendChild(pagination);
  }

  getTransactionTypeText(type) {
    const types = {
      deposit: "واریز",
      withdrawal: "برداشت",
      purchase: "خرید",
      refund: "بازپرداخت",
      commission: "کمیسیون",
    };
    return types[type] || type;
  }

  getStatusText(status) {
    const statuses = {
      pending: "در انتظار",
      completed: "تکمیل شده",
      failed: "ناموفق",
      cancelled: "لغو شده",
    };
    return statuses[status] || status;
  }

  // Add funds
  async addFunds(amount, paymentMethod) {
    try {
      Utils.showLoading(this.container);
      const response = await apiService.processPayment(amount, paymentMethod);
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
      } else {
        await this.loadBalance();
        Utils.showNotification("مبلغ با موفقیت به کیف پول اضافه شد", "success");
      }
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.container);
    }
  }

  // Withdraw funds
  async withdrawFunds(amount, paymentMethod, accountDetails) {
    try {
      Utils.showLoading(this.container);
      await apiService.requestWithdrawal(amount, paymentMethod, accountDetails);
      await this.loadBalance();
      Utils.showNotification("درخواست برداشت با موفقیت ثبت شد", "success");
    } catch (error) {
      Utils.handleApiError(error);
    } finally {
      Utils.hideLoading(this.container);
    }
  }
}

// Initialize wallet when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const wallet = new Wallet();
  wallet.init();

  // Add funds form
  const addFundsForm = document.getElementById("addFundsForm");
  if (addFundsForm) {
    Utils.handleFormSubmit(addFundsForm, async (form) => {
      const formData = new FormData(form);
      const amount = parseFloat(formData.get("amount"));
      const paymentMethod = formData.get("paymentMethod");

      if (amount <= 0) {
        throw new Error("مبلغ باید بیشتر از صفر باشد");
      }

      await wallet.addFunds(amount, paymentMethod);
    });
  }

  // Withdraw funds form
  const withdrawFundsForm = document.getElementById("withdrawFundsForm");
  if (withdrawFundsForm) {
    Utils.handleFormSubmit(withdrawFundsForm, async (form) => {
      const formData = new FormData(form);
      const amount = parseFloat(formData.get("amount"));
      const paymentMethod = formData.get("paymentMethod");
      const accountDetails = {
        accountNumber: formData.get("accountNumber"),
        bankName: formData.get("bankName"),
        accountHolder: formData.get("accountHolder"),
      };

      if (amount <= 0) {
        throw new Error("مبلغ باید بیشتر از صفر باشد");
      }

      if (amount > wallet.balance) {
        throw new Error("مبلغ درخواستی بیشتر از موجودی کیف پول است");
      }

      await wallet.withdrawFunds(amount, paymentMethod, accountDetails);
    });
  }
});

// Wallet and payment management functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeWallet();
  loadTransactions();
  loadPaymentMethods();
});

// Initialize wallet
function initializeWallet() {
  const addFundsForm = document.getElementById("addFundsForm");
  if (addFundsForm) {
    addFundsForm.addEventListener("submit", handleAddFunds);
  }
}

// Handle adding funds
async function handleAddFunds(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const paymentData = {
    amount: parseFloat(formData.get("amount")),
    paymentMethod: formData.get("paymentMethod"),
    currency: formData.get("currency"),
  };

  try {
    showLoading();
    const response = await fetch("/api/wallet/add-funds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        showToast("Payment initiated successfully!", "success");
        loadTransactions();
      }
    } else {
      throw new Error(data.message || "Failed to process payment");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Load wallet balance and details
async function loadWalletDetails() {
  try {
    showLoading();
    const response = await fetch("/api/wallet");
    const data = await response.json();

    if (response.ok) {
      renderWalletDetails(data.wallet);
    } else {
      throw new Error(data.message || "Failed to load wallet details");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render wallet details
function renderWalletDetails(wallet) {
  const balanceElement = document.getElementById("walletBalance");
  if (balanceElement) {
    balanceElement.textContent = formatCurrency(
      wallet.balance,
      wallet.currency
    );
  }

  const currencyElement = document.getElementById("walletCurrency");
  if (currencyElement) {
    currencyElement.textContent = wallet.currency;
  }
}

// Load transactions
async function loadTransactions() {
  try {
    showLoading();
    const response = await fetch("/api/wallet/transactions");
    const data = await response.json();

    if (response.ok) {
      renderTransactions(data.transactions);
    } else {
      throw new Error(data.message || "Failed to load transactions");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render transactions
function renderTransactions(transactions) {
  const transactionsContainer = document.getElementById("transactionsList");
  if (!transactionsContainer) return;

  if (transactions.length === 0) {
    transactionsContainer.innerHTML = `
            <div class="empty-transactions">
                <i class="fas fa-receipt"></i>
                <p>No transactions found</p>
            </div>
        `;
    return;
  }

  transactionsContainer.innerHTML = transactions
    .map(
      (transaction) => `
        <div class="transaction-card ${transaction.type.toLowerCase()}">
            <div class="transaction-header">
                <h3>${transaction.description}</h3>
                <span class="transaction-amount ${
                  transaction.amount >= 0 ? "positive" : "negative"
                }">
                    ${formatCurrency(transaction.amount, transaction.currency)}
                </span>
            </div>
            <div class="transaction-body">
                <div class="transaction-meta">
                    <span><i class="fas fa-clock"></i> ${new Date(
                      transaction.date
                    ).toLocaleString()}</span>
                    <span><i class="fas fa-tag"></i> ${transaction.type}</span>
                    <span><i class="fas fa-hashtag"></i> ${
                      transaction.reference
                    }</span>
                </div>
                <div class="transaction-status ${transaction.status.toLowerCase()}">
                    ${transaction.status}
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Load payment methods
async function loadPaymentMethods() {
  try {
    showLoading();
    const response = await fetch("/api/wallet/payment-methods");
    const data = await response.json();

    if (response.ok) {
      renderPaymentMethods(data.methods);
    } else {
      throw new Error(data.message || "Failed to load payment methods");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Render payment methods
function renderPaymentMethods(methods) {
  const methodsContainer = document.getElementById("paymentMethods");
  if (!methodsContainer) return;

  methodsContainer.innerHTML = methods
    .map(
      (method) => `
        <div class="payment-method-card">
            <div class="method-header">
                <img src="${method.icon}" alt="${
        method.name
      }" class="method-icon">
                <h3>${method.name}</h3>
            </div>
            <div class="method-body">
                <p>${method.description}</p>
                <div class="method-actions">
                    <button onclick="setDefaultMethod('${
                      method.id
                    }')" class="btn btn-secondary">
                        ${method.isDefault ? "Default" : "Set as Default"}
                    </button>
                    <button onclick="removeMethod('${
                      method.id
                    }')" class="btn btn-danger">
                        Remove
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Set default payment method
async function setDefaultMethod(methodId) {
  try {
    showLoading();
    const response = await fetch(
      `/api/wallet/payment-methods/${methodId}/default`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (response.ok) {
      showToast("Default payment method updated successfully!", "success");
      loadPaymentMethods();
    } else {
      throw new Error(
        data.message || "Failed to update default payment method"
      );
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Remove payment method
async function removeMethod(methodId) {
  if (!confirm("Are you sure you want to remove this payment method?")) return;

  try {
    showLoading();
    const response = await fetch(`/api/wallet/payment-methods/${methodId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Payment method removed successfully!", "success");
      loadPaymentMethods();
    } else {
      throw new Error(data.message || "Failed to remove payment method");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Add new payment method
async function addPaymentMethod() {
  try {
    showLoading();
    const response = await fetch("/api/wallet/payment-methods/add");
    const data = await response.json();

    if (response.ok) {
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        showToast("Payment method added successfully!", "success");
        loadPaymentMethods();
      }
    } else {
      throw new Error(data.message || "Failed to add payment method");
    }
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Utility functions
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

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
