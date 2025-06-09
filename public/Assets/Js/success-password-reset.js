document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const codeInput = document.getElementById("resetCode");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitButton = document.getElementById("submitButton");
  const resendButton = document.getElementById("resendButton");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const timerDisplay = document.getElementById("timerDisplay");

  let countdownInterval;
  const RESEND_TIMEOUT = 10 * 60; // 10 minutes in seconds

  // Password validation
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  // Show error message
  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    successMessage.style.display = "none";
  };

  // Show success message
  const showSuccess = (message) => {
    successMessage.textContent = message;
    successMessage.style.display = "block";
    errorMessage.style.display = "none";
  };

  // Start countdown timer
  const startCountdown = () => {
    let timeLeft = RESEND_TIMEOUT;
    resendButton.disabled = true;

    const updateTimer = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        resendButton.disabled = false;
        timerDisplay.textContent = "0:00";
      }
      timeLeft--;
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
  };

  // Handle password input
  const handlePasswordInput = () => {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const error = validatePassword(newPassword);

    if (error) {
      showError(error);
      submitButton.disabled = true;
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      showError("Passwords do not match");
      submitButton.disabled = true;
      return;
    }

    errorMessage.style.display = "none";
    submitButton.disabled =
      !codeInput.value || !newPassword || !confirmPassword;
  };

  // Add input event listeners
  codeInput.addEventListener("input", handlePasswordInput);
  newPasswordInput.addEventListener("input", handlePasswordInput);
  confirmPasswordInput.addEventListener("input", handlePasswordInput);

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitButton.disabled = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/success-password/confirm-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            code: codeInput.value,
            newPassword: newPasswordInput.value,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset success password");
      }

      showSuccess("Success password reset successfully");
      form.reset();

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 2000);
    } catch (error) {
      showError(error.message);
      submitButton.disabled = false;
    }
  });

  // Handle resend code
  resendButton.addEventListener("click", async () => {
    resendButton.disabled = true;
    showError("");

    try {
      const response = await fetch(`${API_BASE_URL}/success-password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code");
      }

      showSuccess("Reset code sent successfully");
      form.reset();
      startCountdown();
    } catch (error) {
      showError(error.message);
      resendButton.disabled = false;
    }
  });

  // Start initial countdown
  startCountdown();
});
