// Global variables
let osSelect;
let selectedService = null;
let currentPricing = null;

// Global functions
function calculateExtraPrice() {
  let totalExtra = 0;

  // محاسبه قیمت IP های اضافه
  const ipInput = document.getElementById("ip-count");
  if (ipInput) {
    const ipCount = parseInt(ipInput.value) || 1;
    if (ipCount > 1) {
      const pricePerIp = parseInt(ipInput.dataset.price) || 50000;
      totalExtra += (ipCount - 1) * pricePerIp; // فقط برای IP های اضافی محاسبه می‌شود
    }
  }

  // محاسبه سایر آپشن‌های اضافه
  document
    .querySelectorAll(".price-selector:not(#ip-count)")
    .forEach((select) => {
      const value = parseInt(select.value) || 0;
      totalExtra += value;
    });

  return totalExtra;
}

function updateCartButton(price, originalPrice) {
  const cartBtn = document.querySelector(".cart-btn");
  const priceSection =
    document.querySelector(".price-section") || document.createElement("div");
  priceSection.className = "price-section";

  if (originalPrice && originalPrice > price) {
    priceSection.innerHTML = `
      <div class="price-label">جمع سفارش</div>
      <div class="original-price">${originalPrice.toLocaleString()} تومان</div>
      <div class="final-price">${price.toLocaleString()} تومان</div>
    `;
  } else {
    priceSection.innerHTML = `
      <div class="price-label">جمع سفارش</div>
      <div class="final-price">${price.toLocaleString()} تومان</div>
    `;
  }

  if (cartBtn) {
    cartBtn.innerHTML = `<i class='bx bx-cart-alt'></i>افزودن به سبد خرید`;
    // اگر price-section قبلاً وجود نداشته، آن را بعد از cartBtn اضافه کن
    if (!document.querySelector(".price-section")) {
      cartBtn.parentNode.insertBefore(priceSection, cartBtn);
    }
  }
}

function updateOrderSummary(basePrice) {
  const orderDetails = document.getElementById("order-details");
  if (!orderDetails) return;

  const selectedDuration = document.querySelector(".duration-btn.selected");
  const duration = selectedDuration
    ? parseInt(selectedDuration.dataset.duration)
    : 1;

  let summaryItems = [];

  // محاسبه قیمت نهایی برای نمایش در بخش قیمت
  const extraPrice = calculateExtraPrice();
  const totalPrice = (basePrice + extraPrice) * duration;
  let finalPrice = totalPrice;

  if (duration === 3) finalPrice *= 0.95;
  else if (duration === 6) finalPrice *= 0.9;
  else if (duration === 12) finalPrice *= 0.8;

  // جمع‌آوری اطلاعات سفارش
  const servicePlan = document.querySelector("#service-plan");
  if (servicePlan) {
    summaryItems.push({
      label: "پلن انتخابی",
      value: servicePlan.textContent,
      priority: 1,
    });
  }

  // مدت زمان
  if (selectedDuration) {
    let durationText = `${duration} ماهه`;
    if (duration === 3) durationText += " (5% تخفیف)";
    else if (duration === 6) durationText += " (10% تخفیف)";
    else if (duration === 12) durationText += " (20% تخفیف)";

    summaryItems.push({
      label: "مدت زمان",
      value: durationText,
      priority: 2,
    });
  }

  // آپشن‌های اضافی
  const priceSelectors = document.querySelectorAll(".price-selector");
  priceSelectors.forEach((select) => {
    if (select.id === "ip-count") {
      const ipCount = parseInt(select.value) || 1;
      if (ipCount > 1) {
        const pricePerIp = parseInt(select.dataset.price) || 50000;
        summaryItems.push({
          label: "تعداد آی پی",
          value: `${ipCount} عدد (${(
            (ipCount - 1) *
            pricePerIp
          ).toLocaleString()} تومان)`,
          priority: 4,
        });
      }
    } else if (select.value !== "0") {
      const selectedOption = select.options[select.selectedIndex];
      const label = select.previousElementSibling.textContent
        .replace(":", "")
        .replace("(اختیاری)", "")
        .trim();
      summaryItems.push({
        label: label,
        value: selectedOption.text,
        priority: 4,
      });
    }
  });

  // مرتب‌سازی آیتم‌ها بر اساس اولویت
  summaryItems.sort((a, b) => a.priority - b.priority);

  // جدا کردن سه آیتم اصلی و بقیه
  const mainItems = summaryItems.slice(0, 3);
  const moreItems = summaryItems.slice(3);

  // ساخت HTML
  let summaryHTML = '<div class="summary-title">خلاصه سفارش</div>';
  summaryHTML += '<div class="summary-grid">';

  // نمایش سه آیتم اصلی
  mainItems.forEach((item, index) => {
    summaryHTML += `
      <div class="summary-box">
        <div class="summary-box-title">${item.label}</div>
        <div class="summary-box-value">${item.value}</div>
      </div>
    `;

    // اضافه کردن علامت + بین باکس‌ها
    if (index < mainItems.length - 1) {
      summaryHTML += '<div class="plus-sign">+</div>';
    }
  });

  // اگر آیتم‌های بیشتری وجود دارد
  if (moreItems.length > 0) {
    summaryHTML += '<div class="plus-sign">+</div>';
    summaryHTML += `
      <div class="summary-more">
        <div class="more-trigger">...</div>
        <div class="more-content">
    `;

    moreItems.forEach((item) => {
      summaryHTML += `
        <div class="summary-box">
          <div class="summary-box-title">${item.label}</div>
          <div class="summary-box-value">${item.value}</div>
        </div>
      `;
    });

    summaryHTML += "</div></div>";
  }

  summaryHTML += "</div>";

  orderDetails.innerHTML =
    summaryHTML || "لطفا موارد مورد نظر خود را انتخاب کنید";

  // آپدیت دکمه سبد خرید و قیمت‌ها
  updateCartButton(finalPrice, totalPrice);
}

