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
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  const togglePassword = document.getElementById("toggle");
  const passwordInput = document.getElementById("password");

  // Toggle password visibility
  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.querySelector("i").classList.toggle("fa-eye");
    this.querySelector("i").classList.toggle("fa-eye-slash");
  });

  // Handle form submission
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const identifier = this.identifier.value;
    const password = this.password.value;
    const rememberMe = this.rememberMe.checked;

    try {
      // Show loading state
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'در حال ورود...';
      submitButton.disabled = true;
      errorMessage.style.display = "none";

      // Attempt login
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // If remember me is checked, store the token in localStorage
        if (rememberMe) {
          auth.setToken(data.token);
        } else {
          // Store in sessionStorage for session-only persistence
          sessionStorage.setItem("authToken", data.token);
        }
        // Redirect to dashboard or home page
        window.location.href = "/index.html";
      } else if (response.status === 403 && data.data && data.data.requiresPhoneVerification) {
        // Store phone number for OTP verification
        sessionStorage.setItem("verificationPhoneNumber", data.data.phoneNumber);
        // Redirect to OTP verification page
        window.location.href = "/otp-verification.html";
      } else {
        // Show error message
        errorMessage.textContent = data.message || "خطا در ورود. لطفا دوباره تلاش کنید.";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      // Show error message
      errorMessage.textContent = error.message || "خطا در ورود. لطفا دوباره تلاش کنید.";
      errorMessage.style.display = "block";
    } finally {
      // Reset button state
      const submitButton = this.querySelector('button[type="submit"]');
      submitButton.textContent = "ورود";
      submitButton.disabled = false;
    }
  });

  // Check if user is already logged in
  if (auth.isAuthenticated()) {
    window.location.href = "/index.html";
  }
});
