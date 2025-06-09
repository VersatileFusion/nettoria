// API endpoints
const API_BASE_URL = "/api";
const PAYMENT_ENDPOINTS = {
  PROCESS: `${API_BASE_URL}/payments/process`,
  VERIFY: `${API_BASE_URL}/payments/verify`,
  WALLET: `${API_BASE_URL}/payments/wallet`,
};

// DOM Elements
const paymentForm = document.getElementById("payment-form");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const taxAmount = document.getElementById("tax-amount");
const totalAmount = document.getElementById("total-amount");
const paymentMethods = document.querySelectorAll(".payment-method");
const orderSummary = document.getElementById("order-summary");
const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");

// Get order details from URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("orderId");

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency: "IRR",
  }).format(amount);
}

// Format card number
function formatCardNumber(input) {
  let value = input.value.replace(/\D/g, "");
  let formattedValue = "";
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += " ";
    }
    formattedValue += value[i];
  }
  input.value = formattedValue;
}

// Format expiry date
function formatExpiryDate(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2);
  }
  input.value = value;
}

// Validate card number
function validateCardNumber(number) {
  return /^\d{16}$/.test(number.replace(/\s/g, ""));
}

// Validate expiry date
function validateExpiryDate(date) {
  if (!/^\d{2}\/\d{2}$/.test(date)) return false;
  const [month, year] = date.split("/");
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (parseInt(month) < 1 || parseInt(month) > 12) return false;
  if (parseInt(year) < currentYear) return false;
  if (parseInt(year) === currentYear && parseInt(month) < currentMonth)
    return false;

  return true;
}

// Validate CVV
function validateCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}

// Validate card holder name
function validateCardHolder(name) {
  return name.trim().length >= 3;
}

// Fetch order details
async function fetchOrderDetails() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    const data = await response.json();

    if (data.success) {
      displayOrderDetails(data.data);
    } else {
      console.error("Failed to fetch order details:", data.error);
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
  }
}

// Display order details
function displayOrderDetails(order) {
  productName.textContent = order.productName;
  productPrice.textContent = formatCurrency(order.price);
  taxAmount.textContent = formatCurrency(order.tax);
  totalAmount.textContent = formatCurrency(order.total);
}

// Handle payment method selection
paymentMethods.forEach((method) => {
  method.addEventListener("click", () => {
    const paymentType = method.dataset.method;
    const cardForm = document.querySelector(".payment-form");

    if (paymentType === "wallet") {
      cardForm.style.display = "none";
    } else {
      cardForm.style.display = "block";
    }
  });
});

// Handle form submission
paymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedMethod = document.querySelector(
    'input[name="payment-method"]:checked'
  );
  if (!selectedMethod) {
    alert("لطفا روش پرداخت را انتخاب کنید");
    return;
  }

  if (selectedMethod.value === "wallet") {
    await processWalletPayment();
  } else {
    await processCardPayment();
  }
});

// Process card payment
async function processCardPayment() {
  const cardNumber = document.getElementById("card-number").value;
  const expiry = document.getElementById("expiry").value;
  const cvv = document.getElementById("cvv").value;
  const cardHolder = document.getElementById("card-holder").value;

  // Validate inputs
  if (!validateCardNumber(cardNumber)) {
    alert("شماره کارت نامعتبر است");
    return;
  }
  if (!validateExpiryDate(expiry)) {
    alert("تاریخ انقضا نامعتبر است");
    return;
  }
  if (!validateCVV(cvv)) {
    alert("CVV نامعتبر است");
    return;
  }
  if (!validateCardHolder(cardHolder)) {
    alert("نام صاحب کارت نامعتبر است");
    return;
  }

  try {
    const response = await fetch(PAYMENT_ENDPOINTS.PROCESS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        paymentMethod: "card",
        cardDetails: {
          number: cardNumber.replace(/\s/g, ""),
          expiry,
          cvv,
          holder: cardHolder,
        },
      }),
    });

    const data = await response.json();
    if (data.success) {
      window.location.href = data.redirectUrl;
    } else {
      alert(data.error || "خطا در پرداخت");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("خطا در پرداخت. لطفا دوباره تلاش کنید");
  }
}

// Process wallet payment
async function processWalletPayment() {
  try {
    const response = await fetch(PAYMENT_ENDPOINTS.WALLET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
      }),
    });

    const data = await response.json();
    if (data.success) {
      window.location.href = data.redirectUrl;
    } else {
      alert(data.error || "خطا در پرداخت");
    }
  } catch (error) {
    console.error("Error processing wallet payment:", error);
    alert("خطا در پرداخت. لطفا دوباره تلاش کنید");
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (!orderId) {
    window.location.href = "./cart.html";
    return;
  }

  fetchOrderDetails();

  // Add input formatting
  const cardNumberInput = document.getElementById("card-number");
  const expiryInput = document.getElementById("expiry");

  cardNumberInput.addEventListener("input", () =>
    formatCardNumber(cardNumberInput)
  );
  expiryInput.addEventListener("input", () => formatExpiryDate(expiryInput));
});