// API Integration Functions
async function fetchServiceDetails(serviceId) {
  try {
    const response = await fetch(`/api/services/${serviceId}`);
    if (!response.ok) throw new Error('Failed to fetch service details');
    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('Error fetching service details:', error);
    showError('خطا در دریافت اطلاعات سرویس');
    return null;
  }
}

async function fetchOperatingSystems() {
  try {
    const response = await fetch('/api/services/operating-systems');
    if (!response.ok) throw new Error('Failed to fetch operating systems');
    const data = await response.json();
    return data.operatingSystems;
  } catch (error) {
    console.error('Error fetching operating systems:', error);
    return [];
  }
}

async function addToCart(orderData) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showError('لطفا ابتدا وارد حساب کاربری خود شوید');
      window.location.href = '/login.html';
      return false;
    }

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add to cart');
    }

    const data = await response.json();
    showSuccess('سفارش با موفقیت به سبد خرید اضافه شد');
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    showError(`خطا در افزودن به سبد خرید: ${error.message}`);
    return false;
  }
}

// Validation Functions
function validateForm() {
  const errors = [];

  // Validate server name
  const serverName = document.getElementById('service-name').value.trim();
  if (!serverName) {
    errors.push('نام سرور الزامی است');
  } else if (serverName.length < 3) {
    errors.push('نام سرور باید حداقل 3 کاراکتر باشد');
  } else if (!/^[a-zA-Z0-9\-_]+$/.test(serverName)) {
    errors.push('نام سرور فقط می‌تواند شامل حروف، اعداد، خط تیره و زیرخط باشد');
  }

  // Validate OS selection
  const osSelect = document.getElementById('os-select');
  if (!osSelect.value) {
    errors.push('انتخاب سیستم عامل الزامی است');
  }

  // Validate duration selection
  const selectedDuration = document.querySelector('.duration-btn.selected');
  if (!selectedDuration) {
    errors.push('انتخاب مدت زمان الزامی است');
  }

  return errors;
}

function showValidationErrors(errors) {
  errors.forEach(error => {
    showError(error);
  });
}

function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'toast error';
  toast.innerHTML = `
    <i class='bx bx-x-circle'></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.innerHTML = `
    <i class='bx bx-check-circle'></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Main event listener
