document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const twoFactorStatus = document.getElementById("2fa-status");
  const setup2FABtn = document.getElementById("setup-2fa");
  const disable2FABtn = document.getElementById("disable-2fa");
  const loginNotifications = document.getElementById("login-notifications");
  const passwordChangeNotifications = document.getElementById(
    "password-change-notifications"
  );
  const sessionsList = document.getElementById("sessions-list");
  const refreshSessionsBtn = document.getElementById("refresh-sessions");
  const terminateAllSessionsBtn = document.getElementById(
    "terminate-all-sessions"
  );
  const securityLog = document.getElementById("security-log");
  const refreshLogBtn = document.getElementById("refresh-log");
  const disable2FAModal = document.getElementById("disable-2fa-modal");
  const disable2FACode = document.getElementById("disable-2fa-code");
  const confirmDisable2FABtn = document.getElementById("confirm-disable-2fa");
  const cancelDisable2FABtn = document.getElementById("cancel-disable-2fa");
  const disable2FAError = document.getElementById("disable-2fa-error");

  // Load initial state
  loadSecurityPreferences();
  loadActiveSessions();
  loadSecurityLog();

  // Event Listeners
  setup2FABtn.addEventListener("click", () => {
    window.location.href = "./2fa-setup.html";
  });

  disable2FABtn.addEventListener("click", () => {
    disable2FAModal.classList.add("active");
  });

  loginNotifications.addEventListener("change", async (e) => {
    await updateSecurityPreferences({
      loginNotifications: e.target.checked,
    });
  });

  passwordChangeNotifications.addEventListener("change", async (e) => {
    await updateSecurityPreferences({
      passwordChangeNotifications: e.target.checked,
    });
  });

  refreshSessionsBtn.addEventListener("click", loadActiveSessions);
  terminateAllSessionsBtn.addEventListener("click", terminateAllSessions);
  refreshLogBtn.addEventListener("click", loadSecurityLog);

  confirmDisable2FABtn.addEventListener("click", async () => {
    const code = disable2FACode.value;
    if (!code || code.length !== 6) {
      disable2FAError.textContent = "لطفا کد ۶ رقمی را وارد کنید";
      return;
    }

    try {
      const response = await apiClient.disable2FA(code);
      if (response.success) {
        disable2FAModal.classList.remove("active");
        loadSecurityPreferences();
        showSuccessMessage("احراز هویت دو مرحله‌ای با موفقیت غیرفعال شد");
      } else {
        disable2FAError.textContent = response.error.message;
      }
    } catch (error) {
      disable2FAError.textContent = "خطا در ارتباط با سرور";
    }
  });

  cancelDisable2FABtn.addEventListener("click", () => {
    disable2FAModal.classList.remove("active");
    disable2FACode.value = "";
    disable2FAError.textContent = "";
  });

  // Functions
  async function loadSecurityPreferences() {
    try {
      const response = await apiClient.getSecurityPreferences();
      if (response.success) {
        const { twoFactorEnabled, securityPreferences } = response.data;

        // Update 2FA status
        twoFactorStatus.textContent = twoFactorEnabled ? "فعال" : "غیرفعال";
        twoFactorStatus.className = `status-badge ${
          twoFactorEnabled ? "active" : "inactive"
        }`;
        setup2FABtn.style.display = twoFactorEnabled ? "none" : "block";
        disable2FABtn.style.display = twoFactorEnabled ? "block" : "none";

        // Update notification preferences
        loginNotifications.checked = securityPreferences.loginNotifications;
        passwordChangeNotifications.checked =
          securityPreferences.passwordChangeNotifications;
      }
    } catch (error) {
      showErrorMessage("خطا در بارگذاری تنظیمات امنیتی");
    }
  }

  async function loadActiveSessions() {
    try {
      const response = await apiClient.getActiveSessions();
      if (response.success) {
        sessionsList.innerHTML = response.data.sessions
          .map(
            (session) => `
                    <div class="session-item">
                        <div class="session-info">
                            <div class="session-device">${session.device}</div>
                            <div class="session-details">
                                <div>IP: ${session.ip}</div>
                                <div>آخرین فعالیت: ${formatDate(
                                  session.lastActive
                                )}</div>
                            </div>
                        </div>
                        <div class="session-actions">
                            <button class="btn btn-danger" onclick="terminateSession('${
                              session.id
                            }')">
                                خاتمه نشست
                            </button>
                        </div>
                    </div>
                `
          )
          .join("");
      }
    } catch (error) {
      showErrorMessage("خطا در بارگذاری نشست‌های فعال");
    }
  }

  async function loadSecurityLog() {
    try {
      const response = await apiClient.getSecurityLog();
      if (response.success) {
        securityLog.innerHTML = response.data.logs
          .map(
            (log) => `
                    <div class="log-entry">
                        <div class="log-time">${formatDate(log.timestamp)}</div>
                        <div class="log-event">${log.event}</div>
                        <div class="log-details">${log.details}</div>
                    </div>
                `
          )
          .join("");
      }
    } catch (error) {
      showErrorMessage("خطا در بارگذاری گزارش امنیتی");
    }
  }

  async function updateSecurityPreferences(preferences) {
    try {
      const response = await apiClient.updateSecurityPreferences(preferences);
      if (response.success) {
        showSuccessMessage("تنظیمات با موفقیت بروزرسانی شد");
      } else {
        showErrorMessage(response.error.message);
      }
    } catch (error) {
      showErrorMessage("خطا در بروزرسانی تنظیمات");
    }
  }

  async function terminateSession(sessionId) {
    try {
      const response = await apiClient.terminateSession(sessionId);
      if (response.success) {
        loadActiveSessions();
        showSuccessMessage("نشست با موفقیت خاتمه یافت");
      } else {
        showErrorMessage(response.error.message);
      }
    } catch (error) {
      showErrorMessage("خطا در خاتمه نشست");
    }
  }

  async function terminateAllSessions() {
    if (!confirm("آیا از خاتمه همه نشست‌ها اطمینان دارید؟")) {
      return;
    }

    try {
      const response = await apiClient.terminateAllSessions();
      if (response.success) {
        loadActiveSessions();
        showSuccessMessage("همه نشست‌ها با موفقیت خاتمه یافتند");
      } else {
        showErrorMessage(response.error.message);
      }
    } catch (error) {
      showErrorMessage("خطا در خاتمه نشست‌ها");
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function showSuccessMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "success-message";
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 3000);
  }

  function showErrorMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "error-message";
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 3000);
  }
});
