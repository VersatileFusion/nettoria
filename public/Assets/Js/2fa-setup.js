document.addEventListener("DOMContentLoaded", () => {
  const setupSteps = document.getElementById("setup-steps");
  const steps = setupSteps.querySelectorAll(".step");
  let currentStep = 0;
  let secretKey = "";

  // Show specific step
  function showStep(stepNumber) {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === stepNumber);
    });
    currentStep = stepNumber;
  }

  // Generate 2FA secret
  document
    .getElementById("generate-secret")
    .addEventListener("click", async () => {
      try {
        const response = await apiClient.generate2FASecret();
        if (response.success) {
          secretKey = response.data.secret;
          document.getElementById("qrcode").src = response.data.qrCode;
          document.getElementById("secret-key").textContent = secretKey;
          showStep(1);
        } else {
          showError("خطا در ایجاد کلید امنیتی");
        }
      } catch (error) {
        showError("خطا در ارتباط با سرور");
      }
    });

  // Copy secret key
  document.getElementById("copy-secret").addEventListener("click", () => {
    navigator.clipboard.writeText(secretKey).then(() => {
      const copyBtn = document.getElementById("copy-secret");
      copyBtn.textContent = "کپی شد!";
      setTimeout(() => {
        copyBtn.textContent = "کپی";
      }, 2000);
    });
  });

  // Next to verification
  document.getElementById("next-to-verify").addEventListener("click", () => {
    showStep(2);
  });

  // Verify setup
  document
    .getElementById("verify-setup")
    .addEventListener("click", async () => {
      const verificationCode =
        document.getElementById("verification-code").value;
      const errorElement = document.getElementById("verification-error");

      if (!verificationCode || verificationCode.length !== 6) {
        errorElement.textContent = "لطفا کد ۶ رقمی را وارد کنید";
        return;
      }

      try {
        const response = await apiClient.verify2FA(verificationCode);
        if (response.success) {
          showStep(3);
        } else {
          errorElement.textContent = response.error.message;
        }
      } catch (error) {
        errorElement.textContent = "خطا در ارتباط با سرور";
      }
    });

  // Handle verification code input
  document
    .getElementById("verification-code")
    .addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value.length === 6) {
        document.getElementById("verify-setup").focus();
      }
    });

  // Show error message
  function showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    setupSteps.insertBefore(errorElement, setupSteps.firstChild);
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }
});