class PaymentSystem {
  constructor() {
    this.methods = [];
    this.form = document.querySelector("#payment-form");
    this.methodSelect = document.querySelector("#payment-method");
    this.methodDetails = document.querySelector("#method-details");
    this.init();
  }

  async init() {
    try {
      showLoading();
      await this.loadPaymentMethods();
      this.setupEventListeners();
      hideLoading();
    } catch (error) {
      hideLoading();
      showError("خطا در بارگذاری روش‌های پرداخت");
      console.error("Error initializing payment system:", error);
    }
  }

  async loadPaymentMethods() {
    try {
      const response = await apiService.getPaymentMethods();
      this.methods = response.data;
      this.renderPaymentMethods();
    } catch (error) {
      console.error("Error loading payment methods:", error);
      throw error;
    }
  }

  renderPaymentMethods() {
    // Render payment methods in the grid
    const methodsGrid = document.querySelector(".methods-grid");
    if (methodsGrid) {
      methodsGrid.innerHTML = this.methods
        .map(
          (method) => `
                <div class="payment-method-card" data-method-id="${method.id}">
                    <img src="${method.icon}" alt="${method.name}">
                    <h4>${method.name}</h4>
                    <p>${method.description}</p>
                </div>
            `
        )
        .join("");
    }

    // Update payment method select options
    if (this.methodSelect) {
      this.methodSelect.innerHTML = `
                <option value="">انتخاب کنید</option>
                ${this.methods
                  .map(
                    (method) => `
                    <option value="${method.id}">${method.name}</option>
                `
                  )
                  .join("")}
            `;
    }
  }

  setupEventListeners() {
    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit.bind(this));
    }

    if (this.methodSelect) {
      this.methodSelect.addEventListener(
        "change",
        this.handleMethodChange.bind(this)
      );
    }

    // Add click event listeners to payment method cards
    const methodCards = document.querySelectorAll(".payment-method-card");
    methodCards.forEach((card) => {
      card.addEventListener("click", () => {
        const methodId = card.dataset.methodId;
        this.methodSelect.value = methodId;
        this.handleMethodChange({ target: this.methodSelect });
      });
    });
  }

  handleMethodChange(event) {
    const methodId = event.target.value;
    const selectedMethod = this.methods.find((m) => m.id === methodId);

    if (selectedMethod) {
      this.methodDetails.innerHTML = this.getMethodDetailsHTML(selectedMethod);
    } else {
      this.methodDetails.innerHTML = "";
    }
  }

  getMethodDetailsHTML(method) {
    switch (method.type) {
      case "bank":
        return `
                    <div class="form-group">
                        <label for="card-number">شماره کارت</label>
                        <input type="text" id="card-number" name="cardNumber" required 
                               pattern="[0-9]{16}" maxlength="16">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="expiry">تاریخ انقضا</label>
                            <input type="text" id="expiry" name="expiry" required 
                                   pattern="[0-9]{2}/[0-9]{2}" placeholder="MM/YY">
                        </div>
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" name="cvv" required 
                                   pattern="[0-9]{3,4}" maxlength="4">
                        </div>
                    </div>
                `;
      case "wallet":
        return `
                    <div class="form-group">
                        <label for="wallet-number">شماره کیف پول</label>
                        <input type="text" id="wallet-number" name="walletNumber" required>
                    </div>
                `;
      default:
        return "";
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const amount = this.form.querySelector("#amount").value;
    const methodId = this.methodSelect.value;
    const selectedMethod = this.methods.find((m) => m.id === methodId);

    if (!selectedMethod) {
      showError("لطفا روش پرداخت را انتخاب کنید");
      return;
    }

    const details = this.getPaymentDetails(selectedMethod.type);
    if (!details) {
      return;
    }

    try {
      showLoading();
      const response = await apiService.processPayment(
        amount,
        methodId,
        details
      );
      hideLoading();

      if (response.success) {
        showSuccess("پرداخت با موفقیت انجام شد");
        this.form.reset();
        this.methodDetails.innerHTML = "";

        // Redirect to success page or show success modal
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }
      } else {
        showError(response.message || "خطا در پرداخت");
      }
    } catch (error) {
      hideLoading();
      showError("خطا در پرداخت");
      console.error("Error processing payment:", error);
    }
  }

  getPaymentDetails(methodType) {
    switch (methodType) {
      case "bank":
        return {
          cardNumber: this.form.querySelector("#card-number").value,
          expiry: this.form.querySelector("#expiry").value,
          cvv: this.form.querySelector("#cvv").value,
        };
      case "wallet":
        return {
          walletNumber: this.form.querySelector("#wallet-number").value,
        };
      default:
        return null;
    }
  }
}

// Initialize payment system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.paymentSystem = new PaymentSystem();
});

