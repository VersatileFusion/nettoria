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
  const otpInputs = document.querySelectorAll(".otp-input");
  const verifyButton = document.querySelector(".verify-btn");
  const errorMessage = document.querySelector(".error-message");
  const resendButton = document.querySelector(".resend-btn");
  const timerDisplay = document.querySelector(".timer");
  let countdown = 120; // 2 minutes countdown

  // Focus first input on load
  otpInputs[0].focus();

  // Handle OTP input
  otpInputs.forEach((input, index) => {
    // Handle input
    input.addEventListener("input", (e) => {
      const value = e.target.value.replace(/[^0-9]/g, "");
      e.target.value = value;

      if (value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    // Handle backspace
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    // Handle paste
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
      const digits = pastedData.split("").slice(0, 6);

      digits.forEach((digit, i) => {
        if (otpInputs[i]) {
          otpInputs[i].value = digit;
        }
      });

      if (digits.length === 6) {
        verifyButton.disabled = false;
      }
    });
  });

  // Start countdown timer
  function startCountdown() {
    const timer = setInterval(() => {
      countdown--;
      const minutes = Math.floor(countdown / 60);
      const seconds = countdown % 60;
      timerDisplay.textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;

      if (countdown <= 0) {
        clearInterval(timer);
        resendButton.disabled = false;
        timerDisplay.style.display = "none";
      }
    }, 1000);
  }

  startCountdown();

  // Handle verification
  verifyButton.addEventListener("click", async () => {
    const code = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");
    const phoneNumber = sessionStorage.getItem("oneTimeLoginPhone");

    if (code.length !== 6) {
      showError("Please enter the complete verification code");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/one-time-login/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token
        localStorage.setItem("token", data.token);

        // Clear session storage
        sessionStorage.removeItem("oneTimeLoginPhone");

        // Redirect to dashboard or home page
        window.location.href = "./panel.html";
      } else {
        showError(data.error || "Invalid verification code");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("An error occurred. Please try again.");
    }
  });

  // Handle resend code
  resendButton.addEventListener("click", async () => {
    const phoneNumber = sessionStorage.getItem("oneTimeLoginPhone");

    try {
      const response = await fetch(`${API_BASE_URL}/one-time-login/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset the form
        otpInputs.forEach((input) => (input.value = ""));
        otpInputs[0].focus();

        // Reset countdown
        countdown = 120;
        startCountdown();
        resendButton.disabled = true;
        timerDisplay.style.display = "block";

        showSuccess("New verification code sent successfully");
      } else {
        showError(data.error || "Failed to resend verification code");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("An error occurred. Please try again.");
    }
  });

  // Error handling
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    errorMessage.classList.add("error");
    errorMessage.classList.remove("success");
  }

  function showSuccess(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    errorMessage.classList.add("success");
    errorMessage.classList.remove("error");
  }
});

// Function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
