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
  const form = document.getElementById("oneTimeLoginForm");
  const phoneInput = document.getElementById("phone");
  const errorMessage = document.querySelector(".error-message");
  const submitButton = document.querySelector(".btn");

  // Phone number validation
  function validatePhoneNumber(phone) {
    // Remove any non-digit characters
    phone = phone.replace(/\D/g, "");

    // Check if phone number is valid (10 digits)
    if (phone.length !== 10) {
      errorMessage.style.display = "block";
      return false;
    }

    errorMessage.style.display = "none";
    return true;
  }

  // Handle phone input
  phoneInput.addEventListener("input", function () {
    validatePhoneNumber(this.value);
  });

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("Form submitted"); // Debug log

    const phoneNumber = phoneInput.value;
    console.log("Phone number:", phoneNumber); // Debug log

    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    try {
      // Show loading state
      submitButton.disabled = true;
      submitButton.textContent = "در حال ارسال...";

      console.log("Sending request to server..."); // Debug log
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: `98${phoneNumber}`, // Add country code
        }),
      });

      console.log("Response received:", response.status); // Debug log
      const data = await response.json();
      console.log("Response data:", data); // Debug log

      if (response.ok) {
        // Store phone number in session storage for OTP verification
        sessionStorage.setItem("verificationPhoneNumber", `98${phoneNumber}`);
        // Show success message
        alert("کد تایید با موفقیت ارسال شد");
        // Redirect to OTP verification page
        window.location.href = "/otp-verification.html";
      } else {
        alert(data.message || "خطا در ارسال کد تایید. لطفا دوباره تلاش کنید.");
      }
    } catch (error) {
      console.error("One-time login error:", error);
      alert("خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.");
    } finally {
      // Reset button state
      submitButton.disabled = false;
      submitButton.textContent = "دریافت کد تایید";
    }
  });
});

// Function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
