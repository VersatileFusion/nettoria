// Shared Alert function
function Alert(title, message, time, type) {
  const toastContainer = document.querySelector(".toast");
  if (!toastContainer) {
    console.error("Toast container not found");
    return;
  }

  const number = Math.random().toString(36).substr(2, 9);
  const wrapper = document.createElement("div");
  wrapper.className = `wrapper ${type}`;
  wrapper.id = `wrapper-${number}`;

  const main = document.createElement("div");
  main.className = `main ${type}-icon`;

  const titleElement = document.createElement("div");
  titleElement.innerText = title;
  titleElement.style.fontSize = "16px";
  titleElement.style.fontWeight = "600";

  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.style.fontSize = "14px";

  main.appendChild(titleElement);
  main.appendChild(messageElement);
  wrapper.appendChild(main);
  toastContainer.appendChild(wrapper);

  anime({
    targets: `#wrapper-${number}`,
    translateX: [-300, 0],
    duration: 750,
    easing: "spring(1, 70, 100, 10)",
  });

  setTimeout(() => {
    anime({
      targets: `#wrapper-${number}`,
      translateX: [0, 300],
      duration: 750,
      easing: "spring(1, 80, 100, 0)",
    });
    setTimeout(() => {
      wrapper.remove();
    }, 750);
  }, time);
}

// Menu functionality
function initializeMenu() {
  const menuIcon = document.querySelector(".bx-menu");
  const navbar = document.querySelector(".navbar");

  if (!menuIcon || !navbar) return;

  // ریست کردن وضعیت منو هنگام لود صفحه
  function resetMenu() {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    menuIcon.style.visibility = "visible";
    document.body.style.overflow = "auto";
  }

  resetMenu(); // اجرا هنگام لود شدن صفحه

  // باز کردن و بستن منو
  menuIcon.addEventListener("click", () => {
    const isActive = navbar.classList.toggle("active");
    menuIcon.classList.toggle("menu-fixed", isActive);

    // مدیریت visibility به درستی
    menuIcon.style.visibility = isActive ? "hidden" : "visible";

    // جلوگیری از اسکرول هنگام باز بودن منو
    document.body.style.overflow = isActive ? "hidden" : "auto";
  });

  // بستن منو با کلیک بیرون از آن
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
      resetMenu();
    }
  });

  // بستن منو هنگام کلیک روی لینک‌های داخل منو
  document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", () => {
      resetMenu();
    });
  });
}

// اجرای تابع هنگام لود صفحه
document.addEventListener("DOMContentLoaded", initializeMenu);

// Export functions to window object for global access
window.Alert = Alert;
window.initializeMenu = initializeMenu;

// Utility functions for Nettoria
const utils = {
  // Authentication
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  setToken(token) {
    localStorage.setItem("token", token);
  },

  clearAuth() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  },

  // UI Helpers
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '<div class="loading">Loading...</div>';
    }
  },

  showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="error">${message}</div>`;
    }
  },

  showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="success">${message}</div>`;
    }
  },

  // Form Helpers
  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return null;

    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    return data;
  },

  // Navigation
  redirectTo(url) {
    window.location.href = url;
  },

  // Validation
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePassword(password) {
    return password.length >= 8;
  },
};

// Utility functions for UI interactions and notifications
class Utils {
  // Show loading spinner
  static showLoading(element) {
    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";
    spinner.innerHTML = '<div class="spinner"></div>';
    element.appendChild(spinner);
  }

  // Hide loading spinner
  static hideLoading(element) {
    const spinner = element.querySelector(".loading-spinner");
    if (spinner) {
      spinner.remove();
    }
  }

  // Show notification
  static showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Format currency
  static formatCurrency(amount, currency = "IRR") {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  // Format date
  static formatDate(date) {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  // Validate email
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate password strength
  static validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  // Handle form submission
  static async handleFormSubmit(form, submitHandler) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;

      try {
        submitButton.disabled = true;
        submitButton.textContent = "Processing...";
        await submitHandler(form);
      } catch (error) {
        Utils.showNotification(error.message, "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }

  // Handle API errors
  static handleApiError(error) {
    console.error("API Error:", error);
    Utils.showNotification(error.message || "خطا در ارتباط با سرور", "error");
  }

  // Check authentication status
  static checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  }

  // Logout
  static logout() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  }

  // Pagination helper
  static createPagination(currentPage, totalPages, onPageChange) {
    const pagination = document.createElement("div");
    pagination.className = "pagination";

    // Previous button
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => onPageChange(currentPage - 1);
    pagination.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.className = i === currentPage ? "active" : "";
      pageButton.onclick = () => onPageChange(i);
      pagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => onPageChange(currentPage + 1);
    pagination.appendChild(nextButton);

    return pagination;
  }
}

// Utility functions for the application

// Format currency
function formatCurrency(amount, currency = "IRR") {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Format date
function formatDate(date) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Show error message
function showError(message, duration = 5000) {
  const errorDiv = document.getElementById("errorMessage");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, duration);
  }
}

// Show success message
function showSuccess(message, duration = 5000) {
  const successDiv = document.getElementById("successMessage");
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = "block";
    setTimeout(() => {
      successDiv.style.display = "none";
    }, duration);
  }
}

// Validate form
function validateForm(formData) {
  const errors = {};

  for (const [key, value] of formData.entries()) {
    if (!value) {
      errors[key] = "این فیلد الزامی است";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Format phone number
function formatPhoneNumber(phone) {
  return phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
}

// Generate random string
function generateRandomString(length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Export functions
window.utils = {
  formatCurrency,
  formatDate,
  showError,
  showSuccess,
  validateForm,
  handleApiError,
  checkAuth,
  formatPhoneNumber,
  generateRandomString,
  debounce,
  throttle,
};
