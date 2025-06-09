document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("successPasswordForm");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitButton = document.getElementById("submitButton");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

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

  // Handle password input
  const handlePasswordInput = () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const error = validatePassword(password);

    if (error) {
      showError(error);
      submitButton.disabled = true;
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      showError("Passwords do not match");
      submitButton.disabled = true;
      return;
    }

    errorMessage.style.display = "none";
    submitButton.disabled = !password || !confirmPassword;
  };

  // Add input event listeners
  passwordInput.addEventListener("input", handlePasswordInput);
  confirmPasswordInput.addEventListener("input", handlePasswordInput);

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitButton.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/success-password/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          password: passwordInput.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set success password");
      }

      showSuccess("Success password set successfully");
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
});
