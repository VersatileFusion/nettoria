// User profile management functionality
document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profile-form");
  const securityForm = document.getElementById("security-form");
  const notificationForm = document.getElementById("notification-form");
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");

  let userProfile = null;

  // Initialize profile management
  async function initializeProfile() {
    try {
      // Fetch user profile
      const response = await apiClient.get("/users/profile");
      if (!response.success) {
        throw new Error(response.message || "خطا در دریافت اطلاعات کاربر");
      }

      userProfile = response.data;
      populateProfileForm(userProfile);
      populateSecuritySettings(userProfile);
      populateNotificationSettings(userProfile);
      setupEventListeners();
    } catch (error) {
      utils.showError("error-message", error.message);
      console.error("Profile initialization error:", error);
    }
  }

  // Populate profile form
  function populateProfileForm(profile) {
    if (!profileForm) return;

    const fields = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      company: profile.company || "",
      address: profile.address || "",
    };

    Object.entries(fields).forEach(([field, value]) => {
      const input = profileForm.querySelector(`[name="${field}"]`);
      if (input) {
        input.value = value;
      }
    });
  }

  // Populate security settings
  function populateSecuritySettings(profile) {
    if (!securityForm) return;

    // Set up two-factor authentication status
    const twoFactorToggle = securityForm.querySelector(
      '[name="twoFactorEnabled"]'
    );
    if (twoFactorToggle) {
      twoFactorToggle.checked = profile.twoFactorEnabled;
    }

    // Set up login history
    const loginHistory = securityForm.querySelector(".login-history");
    if (loginHistory && profile.loginHistory) {
      loginHistory.innerHTML = profile.loginHistory
        .map(
          (login) => `
        <div class="login-item">
          <div class="login-info">
            <span class="login-date">${utils.formatDate(login.date)}</span>
            <span class="login-ip">${login.ip}</span>
            <span class="login-device">${login.device}</span>
          </div>
          <div class="login-status ${login.status.toLowerCase()}">
            ${login.status === "success" ? "موفق" : "ناموفق"}
          </div>
        </div>
      `
        )
        .join("");
    }
  }

  // Populate notification settings
  function populateNotificationSettings(profile) {
    if (!notificationForm) return;

    const settings = profile.notificationSettings || {};
    Object.entries(settings).forEach(([type, enabled]) => {
      const checkbox = notificationForm.querySelector(
        `[name="notify_${type}"]`
      );
      if (checkbox) {
        checkbox.checked = enabled;
      }
    });
  }

  // Set up event listeners
  function setupEventListeners() {
    // Profile form submission
    if (profileForm) {
      profileForm.addEventListener("submit", handleProfileUpdate);
    }

    // Security form submission
    if (securityForm) {
      securityForm.addEventListener("submit", handleSecurityUpdate);
    }

    // Notification form submission
    if (notificationForm) {
      notificationForm.addEventListener("submit", handleNotificationUpdate);
    }

    // Two-factor authentication toggle
    const twoFactorToggle = securityForm?.querySelector(
      '[name="twoFactorEnabled"]'
    );
    if (twoFactorToggle) {
      twoFactorToggle.addEventListener("change", handleTwoFactorToggle);
    }

    // Password change form
    const passwordForm = securityForm?.querySelector("#password-form");
    if (passwordForm) {
      passwordForm.addEventListener("submit", handlePasswordChange);
    }
  }

  // Handle profile update
  async function handleProfileUpdate(e) {
    e.preventDefault();

    try {
      utils.showLoading("error-message");

      const formData = new FormData(profileForm);
      const data = Object.fromEntries(formData.entries());

      const response = await apiClient.put("/users/profile", data);
      if (!response.success) {
        throw new Error(response.message || "خطا در بروزرسانی پروفایل");
      }

      utils.showSuccess("success-message", "پروفایل با موفقیت بروزرسانی شد");
      userProfile = response.data;
    } catch (error) {
      utils.showError("error-message", error.message);
      console.error("Profile update error:", error);
    }
  }

  // Handle security settings update
  async function handleSecurityUpdate(e) {
    e.preventDefault();

    try {
      utils.showLoading("error-message");

      const formData = new FormData(securityForm);
      const data = Object.fromEntries(formData.entries());

      const response = await apiClient.put("/users/security", data);
      if (!response.success) {
        throw new Error(response.message || "خطا در بروزرسانی تنظیمات امنیتی");
      }

      utils.showSuccess(
        "success-message",
        "تنظیمات امنیتی با موفقیت بروزرسانی شد"
      );
      userProfile = response.data;
    } catch (error) {
      utils.showError("error-message", error.message);
      console.error("Security update error:", error);
    }
  }

  // Handle notification settings update
  async function handleNotificationUpdate(e) {
    e.preventDefault();

    try {
      utils.showLoading("error-message");

      const formData = new FormData(notificationForm);
      const data = Object.fromEntries(formData.entries());

      const response = await apiClient.put("/users/notifications", data);
      if (!response.success) {
        throw new Error(
          response.message || "خطا در بروزرسانی تنظیمات اعلان‌ها"
        );
      }

      utils.showSuccess(
        "success-message",
        "تنظیمات اعلان‌ها با موفقیت بروزرسانی شد"
      );
      userProfile = response.data;
    } catch (error) {
      utils.showError("error-message", error.message);
      console.error("Notification update error:", error);
    }
  }

  // Handle two-factor authentication toggle
  async function handleTwoFactorToggle(e) {
    try {
      utils.showLoading("error-message");

      const response = await apiClient.put("/users/two-factor", {
        enabled: e.target.checked,
      });

      if (!response.success) {
        throw new Error(
          response.message || "خطا در تغییر وضعیت احراز هویت دو مرحله‌ای"
        );
      }

      if (e.target.checked) {
        // Show QR code for setup
        showTwoFactorSetup(response.data.qrCode);
      } else {
        utils.showSuccess(
          "success-message",
          "احراز هویت دو مرحله‌ای غیرفعال شد"
        );
      }

      userProfile = response.data;
    } catch (error) {
      e.target.checked = !e.target.checked; // Revert toggle
      utils.showError("error-message", error.message);
      console.error("Two-factor toggle error:", error);
    }
  }

  // Show two-factor setup modal
  function showTwoFactorSetup(qrCode) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h3>راه‌اندازی احراز هویت دو مرحله‌ای</h3>
        <div class="setup-steps">
          <p>1. برنامه Google Authenticator را نصب کنید</p>
          <p>2. کد QR زیر را اسکن کنید</p>
          <div class="qr-code">
            <img src="${qrCode}" alt="QR Code">
          </div>
          <p>3. کد تایید را وارد کنید</p>
          <form id="verify-2fa-form">
            <input type="text" name="code" placeholder="کد تایید" required>
            <button type="submit" class="btn btn-primary">تایید</button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle verification
    const verifyForm = modal.querySelector("#verify-2fa-form");
    verifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = verifyForm.querySelector('[name="code"]').value;

      try {
        const response = await apiClient.post("/users/verify-2fa", { code });
        if (!response.success) {
          throw new Error(response.message || "کد تایید نامعتبر است");
        }

        utils.showSuccess(
          "success-message",
          "احراز هویت دو مرحله‌ای با موفقیت فعال شد"
        );
        modal.remove();
      } catch (error) {
        utils.showError("error-message", error.message);
        console.error("2FA verification error:", error);
      }
    });
  }

  // Handle password change
  async function handlePasswordChange(e) {
    e.preventDefault();

    try {
      utils.showLoading("error-message");

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      // Validate passwords
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("رمز عبور جدید و تکرار آن مطابقت ندارند");
      }

      const response = await apiClient.put("/users/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (!response.success) {
        throw new Error(response.message || "خطا در تغییر رمز عبور");
      }

      utils.showSuccess("success-message", "رمز عبور با موفقیت تغییر کرد");
      e.target.reset();
    } catch (error) {
      utils.showError("error-message", error.message);
      console.error("Password change error:", error);
    }
  }

  // Initialize profile management
  initializeProfile();
});
