console.log("signup.js loaded");

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
  const signupForm = document.getElementById("signupForm");
  const errorMessage = document.getElementById("errorMessage");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = utils.getFormData("signupForm");

      // Validate inputs
      if (!utils.validateEmail(formData.email)) {
        utils.showError("errorMessage", "لطفا یک ایمیل معتبر وارد کنید");
        return;
      }

      if (!utils.validatePassword(formData.password)) {
        utils.showError("errorMessage", "رمز عبور باید حداقل 8 کاراکتر باشد");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        utils.showError("errorMessage", "رمز عبور و تکرار آن مطابقت ندارند");
        return;
      }

      try {
        utils.showLoading("errorMessage");
        const response = await apiClient.signup(formData);

        if (response.success) {
          utils.showSuccess(
            "errorMessage",
            "ثبت نام با موفقیت انجام شد. لطفا وارد شوید."
          );
          setTimeout(() => {
            utils.redirectTo("/login.html");
          }, 2000);
        } else {
          utils.showError("errorMessage", response.message || "خطا در ثبت نام");
        }
      } catch (error) {
        utils.showError("errorMessage", "خطایی رخ داد. لطفا دوباره تلاش کنید.");
        console.error("Signup error:", error);
      }
    });
  }
});

// Signup page functionality
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const togglePassword = document.getElementById("toggle");
  const toggleConfirmPassword = document.getElementById("toggle-confirm");
  const errorMessage = document.getElementById("errorMessage");
  const passwordMatch = document.querySelector(".password-match");
  const passwordStrength = document.getElementById("text");
  const termsCheckbox = document.getElementById("terms");

  // Password strength indicators
  const strengthIndicators = {
    weak: document.querySelector(".weak"),
    medium: document.querySelector(".medium"),
    strong: document.querySelector(".strong"),
  };

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.querySelector("i").classList.toggle("fa-eye");
    togglePassword.querySelector("i").classList.toggle("fa-eye-slash");
  });

  toggleConfirmPassword.addEventListener("click", () => {
    const type =
      confirmPasswordInput.getAttribute("type") === "password"
        ? "text"
        : "password";
    confirmPasswordInput.setAttribute("type", type);
    toggleConfirmPassword.querySelector("i").classList.toggle("fa-eye");
    toggleConfirmPassword.querySelector("i").classList.toggle("fa-eye-slash");
  });

  // Check password strength
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const strength = Utils.validatePassword(password);

    // Reset indicators
    Object.values(strengthIndicators).forEach((indicator) => {
      indicator.style.width = "0%";
    });

    if (password.length >= 8) {
      strengthIndicators.weak.style.width = "100%";
      if (password.match(/[A-Z]/) && password.match(/[a-z]/)) {
        strengthIndicators.medium.style.width = "100%";
        if (password.match(/[0-9]/) && password.match(/[^A-Za-z0-9]/)) {
          strengthIndicators.strong.style.width = "100%";
          passwordStrength.textContent = "قوی";
        } else {
          passwordStrength.textContent = "متوسط";
        }
      } else {
        passwordStrength.textContent = "ضعیف";
      }
    } else {
      passwordStrength.textContent = "";
    }
  });

  // Check password match
  confirmPasswordInput.addEventListener("input", () => {
    if (confirmPasswordInput.value === passwordInput.value) {
      passwordMatch.textContent = "رمز عبور مطابقت دارد";
      passwordMatch.style.color = "#2ecc71";
    } else {
      passwordMatch.textContent = "رمز عبور مطابقت ندارد";
      passwordMatch.style.color = "#e74c3c";
    }
  });

  // Handle form submission
  Utils.handleFormSubmit(signupForm, async (form) => {
    const formData = new FormData(form);
    const data = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    // Validate form data
    if (!Utils.validateEmail(data.email)) {
      throw new Error("لطفا یک ایمیل معتبر وارد کنید");
    }

    if (!Utils.validatePassword(data.password)) {
      throw new Error(
        "رمز عبور باید حداقل 8 کاراکتر و شامل حروف بزرگ، کوچک، اعداد و کاراکترهای خاص باشد"
      );
    }

    if (data.password !== data.confirmPassword) {
      throw new Error("رمز عبور و تکرار آن مطابقت ندارند");
    }

    if (!termsCheckbox.checked) {
      throw new Error("لطفا شرایط و قوانین را مطالعه و تایید کنید");
    }

    try {
      const response = await apiService.register(
        data.email,
        data.password,
        data.fullName
      );
      Utils.showNotification(
        "ثبت نام با موفقیت انجام شد. لطفا وارد شوید.",
        "success"
      );
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 2000);
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = "block";
    }
  });

  // Terms and conditions modal
  const modalContainer = document.querySelector("[data-modal-container]");
  const overlay = document.querySelector("[data-overlay]");
  const closeBtn = document.querySelector("[data-modal-close-btn]");
  const termsLink = document.querySelector(".terms-link");

  termsLink.addEventListener("click", (e) => {
    e.preventDefault();
    modalContainer.classList.add("active");
  });

  const closeModal = () => {
    modalContainer.classList.remove("active");
  };

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
});