// Payment processing functionality
document.addEventListener("DOMContentLoaded", () => {
  const paymentForm = document.getElementById("payment-form");
  const paymentMethods = document.querySelectorAll(".payment-method");
  const orderSummary = document.getElementById("order-summary");
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");

  let selectedPaymentMethod = null;
  let orderDetails = null;

  // Initialize payment page
  async function initializePayment() {
    try {
      // Get order ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get("orderId");

      if (!orderId) {
        throw new Error("شناسه سفارش یافت نشد");
      }

      // Fetch order details
      const response = await apiClient.get(`/orders/${orderId}`);
      if (!response.success) {
        throw new Error(response.message || "خطا در دریافت اطلاعات سفارش");
      }

      orderDetails = response.data;
      displayOrderSummary(orderDetails);

      // Set up payment method selection
      paymentMethods.forEach((method) => {
        method.addEventListener("click", () => {
          paymentMethods.forEach((m) => m.classList.remove("selected"));
          method.classList.add("selected");
          selectedPaymentMethod = method.dataset.method;
        });
      });

      // Set up form submission
      paymentForm.addEventListener("submit", handlePayment);
    } catch (error) {
      utils.showError("error-message", error.message);
      console.error("Payment initialization error:", error);
    }
  }

  // Display order summary
  function displayOrderSummary(order) {
    if (!orderSummary) return;

    orderSummary.innerHTML = `
      <div class="summary-header">
        <h3>خلاصه سفارش</h3>
        <span class="order-id">شماره سفارش: ${order.id}</span>
      </div>
      <div class="summary-items">
        ${order.items
          .map(
            (item) => `
          <div class="summary-item">
            <div class="item-name">${item.name}</div>
            <div class="item-quantity">${item.quantity} عدد</div>
            <div class="item-price">${utils.formatCurrency(
              item.price * item.quantity
            )}</div>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="summary-total">
        <span>جمع کل:</span>
        <span>${utils.formatCurrency(order.total)}</span>
      </div>
    `;
  }

  // Handle payment submission
  async function handlePayment(e) {
    e.preventDefault();

    if (!selectedPaymentMethod) {
      utils.showError("error-message", "لطفا روش پرداخت را انتخاب کنید");
      return;
    }

    try {
      utils.showLoading("error-message");

      // Create payment request
      const response = await apiClient.post("/payments/create", {
        orderId: orderDetails.id,
        method: selectedPaymentMethod,
      });

      if (!response.success) {
        throw new Error(response.message || "خطا در ایجاد درخواست پرداخت");
      }

      // Handle different payment methods
      switch (selectedPaymentMethod) {
        case "online":
          // Redirect to payment gateway
          window.location.href = response.data.paymentUrl;
          break;

        case "wallet":
          // Process wallet payment
          const walletResponse = await apiClient.post(
            "/payments/process-wallet",
            {
              orderId: orderDetails.id,
            }
          );

          if (walletResponse.success) {
            utils.showSuccess("success-message", "پرداخت با موفقیت انجام شد");
            setTimeout(() => {
              window.location.href = `/order-success.html?orderId=${orderDetails.id}`;
            }, 2000);
          } else {
            throw new Error(
              walletResponse.message || "خطا در پرداخت از کیف پول"
            );
          }
          break;

        case "bank":
          // Show bank details
          displayBankDetails(response.data.bankDetails);
          break;

        default:
          throw new Error("روش پرداخت نامعتبر است");
      }
    } catch (error) {
      utils.showError("error-message", error.message);
      console.error("Payment error:", error);
    }
  }

  // Display bank transfer details
  function displayBankDetails(bankDetails) {
    const bankInfo = document.getElementById("bank-info");
    if (!bankInfo) return;

    bankInfo.innerHTML = `
      <div class="bank-details">
        <h4>اطلاعات پرداخت بانکی</h4>
        <p>بانک: ${bankDetails.bankName}</p>
        <p>شماره حساب: ${bankDetails.accountNumber}</p>
        <p>شماره شبا: ${bankDetails.sheba}</p>
        <p>به نام: ${bankDetails.accountHolder}</p>
        <p>مبلغ قابل پرداخت: ${utils.formatCurrency(orderDetails.total)}</p>
        <p class="note">لطفا پس از پرداخت، شماره پیگیری تراکنش را در فرم زیر وارد کنید</p>
      </div>
      <form id="bank-receipt-form" class="bank-receipt-form">
        <div class="form-group">
          <label for="receipt-number">شماره پیگیری تراکنش</label>
          <input type="text" id="receipt-number" name="receiptNumber" required>
        </div>
        <button type="submit" class="btn btn-primary">ثبت رسید پرداخت</button>
      </form>
    `;

    // Handle bank receipt submission
    const receiptForm = document.getElementById("bank-receipt-form");
    if (receiptForm) {
      receiptForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const receiptNumber = document.getElementById("receipt-number").value;

        try {
          const response = await apiClient.post("/payments/submit-receipt", {
            orderId: orderDetails.id,
            receiptNumber,
          });

          if (response.success) {
            utils.showSuccess(
              "success-message",
              "رسید پرداخت با موفقیت ثبت شد"
            );
            setTimeout(() => {
              window.location.href = `/order-success.html?orderId=${orderDetails.id}`;
            }, 2000);
          } else {
            throw new Error(response.message || "خطا در ثبت رسید پرداخت");
          }
        } catch (error) {
          utils.showError("error-message", error.message);
          console.error("Receipt submission error:", error);
        }
      });
    }
  }

  // Initialize payment page
  initializePayment();
});
