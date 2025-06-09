document.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated
  if (!utils.isAuthenticated()) {
    utils.redirectTo("/login.html");
    return;
  }

  const profileForm = document.getElementById("profileForm");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  // Load user profile data
  async function loadUserProfile() {
    try {
      utils.showLoading("errorMessage");
      const response = await apiClient.getUserProfile();

      if (response.success) {
        // Fill form with user data
        const form = document.getElementById("profileForm");
        if (form) {
          form.elements["fullName"].value = response.data.fullName || "";
          form.elements["email"].value = response.data.email || "";
          form.elements["phone"].value = response.data.phone || "";
        }
      } else {
        utils.showError(
          "errorMessage",
          response.message || "خطا در دریافت اطلاعات کاربر"
        );
      }
    } catch (error) {
      utils.showError("errorMessage", "خطا در دریافت اطلاعات کاربر");
      console.error("Load profile error:", error);
    }
  }

  // Handle profile form submission
  if (profileForm) {
    profileForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = utils.getFormData("profileForm");

      // Validate inputs
      if (!utils.validateEmail(formData.email)) {
        utils.showError("errorMessage", "لطفا یک ایمیل معتبر وارد کنید");
        return;
      }

      try {
        utils.showLoading("errorMessage");
        const response = await apiClient.updateUserProfile(formData);

        if (response.success) {
          utils.showSuccess("successMessage", "اطلاعات با موفقیت بروزرسانی شد");
        } else {
          utils.showError(
            "errorMessage",
            response.message || "خطا در بروزرسانی اطلاعات"
          );
        }
      } catch (error) {
        utils.showError("errorMessage", "خطا در بروزرسانی اطلاعات");
        console.error("Update profile error:", error);
      }
    });
  }

  // Load user profile on page load
  loadUserProfile();
});
