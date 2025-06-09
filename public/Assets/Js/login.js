const togglePassword = document.querySelector("#toggle");
const password = document.querySelector("#password");

togglePassword.addEventListener("click", function () {
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);

  const icon = this.querySelector("i");
  if (type === "password") {
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");

menuIcon.onclick = () => {
  navbar.classList.toggle("active");
  menuIcon.classList.toggle("bx-x");
};

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
    navbar.classList.remove("active");
    menuIcon.classList.remove("bx-x");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".form");
  const usernameInput = form.querySelector('input[type="text"]');
  const rememberCheckbox = form.querySelector(".ui-checkbox");

  // Load saved username if exists
  const savedUsername = localStorage.getItem("username");
  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberCheckbox.checked = true;
  }

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = usernameInput.value;

    // Save username if remember me is checked
    if (rememberCheckbox.checked) {
      localStorage.setItem("username", username);
    } else {
      localStorage.removeItem("username");
    }

    // Handle login logic here
    // ...
  });
});

// Login page functionality
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const twoFAForm = document.getElementById("2faForm");
  const errorMessage = document.getElementById("errorMessage");
  const twoFAErrorMessage = document.getElementById("2faErrorMessage");
  const cancel2FA = document.getElementById("cancel2FA");
  const togglePassword = document.getElementById("toggle");
  const passwordInput = document.getElementById("password");

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.querySelector("i").classList.toggle("fa-eye");
    togglePassword.querySelector("i").classList.toggle("fa-eye-slash");
  });

  // Handle login form submission
  Utils.handleFormSubmit(loginForm, async (form) => {
    const email = form.querySelector("#email").value;
    const password = form.querySelector("#password").value;
    const remember = form.querySelector("#remember").checked;

    try {
      const response = await apiService.login(email, password);

      if (response.requires2FA) {
        // Show 2FA form
        loginForm.style.display = "none";
        twoFAForm.style.display = "block";
      } else {
        // Redirect to dashboard
        window.location.href = "/panel.html";
      }
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = "block";
    }
  });

  // Handle 2FA form submission
  Utils.handleFormSubmit(twoFAForm, async (form) => {
    const code = form.querySelector("#2faCode").value;

    try {
      const response = await apiService.verify2FA(code);
      window.location.href = "/panel.html";
    } catch (error) {
      twoFAErrorMessage.textContent = error.message;
      twoFAErrorMessage.style.display = "block";
    }
  });

  // Handle 2FA cancellation
  cancel2FA.addEventListener("click", () => {
    twoFAForm.style.display = "none";
    loginForm.style.display = "block";
    apiService.clearToken();
  });

  // Check if user is already logged in
  if (apiService.token) {
    window.location.href = "/panel.html";
  }
});
