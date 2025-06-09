document.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated
  if (!utils.isAuthenticated()) {
    utils.redirectTo("/login.html");
    return;
  }

  const withdrawalsList = document.getElementById("withdrawalsList");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const statusFilter = document.getElementById("statusFilter");
  const withdrawalDetailsModal = document.getElementById(
    "withdrawalDetailsModal"
  );
  const dateRangeModal = document.getElementById("dateRangeModal");
  const cancelWithdrawalBtn = document.getElementById("cancelWithdrawalBtn");
  const dateRangeForm = document.getElementById("dateRangeForm");
  const exportButtons = document.querySelectorAll(".export-btn");
  const presetButtons = document.querySelectorAll(".preset-btn");

  // Set default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  document.getElementById("startDate").value = thirtyDaysAgo
    .toISOString()
    .split("T")[0];
  document.getElementById("endDate").value = today.toISOString().split("T")[0];

  // Function to set date range based on preset
  function setDateRange(range) {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (range) {
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "all":
        startDate.setFullYear(2000); // Set to a reasonable past date
        break;
      default:
        return;
    }

    document.getElementById("startDate").value = startDate
      .toISOString()
      .split("T")[0];
    document.getElementById("endDate").value = endDate
      .toISOString()
      .split("T")[0];
  }

  // Handle preset button clicks
  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      presetButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");
      // Set date range based on preset
      setDateRange(button.dataset.range);
    });
  });

  // Load withdrawal requests
  async function loadWithdrawals(status = "all") {
    try {
      utils.showLoading("errorMessage");
      const response = await apiClient.getWithdrawalRequests(status);

      if (response.success) {
        displayWithdrawals(response.data);
      } else {
        utils.showError(
          "errorMessage",
          response.message || "خطا در دریافت درخواست‌های برداشت وجه"
        );
      }
    } catch (error) {
      utils.showError("errorMessage", "خطا در دریافت درخواست‌های برداشت وجه");
      console.error("Load withdrawals error:", error);
    }
  }

  // Display withdrawal requests in the list
  function displayWithdrawals(withdrawals) {
    if (!withdrawalsList) return;

    withdrawalsList.innerHTML = withdrawals
      .map(
        (withdrawal) => `
                <div class="transaction-item" data-id="${withdrawal.id}">
                    <div class="transaction-info">
                        <div class="transaction-title">درخواست برداشت وجه</div>
                        <div class="transaction-date">${new Date(
                          withdrawal.createdAt
                        ).toLocaleDateString("fa-IR")}</div>
                    </div>
                    <div class="transaction-details">
                        <span class="transaction-status ${withdrawal.status.toLowerCase()}">${getStatusText(
          withdrawal.status
        )}</span>
                        <span class="transaction-amount debit">${withdrawal.amount.toLocaleString()} تومان</span>
                    </div>
                </div>
            `
      )
      .join("");

    // Add click event listeners to withdrawal items
    document.querySelectorAll(".transaction-item").forEach((item) => {
      item.addEventListener("click", () => {
        const withdrawalId = item.dataset.id;
        showWithdrawalDetails(withdrawalId);
      });
    });
  }

  // Get status text in Persian
  function getStatusText(status) {
    const statusMap = {
      pending: "در انتظار تایید",
      processing: "در حال پردازش",
      completed: "تکمیل شده",
      cancelled: "لغو شده",
      rejected: "رد شده",
    };
    return statusMap[status] || status;
  }

  // Show withdrawal details modal
  async function showWithdrawalDetails(withdrawalId) {
    try {
      utils.showLoading("errorMessage");
      const response = await apiClient.getWithdrawalDetails(withdrawalId);

      if (response.success) {
        const withdrawal = response.data;

        // Update modal content
        document.getElementById("withdrawalId").textContent = withdrawal.id;
        document.getElementById(
          "withdrawalAmount"
        ).textContent = `${withdrawal.amount.toLocaleString()} تومان`;
        document.getElementById("withdrawalBank").textContent =
          withdrawal.bankName;
        document.getElementById("withdrawalAccount").textContent =
          withdrawal.bankAccount;
        document.getElementById("withdrawalStatus").textContent = getStatusText(
          withdrawal.status
        );
        document.getElementById("withdrawalDate").textContent = new Date(
          withdrawal.createdAt
        ).toLocaleDateString("fa-IR");

        // Show/hide completion date
        const completionDateContainer = document.getElementById(
          "completionDateContainer"
        );
        if (withdrawal.completedAt) {
          document.getElementById("withdrawalCompletionDate").textContent =
            new Date(withdrawal.completedAt).toLocaleDateString("fa-IR");
          completionDateContainer.style.display = "flex";
        } else {
          completionDateContainer.style.display = "none";
        }

        // Show/hide rejection reason
        const rejectionReasonContainer = document.getElementById(
          "rejectionReasonContainer"
        );
        if (withdrawal.rejectionReason) {
          document.getElementById("withdrawalRejectionReason").textContent =
            withdrawal.rejectionReason;
          rejectionReasonContainer.style.display = "flex";
        } else {
          rejectionReasonContainer.style.display = "none";
        }

        // Show/hide cancel button
        cancelWithdrawalBtn.style.display =
          withdrawal.status === "pending" ? "block" : "none";
        cancelWithdrawalBtn.onclick = () => cancelWithdrawal(withdrawalId);

        // Show modal
        withdrawalDetailsModal.style.display = "flex";
      } else {
        utils.showError(
          "errorMessage",
          response.message || "خطا در دریافت جزئیات درخواست"
        );
      }
    } catch (error) {
      utils.showError("errorMessage", "خطا در دریافت جزئیات درخواست");
      console.error("Show withdrawal details error:", error);
    }
  }

  // Cancel withdrawal request
  async function cancelWithdrawal(withdrawalId) {
    if (!confirm("آیا از لغو این درخواست برداشت وجه اطمینان دارید؟")) {
      return;
    }

    try {
      utils.showLoading("errorMessage");
      const response = await apiClient.cancelWithdrawalRequest(withdrawalId);

      if (response.success) {
        utils.showSuccess(
          "successMessage",
          "درخواست برداشت وجه با موفقیت لغو شد"
        );
        withdrawalDetailsModal.style.display = "none";
        loadWithdrawals(statusFilter.value); // Reload withdrawals
      } else {
        utils.showError(
          "errorMessage",
          response.message || "خطا در لغو درخواست برداشت وجه"
        );
      }
    } catch (error) {
      utils.showError("errorMessage", "خطا در لغو درخواست برداشت وجه");
      console.error("Cancel withdrawal error:", error);
    }
  }

  // Handle status filter change
  statusFilter.addEventListener("change", () => {
    loadWithdrawals(statusFilter.value);
  });

  // Handle export buttons click
  exportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const format = button.dataset.format;
      dateRangeForm.dataset.format = format;
      dateRangeModal.style.display = "flex";
    });
  });

  // Handle date range form submission
  dateRangeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(dateRangeForm);
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const format = dateRangeForm.dataset.format;
    const status = statusFilter.value;

    try {
      utils.showLoading("errorMessage");
      await apiClient.exportWithdrawals(format, { startDate, endDate, status });
      utils.showSuccess(
        "successMessage",
        `خروجی ${format.toUpperCase()} با موفقیت دانلود شد`
      );
      dateRangeModal.style.display = "none";
      // Reset preset buttons
      presetButtons.forEach((btn) => btn.classList.remove("active"));
    } catch (error) {
      utils.showError(
        "errorMessage",
        `خطا در دانلود خروجی ${format.toUpperCase()}`
      );
      console.error("Export error:", error);
    }
  });

  // Handle modal close
  document.querySelectorAll(".close-modal").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      withdrawalDetailsModal.style.display = "none";
      dateRangeModal.style.display = "none";
      // Reset preset buttons
      presetButtons.forEach((btn) => btn.classList.remove("active"));
    });
  });

  // Handle modal close when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === withdrawalDetailsModal) {
      withdrawalDetailsModal.style.display = "none";
    }
    if (e.target === dateRangeModal) {
      dateRangeModal.style.display = "none";
      // Reset preset buttons
      presetButtons.forEach((btn) => btn.classList.remove("active"));
    }
  });

  // Load withdrawals on page load
  loadWithdrawals();
});
