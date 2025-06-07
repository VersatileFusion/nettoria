// password strength start
let passwordInput = document.getElementById("password");
let passwordStrengths = document.querySelectorAll(".password-strength");
let text = document.getElementById("text");

// Fix password strength indicator
let indicator = document.querySelector(".indicator");
let weak = document.querySelector(".weak");
let medium = document.querySelector(".medium");
let strong = document.querySelector(".strong");

passwordInput.addEventListener("input", function (event) {
  let password = event.target.value;
  let strength = Math.min(password.length, 12);

  // Show indicator when typing
  indicator.style.display = "flex";

  // Update strength indicators
  let strengthText = strength <= 4 ? "ضعیف" : strength <= 8 ? "متوسط" : "قوی";
  let gradientColor =
    strength <= 4 ? "#ff2c1c" : strength <= 8 ? "#ff9800" : "#12ff12";

  passwordInput.style.border = `2px solid ${gradientColor}`;
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
    const password = document.querySelector("#password");
    const confirmPassword = document.querySelector("#confirm-password");

    if (!matchDiv) return;

    if (password.value === "" && confirmPassword.value === "") {
      matchDiv.style.display = "none";
      confirmPassword.style.border = "2px solid rgba(255, 255, 255, 0.2)";
    } else if (password.value === confirmPassword.value) {
      matchDiv.style.display = "block";
      matchDiv.classList.add("valid");
      matchDiv.classList.remove("invalid");
      matchDiv.textContent = "رمز عبور یکسان است";
      matchDiv.style.color = "#2ecc71";
      confirmPassword.style.border = "2px solid #2ecc71";
    } else {
      matchDiv.style.display = "block";
      matchDiv.classList.remove("valid");
      matchDiv.classList.add("invalid");
      matchDiv.textContent = "رمز عبور یکسان نیست";
      matchDiv.style.color = "#ff2c1c";
      confirmPassword.style.border = "2px solid #ff2c1c";
    }
  }

  password.addEventListener("input", checkPasswordMatch);
  confirmPassword.addEventListener("input", checkPasswordMatch);
});

// password match end

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
