console.log("signup.js loaded");

const API_BASE_URL = "http://localhost:5000/api";

// password strength start
let passwordInput = document.getElementById("password");
let passwordStrengths = document.querySelectorAll(".password-strength");
let text = document.getElementById("text");

passwordInput.addEventListener("input", function (event) {
  let password = event.target.value;
  let strength = Math.min(password.length, 12);
  let degree = strength * 30;
  let gradientColor =
    strength <= 4 ? "#ff2c1c" : strength <= 8 ? "#ff9800" : "#12ff12";
  let strengthText = strength <= 4 ? "ضعیف" : strength <= 8 ? "متوسط" : "قوی";

  passwordInput.style.border = `2px solid ${gradientColor}`;

  passwordStrengths.forEach((passwordStrength) => {
    passwordStrength.style.background = `conic-gradient(${gradientColor} ${degree}deg, rgba(17, 17, 17, 0.5) ${degree}deg)`;
  });

  text.textContent = strengthText;
  text.style.color = gradientColor;
});

// password strength end

// password toggle start

const togglePassword = document.querySelector("#toggle");
const toggleConfirmPassword = document.querySelector("#toggle-confirm");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirm-password");

togglePassword.addEventListener("click", function () {
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);

  this.querySelector("i").classList.toggle("fa-eye");
  this.querySelector("i").classList.toggle("fa-eye-slash");
});

toggleConfirmPassword.addEventListener("click", function () {
  const type =
    confirmPassword.getAttribute("type") === "password" ? "text" : "password";
  confirmPassword.setAttribute("type", type);
  this.querySelector("i").classList.toggle("fa-eye");
  this.querySelector("i").classList.toggle("fa-eye-slash");
});

const passwordPolicies = document.querySelector(".password-policies");
const policies = document.querySelectorAll(".password-policies > div");

passwordInput.addEventListener("click", (e) => {
  e.stopPropagation();
  passwordPolicies.style.display = "block";
  document.querySelector("#box h2").style.display = "block";
});

passwordInput.addEventListener("focus", (e) => {
  e.stopPropagation();
  passwordPolicies.style.display = "block";
  document.querySelector("#box h2").style.display = "block";
});

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;

  const lengthValid = password.length >= 8;
  policies[0].classList.toggle("valid", lengthValid);

  const numberValid = /[0-9]/.test(password);
  policies[1].classList.toggle("valid", numberValid);

  const upperValid = /[A-Z]/.test(password);
  policies[2].classList.toggle("valid", upperValid);

  const specialValid = /[^A-Za-z0-9]/.test(password);
  policies[3].classList.toggle("valid", specialValid);
});

document.addEventListener("click", (e) => {
  if (
    !passwordInput.contains(e.target) &&
    !passwordPolicies.contains(e.target)
  ) {
    passwordPolicies.style.display = "none";
    document.querySelector("#box h2").style.display = "none";
  }
});
// password toggle end

// password match start

console.log("Password Input:", passwordInput);
console.log("Password Policies:", passwordPolicies);

document.addEventListener("DOMContentLoaded", function () {
  const password = document.querySelector("#password");
  const confirmPassword = document.querySelector("#confirm-password");
  const passwordPolicies = document.querySelector(".password-policies");

  if (!document.querySelector(".password-match")) {
    const matchDiv = document.createElement("div");
    matchDiv.className = "password-match";
    matchDiv.textContent = "رمز عبور یکسان است";
    passwordPolicies.appendChild(matchDiv);
  }

  function checkPasswordMatch() {
    const matchDiv = document.querySelector(".password-match");
    if (password.value === "" && confirmPassword.value === "") {
      matchDiv.style.display = "none";
      confirmPassword.style.border = "2px solid rgba(255, 255, 255, 0.2)";
    } else if (password.value === confirmPassword.value) {
      matchDiv.style.display = "none";
      confirmPassword.style.border = "2px solid rgba(255, 255, 255, 0.2)";
    } else {
      matchDiv.classList.remove("valid");
      matchDiv.classList.add("invalid");
      matchDiv.style.display = "block";
      matchDiv.textContent = "رمز عبور یکسان نیست";
      matchDiv.style.color = "#ff2c1c";
      matchDiv.style.fontSize = "14px";
      confirmPassword.style.border = "2px solid #ff2c1c";
    }
  }

  password.addEventListener("input", checkPasswordMatch);
  confirmPassword.addEventListener("input", checkPasswordMatch);
});

// password match end

