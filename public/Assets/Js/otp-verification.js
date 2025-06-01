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
  const otpForm = document.getElementById("otpForm");
  const otpInputs = document.querySelectorAll(".otp-input");
  const errorMessage = document.getElementById("errorMessage");
  const resendBtn = document.getElementById("resend-btn");
  const countdownSpan = document.getElementById("countdown");
  const displayPhone = document.getElementById("display-phone");

  // Get phone number from storage
  const phoneNumber = sessionStorage.getItem("verificationPhoneNumber");
  if (!phoneNumber) {
    window.location.href = "/login.html";
    return;
  }

  // Display phone number
  displayPhone.textContent = phoneNumber;

  // Handle OTP input
  otpInputs.forEach((input, index) => {
    // Auto-focus next input
    input.addEventListener("input", function () {
      if (this.value.length === 1) {
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      }
    });

    // Handle backspace
    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !this.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // Start countdown timer
  let timeLeft = 120; // 2 minutes in seconds
  const timer = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    countdownSpan.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
    }
  }, 1000);

  // Handle resend button
  resendBtn.addEventListener("click", async function () {
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset timer
        timeLeft = 120;
        resendBtn.disabled = true;
        errorMessage.style.display = "none";

        // Clear OTP inputs
        otpInputs.forEach((input) => {
          input.value = "";
        });
        otpInputs[0].focus();
      } else {
        errorMessage.textContent =
          data.message || "Failed to resend OTP. Please try again.";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      errorMessage.textContent = "An error occurred. Please try again.";
      errorMessage.style.display = "block";
    }
  });

  // Handle form submission
  otpForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorMessage.style.display = "none";

    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        if (data.rememberMe) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }

        // Clear session storage
        sessionStorage.removeItem("verificationPhoneNumber");

        // Redirect to home page
        window.location.href = "/index.html";
      } else {
        errorMessage.textContent =
          data.message || "Invalid OTP. Please try again.";
        errorMessage.style.display = "block";

        // Clear OTP inputs
        otpInputs.forEach((input) => {
          input.value = "";
        });
        otpInputs[0].focus();
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      errorMessage.textContent = "An error occurred. Please try again.";
      errorMessage.style.display = "block";
    }
  });
});

// Function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