document.addEventListener("DOMContentLoaded", function () {
  // Menu functionality
  const menuIcon = document.querySelector("#menu-icon");
  const navbar = document.querySelector(".navbar");

  menuIcon?.addEventListener("click", () => {
    menuIcon.classList.toggle("bx-x");
    navbar.classList.toggle("active");
  });

  // آپدیت قیمت با توجه به مدت زمان و آپشن‌های اضافی
  function updatePrice(basePrice, duration) {
    const extraPrice = calculateExtraPrice();
    const totalPrice = (basePrice + extraPrice) * duration;
    let finalPrice = totalPrice;

    if (duration === 3) finalPrice *= 0.95;
    else if (duration === 6) finalPrice *= 0.9;
    else if (duration === 12) finalPrice *= 0.8;

    updateOrderSummary(basePrice);
    return finalPrice;
  }

  // Initialize service data
  async function initializeService() {
    try {
      // Get service ID from URL or session storage
      const urlParams = new URLSearchParams(window.location.search);
      const serviceId = urlParams.get('id') || sessionStorage.getItem('selectedServiceId');

      if (!serviceId) {
        showError('شناسه سرویس یافت نشد');
        return;
      }

      // Fetch service details
      const service = await fetchServiceDetails(serviceId);
      if (!service) return;

      selectedService = service;
      sessionStorage.setItem('selectedServiceId', serviceId);

      // Display service plan
      const servicePlanElement = document.getElementById('service-plan');
      if (servicePlanElement) {
        servicePlanElement.textContent = service.name;
      }

      // Display datacenter
      const datacenterElement = document.getElementById('datacenter-display');
      if (datacenterElement) {
        datacenterElement.textContent = service.datacenter || 'ایران';
      }

      // Load operating systems
      const operatingSystems = await fetchOperatingSystems();
      const osSelect = document.getElementById('os-select');
      if (osSelect && operatingSystems.length > 0) {
        osSelect.innerHTML = '<option value="">انتخاب سیستم عامل</option>';
        operatingSystems.forEach(os => {
          const option = document.createElement('option');
          option.value = os.id;
          option.textContent = os.name;
          osSelect.appendChild(option);
        });
      }

      // Set initial price
      const basePrice = service.price.amount;
      updatePrice(basePrice, 1);

    } catch (error) {
      console.error('Error initializing service:', error);
      showError('خطا در بارگذاری اطلاعات سرویس');
    }
  }

  // Initialize the service
  initializeService();

  // Duration button functionality
  document.querySelectorAll(".duration-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove selected class from all duration buttons
      document.querySelectorAll(".duration-btn").forEach((b) => {
        b.classList.remove("selected");
      });

      // Add selected class to clicked button
      this.classList.add("selected");

      // Update price
      if (selectedService) {
        const duration = parseInt(this.dataset.duration);
        const basePrice = selectedService.price.amount;
        updatePrice(basePrice, duration);
      }
    });
  });

  // Price selector functionality
  document.querySelectorAll(".price-selector").forEach((select) => {
    select.addEventListener("change", function () {
      if (selectedService) {
        const selectedDuration = document.querySelector(".duration-btn.selected");
        const duration = selectedDuration ? parseInt(selectedDuration.dataset.duration) : 1;
        const basePrice = selectedService.price.amount;
        updatePrice(basePrice, duration);
      }
    });
  });

  // IP count buttons
  const ipInput = document.getElementById("ip-count");
  const minusBtn = document.querySelector(".minus-btn");
  const plusBtn = document.querySelector(".plus-btn");

  if (minusBtn && plusBtn && ipInput) {
    minusBtn.addEventListener("click", function () {
      const currentValue = parseInt(ipInput.value) || 1;
      if (currentValue > 1) {
        ipInput.value = currentValue - 1;
        ipInput.dispatchEvent(new Event('change'));
      }
    });

    plusBtn.addEventListener("click", function () {
      const currentValue = parseInt(ipInput.value) || 1;
      const maxValue = parseInt(ipInput.max) || 9;
      if (currentValue < maxValue) {
        ipInput.value = currentValue + 1;
        ipInput.dispatchEvent(new Event('change'));
      }
    });

    ipInput.addEventListener("change", function () {
      if (selectedService) {
        const selectedDuration = document.querySelector(".duration-btn.selected");
        const duration = selectedDuration ? parseInt(selectedDuration.dataset.duration) : 1;
        const basePrice = selectedService.price.amount;
        updatePrice(basePrice, duration);
      }
    });
  }

  // Cart button functionality
  const cartBtn = document.querySelector(".cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", async function () {
      // Validate form
      const errors = validateForm();
      if (errors.length > 0) {
        showValidationErrors(errors);
        return;
      }

      // Show loading state
      cartBtn.disabled = true;
      cartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال افزودن...';

      try {
        // Prepare order data
        const selectedDuration = document.querySelector(".duration-btn.selected");
        const duration = selectedDuration ? parseInt(selectedDuration.dataset.duration) : 1;

        const orderData = {
          serviceId: selectedService.id,
          serverName: document.getElementById('service-name').value.trim(),
          operatingSystem: document.getElementById('os-select').value,
          duration: duration,
          extras: {
            cpu: getSelectedExtraValue('cpu'),
            ram: getSelectedExtraValue('ram'),
            storage: getSelectedExtraValue('storage'),
            ip: parseInt(document.getElementById('ip-count').value) || 1,
            traffic: getSelectedExtraValue('traffic')
          }
        };

        // Add to cart
        const success = await addToCart(orderData);

        if (success) {
          // Redirect to cart page after a short delay
          setTimeout(() => {
            window.location.href = '/cart.html';
          }, 1500);
        }
      } catch (error) {
        console.error('Error in cart process:', error);
        showError('خطا در پردازش سفارش');
      } finally {
        // Reset button state
        cartBtn.disabled = false;
        cartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> افزودن به سبد خرید';
      }
    });
  }

  // Helper function to get selected extra value
  function getSelectedExtraValue(type) {
    const selector = document.querySelector(`.price-selector[data-type="${type}"]`);
    return selector ? parseInt(selector.value) || 0 : 0;
  }

  // Form validation on input
  document.getElementById('service-name')?.addEventListener('input', function () {
    const errorElement = document.getElementById('service-name-error');
    if (errorElement) {
      if (this.value.trim().length >= 3) {
        errorElement.style.display = 'none';
      } else {
        errorElement.style.display = 'block';
      }
    }
  });

  document.getElementById('os-select')?.addEventListener('change', function () {
    const errorElement = document.getElementById('os-error');
    if (errorElement) {
      if (this.value) {
        errorElement.style.display = 'none';
      } else {
        errorElement.style.display = 'block';
      }
    }
  });

  // Auto-select first duration button
  const firstDurationBtn = document.querySelector(".duration-btn");
  if (firstDurationBtn) {
    firstDurationBtn.classList.add("selected");
  }
});
