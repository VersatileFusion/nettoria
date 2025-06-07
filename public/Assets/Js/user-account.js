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

// Personal info section button click handler
document
  .querySelector(".personal-info-section .panel-btn")
  .addEventListener("click", () => {
    Alert(
      "توجه",
      "لطفا برای تغییر مشخصات فردی با پشتیبانی تماس بگیرید",
      5000,
      "info"
    );
  });

// Other info section button click handler
const otherInfoBtn = document.querySelector(".other-info-section .panel-btn");
const emailInput = document.querySelector(
  '.other-info-section input[value="test@mail.com"]'
);
const phoneInput = document.querySelector(
  '.other-info-section input[value="09192881516"]'
);

// Add validation feedback elements
const emailError = document.createElement('div');
emailError.className = 'validation-error';
emailInput.parentNode.appendChild(emailError);

const phoneError = document.createElement('div');
phoneError.className = 'validation-error';
phoneInput.parentNode.appendChild(phoneError);

// Real-time email validation
emailInput.addEventListener('input', () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailInput.value)) {
    emailError.textContent = 'لطفا یک ایمیل معتبر وارد کنید';
    emailInput.style.borderColor = '#dc3545';
  } else {
    emailError.textContent = '';
    emailInput.style.borderColor = '#47cf73';
  }
});

// Real-time phone validation
phoneInput.addEventListener('input', () => {
  const phoneRegex = /^09[0-9]{9}$/;
  if (!phoneRegex.test(phoneInput.value)) {
    phoneError.textContent = 'لطفا یک شماره موبایل معتبر وارد کنید (مثال: 09123456789)';
    phoneInput.style.borderColor = '#dc3545';
  } else {
    phoneError.textContent = '';
    phoneInput.style.borderColor = '#47cf73';
  }
});

otherInfoBtn.addEventListener("click", () => {
  if (otherInfoBtn.textContent === "تغییر مشخصات") {
    // Enable editing
    emailInput.removeAttribute("readonly");
    phoneInput.removeAttribute("readonly");
    otherInfoBtn.textContent = "ذخیره تغییرات";
    otherInfoBtn.removeAttribute("disabled");
    
    // Clear any existing validation messages
    emailError.textContent = '';
    phoneError.textContent = '';
    emailInput.style.borderColor = '';
    phoneInput.style.borderColor = '';
  } else {
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailInput.value)) {
      emailError.textContent = 'لطفا یک ایمیل معتبر وارد کنید';
      emailInput.style.borderColor = '#dc3545';
      return;
    }

    // Validate phone number format (Iranian mobile number)
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(phoneInput.value)) {
      phoneError.textContent = 'لطفا یک شماره موبایل معتبر وارد کنید (مثال: 09123456789)';
      phoneInput.style.borderColor = '#dc3545';
      return;
    }

    // Save changes if validation passes
    emailInput.setAttribute("readonly", "");
    phoneInput.setAttribute("readonly", "");
    otherInfoBtn.textContent = "تغییر مشخصات";
    otherInfoBtn.setAttribute("disabled", "");
    Alert(
      "موفقیت",
      "تغییرات با موفقیت ذخیره شد",
      3000,
      "success"
    );
  }
});

// Email verification button click handler
document
  .querySelector(".email-notification .panel-btn")
  .addEventListener("click", () => {
    Alert(
      "تایید ایمیل",
      "ایمیل تایید برای شما ارسال شد. لطفا صندوق ورودی خود را بررسی کنید.",
      5000,
      "info"
    );
  });

function Alert(title, message, time, type) {
  const toastContainer = document.querySelector(".toast");

  const wrapper = document.createElement("div");
  wrapper.className = `wrapper ${type}`;

  // Icon
  const icon = document.createElement("span");
  icon.className = "icon";
  icon.innerHTML = {
    success: "✔️",
    info: "ℹ️",
    warning: "⚠️",
    error: "❌"
  }[type] || "ℹ️";

  // Content
  const text = document.createElement("span");
  text.innerHTML = `<b>${title}</b><br>${message}`;

  wrapper.appendChild(icon);
  wrapper.appendChild(text);
  toastContainer.appendChild(wrapper);

  setTimeout(() => {
    wrapper.remove();
  }, time);
}