// phone input start
const phoneInput = document.querySelector("#phone");

phoneInput.addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 0) {
    if (!value.startsWith("")) {
      value = "" + value.slice(value.startsWith("9") ? 1 : 2);
    }
  }

  value = value.slice(0, 10);

  this.value = value;
});

phoneInput.addEventListener("keypress", function (e) {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
});

phoneInput.addEventListener("paste", function (e) {
  e.preventDefault();
  const pastedText = (e.clipboardData || window.clipboardData).getData("text");
  let numericText = pastedText.replace(/\D/g, "");

  if (numericText.length > 0) {
    if (!numericText.startsWith("09")) {
      numericText =
        "09" + numericText.slice(numericText.startsWith("9") ? 1 : 2);
    }
    this.value = numericText.slice(0, 11);
  }
});
// phone input end

// Email validation start
const emailInput = document.querySelector('input[type="email"]');

emailInput.addEventListener("input", function () {
  const email = this.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") {
    this.style.border = "2px solid rgba(255, 255, 255, 0.2)";
  } else if (emailRegex.test(email)) {
    this.style.border = "2px solid rgba(255, 255, 255, 0.2)";
  } else {
    this.style.border = "2px solid #ff2c1c";
  }
});

// Add blur event to check when user leaves the field
emailInput.addEventListener("blur", function () {
  const email = this.value;
  if (email && !/@.*\./.test(email)) {
  }
});

// Emali Validation end

function Alert(title, message, time, type) {
  const toastContainer = document.querySelector(".toast");

  const wrapper = document.createElement("div");
  wrapper.className = `wrapper ${type}`;

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

  setTimeout(() => {
    wrapper.remove();
  }, time);
}

Alert(
  "خطا",
  "سرور به مشکل برخورد کرد,چند دقیقه دیگر امتحان کنید",
  5000,
  "error"
);

// Notification End
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

// Popup implementation
const modalContainer = document.querySelector("[data-modal-container]");
const overlay = document.querySelector("[data-overlay]");
const closeModalBtn = document.querySelector("[data-modal-close-btn]");
const termsLink = document.querySelector(".terms-link");

// Function to open the modal
function openModal() {
  modalContainer.style.display = "block";
}

// Function to close the modal
function closeModal() {
  modalContainer.style.display = "none";
}

// Add event listeners
termsLink.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent link default behavior
  openModal();
});

closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.querySelector(".form");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordToggle = document.getElementById("toggle");
  const confirmPasswordToggle = document.getElementById("toggle-confirm");
  const termsCheckbox = document.querySelector(".ui-checkbox");
  const toast = document.querySelector(".toast");

  // Password strength indicators
  const weakIndicator = document.querySelector(".weak");
  const mediumIndicator = document.querySelector(".medium");
  const strongIndicator = document.querySelector(".strong");
  const strengthText = document.getElementById("text");

  // Password policies
  const policyLength = document.querySelector(".policy-length");
  const policyNumber = document.querySelector(".policy-number");
  const policyUppercase = document.querySelector(".policy-uppercase");
  const policySpecial = document.querySelector(".policy-special");

  // Toggle password visibility
  function togglePasswordVisibility(input, toggle) {
    toggle.addEventListener("click", function () {
      const type =
        input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
      this.querySelector("i").classList.toggle("fa-eye");
      this.querySelector("i").classList.toggle("fa-eye-slash");
    });
  }

  togglePasswordVisibility(passwordInput, passwordToggle);
  togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);

  // Password strength checker
  function checkPasswordStrength(password) {
    let strength = 0;

    // Length check
    if (password.length >= 8) {
      strength += 1;
      policyLength.style.color = "#0f0";
    } else {
      policyLength.style.color = "#f00";
    }

    // Number check
    if (/\d/.test(password)) {
      strength += 1;
      policyNumber.style.color = "#0f0";
    } else {
      policyNumber.style.color = "#f00";
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 1;
      policyUppercase.style.color = "#0f0";
    } else {
      policyUppercase.style.color = "#f00";
    }

    // Special character check
    if (/[!@#$%^&*]/.test(password)) {
      strength += 1;
      policySpecial.style.color = "#0f0";
    } else {
      policySpecial.style.color = "#f00";
    }

    // Update strength indicators
    weakIndicator.style.width = strength >= 1 ? "100%" : "0%";
    mediumIndicator.style.width = strength >= 2 ? "100%" : "0%";
    strongIndicator.style.width = strength >= 3 ? "100%" : "0%";

    // Update strength text
    if (strength <= 1) {
      strengthText.textContent = "ضعیف";
      strengthText.style.color = "#f00";
    } else if (strength <= 3) {
      strengthText.textContent = "متوسط";
      strengthText.style.color = "#ffa500";
    } else {
      strengthText.textContent = "قوی";
      strengthText.style.color = "#0f0";
    }

    return strength;
  }

  // Check password match
  function checkPasswordMatch() {
    const matchIndicator = document.querySelector(".password-match");
    if (confirmPasswordInput.value === passwordInput.value) {
      matchIndicator.textContent = "رمز عبور مطابقت دارد";
      matchIndicator.style.color = "#0f0";
      return true;
    } else {
      matchIndicator.textContent = "رمز عبور مطابقت ندارد";
      matchIndicator.style.color = "#f00";
      return false;
    }
  }

  // Event listeners for password validation
  passwordInput.addEventListener("input", () =>
    checkPasswordStrength(passwordInput.value)
  );
  confirmPasswordInput.addEventListener("input", checkPasswordMatch);

  // Show toast message
  function showToast(message, type = "error") {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  // Handle form submission
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate terms acceptance
    if (!termsCheckbox.checked) {
      showToast("لطفا شرایط و قوانین را مطالعه و تایید کنید");
      return;
    }

    // Validate password strength
    const strength = checkPasswordStrength(passwordInput.value);
    if (strength < 3) {
      showToast("لطفا رمز عبور قوی‌تری انتخاب کنید");
      return;
    }

    // Validate password match
    if (!checkPasswordMatch()) {
      showToast("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }

    // Get form data
    const formData = {
      firstName: document
        .querySelector('input[type="text"]')
        .value.split(" ")[0],
      lastName: document
        .querySelector('input[type="text"]')
        .value.split(" ")
        .slice(1)
        .join(" "),
      phoneNumber: document.getElementById("phone").value,
      email: document.querySelector('input[type="email"]').value,
      password: passwordInput.value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(
          "ثبت نام با موفقیت انجام شد. لطفا ایمیل خود را برای تایید حساب کاربری بررسی کنید.",
          "success"
        );
        setTimeout(() => {
          window.location.href = "/login.html";
        }, 3000);
      } else {
        showToast(data.message || "خطا در ثبت نام. لطفا دوباره تلاش کنید.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      showToast("خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.");
    }
  });

  // Terms and conditions modal
  const modalContainer = document.querySelector("[data-modal-container]");
  const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
  const overlay = document.querySelector("[data-overlay]");
  const termsLink = document.querySelector(".terms-link");

  termsLink.addEventListener("click", (e) => {
    e.preventDefault();
    modalContainer.classList.add("active");
  });

  function closeModal() {
    modalContainer.classList.remove("active");
  }

  modalCloseBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
});

// Signup form submission
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".form");
  const termsCheckbox = document.querySelector(".ui-checkbox");
  const toastContainer = document.querySelector(".toast");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form values
    const fullName = document.querySelector('input[type="text"]').value;
    const phoneNumber = document.querySelector("#phone").value;
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;

    // Validate terms acceptance
    if (!termsCheckbox.checked) {
      Alert("خطا", "لطفا شرایط و قوانین را مطالعه و تایید کنید", 5000, "error");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      Alert("خطا", "رمز عبور و تکرار آن یکسان نیستند", 5000, "error");
      return;
    }

    // Validate password strength
    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!(hasNumber && hasUpper && hasSpecial && isLongEnough)) {
      Alert(
        "خطا",
        "رمز عبور باید شامل حروف بزرگ، اعداد و کاراکترهای خاص باشد",
        5000,
        "error"
      );
      return;
    }

    try {
      // Split full name into first and last name
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      // Send registration request
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber: `98${phoneNumber}`,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store phone number for verification
        sessionStorage.setItem("verificationPhoneNumber", `98${phoneNumber}`);

        // Show success message
        Alert(
          "موفقیت",
          "ثبت نام با موفقیت انجام شد. لطفا کد تایید را وارد کنید",
          5000,
          "success"
        );

        // Redirect to OTP verification page
        setTimeout(() => {
          window.location.href = "/otp-verification.html";
        }, 2000);
      } else {
        Alert("خطا", data.message || "خطا در ثبت نام", 5000, "error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert("خطا", "خطا در ارتباط با سرور", 5000, "error");
    }
  });
});
