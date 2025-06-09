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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form");
  const phoneInput = document.getElementById("phone");
  const errorMessage = document.querySelector(".error-message");
  const submitButton = document.querySelector(".btn");

  // Validate phone number format
  function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  }

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = phoneInput.value;

    // Validate phone number
    if (!validatePhone(phone)) {
      errorMessage.style.display = "block";
      return;
    }

    errorMessage.style.display = "none";
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<i class="bx bx-loader-alt bx-spin"></i> در حال ارسال...';

    try {
      // Generate one-time login link
      const response = await apiClient.post("/one-time-login/generate", {
        phone: phone,
      });

      if (response.success) {
        // Store the token in localStorage for verification
        localStorage.setItem("oneTimeLoginToken", response.data.token);

        // Redirect to OTP verification page
        window.location.href = "./otp-verification.html";
      } else {
        showError(response.message || "خطا در ارسال کد تایید");
      }
    } catch (error) {
      showError("خطا در ارتباط با سرور");
      console.error("Error generating one-time login:", error);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML =
        '<a href="./otp-verification.html">دریافت کد تایید</a>';
    }
  });

  // Real-time phone number validation
  phoneInput.addEventListener("input", () => {
    const phone = phoneInput.value;
    if (validatePhone(phone)) {
      errorMessage.style.display = "none";
    } else {
      errorMessage.style.display = "block";
    }
  });

  // Format phone number as user types
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    e.target.value = value;
  });
});

// Function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
