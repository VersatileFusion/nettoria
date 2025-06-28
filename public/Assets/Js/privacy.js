class PrivacyManager {
  constructor() {
    this.privacyContent = null;
    this.lastUpdated = null;
  }

  // Initialize the privacy manager
  async initialize() {
    try {
      await this.loadPrivacyContent();
      this.setupEventListeners();
      this.renderPrivacy();
    } catch (error) {
      console.error("Error initializing privacy:", error);
      this.showError("خطا در بارگذاری حریم خصوصی");
    }
  }

  // Load privacy content from backend
  async loadPrivacyContent() {
    try {
      const response = await fetch("/api/content/privacy");
      if (!response.ok) {
        throw new Error("Failed to fetch privacy content");
      }

      const data = await response.json();
      this.privacyContent = data.data || this.getDefaultPrivacyContent();
      this.lastUpdated = data.lastUpdated || new Date().toISOString();
    } catch (error) {
      console.error("Error loading privacy content:", error);
      // Fallback to default content
      this.privacyContent = this.getDefaultPrivacyContent();
      this.lastUpdated = new Date().toISOString();
    }
  }

  // Get default privacy content
  getDefaultPrivacyContent() {
    return {
      title: "حریم خصوصی",
      sections: [
        {
          title: "جمع‌آوری اطلاعات",
          content:
            "ما اطلاعات شخصی شما را فقط زمانی جمع‌آوری می‌کنیم که شما داوطلبانه آن‌ها را در اختیار ما قرار دهید. این اطلاعات ممکن است شامل نام، آدرس ایمیل، شماره تلفن و سایر اطلاعات تماس باشد.",
        },
        {
          title: "استفاده از اطلاعات",
          content:
            "اطلاعات جمع‌آوری شده برای ارائه خدمات، بهبود تجربه کاربری، ارتباط با شما و ارسال اطلاعات مهم استفاده می‌شود.",
        },
        {
          title: "اشتراک‌گذاری اطلاعات",
          content:
            "ما اطلاعات شخصی شما را با هیچ شخص ثالثی به اشتراک نمی‌گذاریم، مگر در مواردی که قانون اجازه دهد یا شما رضایت صریح داده باشید.",
        },
        {
          title: "امنیت اطلاعات",
          content:
            "ما از روش‌های امنیتی مناسب برای محافظت از اطلاعات شخصی شما استفاده می‌کنیم و دسترسی غیرمجاز به این اطلاعات را محدود می‌کنیم.",
        },
        {
          title: "کوکی‌ها",
          content:
            "ما از کوکی‌ها برای بهبود تجربه کاربری و ارائه خدمات بهتر استفاده می‌کنیم. شما می‌توانید تنظیمات مرورگر خود را برای مدیریت کوکی‌ها تغییر دهید.",
        },
        {
          title: "حقوق شما",
          content:
            "شما حق دارید به اطلاعات شخصی خود دسترسی داشته باشید، آن‌ها را اصلاح کنید یا حذف کنید. برای این منظور می‌توانید با ما تماس بگیرید.",
        },
        {
          title: "تغییرات در حریم خصوصی",
          content:
            "ما ممکن است این سیاست حریم خصوصی را از زمان به زمان به‌روزرسانی کنیم. تغییرات مهم از طریق ایمیل یا اعلان در وب‌سایت به شما اطلاع داده خواهد شد.",
        },
        {
          title: "تماس با ما",
          content:
            "اگر سوالی در مورد این سیاست حریم خصوصی دارید، لطفاً با ما تماس بگیرید: privacy@nettoria.com",
        },
      ],
    };
  }

  // Render privacy page
  renderPrivacy() {
    const privacyContainer = document.querySelector(".privacy-container");
    if (!privacyContainer) return;

    privacyContainer.innerHTML = `
      <div class="privacy-header">
        <h1>${this.privacyContent.title}</h1>
        <p class="last-updated">
          آخرین به‌روزرسانی: ${this.formatDate(this.lastUpdated)}
        </p>
      </div>
      
      <div class="privacy-content">
        ${this.privacyContent.sections
          .map(
            (section, index) => `
          <div class="privacy-section" id="section-${index}">
            <h2>${section.title}</h2>
            <div class="section-content">
              <p>${section.content}</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      
      <div class="privacy-footer">
        <div class="contact-info">
          <h3>تماس با ما</h3>
          <p>برای سوالات مربوط به حریم خصوصی:</p>
          <div class="contact-details">
            <div class="contact-item">
              <i class="bx bx-envelope"></i>
              <span>privacy@nettoria.com</span>
            </div>
            <div class="contact-item">
              <i class="bx bx-phone"></i>
              <span>021-12345678</span>
            </div>
          </div>
        </div>
        
        <div class="privacy-actions">
          <button class="btn btn-primary download-policy">
            <i class="bx bx-download"></i>
            دانلود PDF
          </button>
          <button class="btn btn-secondary print-policy">
            <i class="bx bx-printer"></i>
            چاپ
          </button>
        </div>
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    // Download policy
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("download-policy")) {
        this.downloadPolicy();
      }
    });

    // Print policy
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("print-policy")) {
        this.printPolicy();
      }
    });

    // Smooth scrolling for anchor links
    document.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && e.target.hash) {
        e.preventDefault();
        const target = document.querySelector(e.target.hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }

  // Download privacy policy as PDF
  async downloadPolicy() {
    try {
      const response = await fetch("/api/content/privacy/pdf", {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download privacy policy");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "privacy-policy.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      this.showSuccess("حریم خصوصی با موفقیت دانلود شد");
    } catch (error) {
      console.error("Error downloading privacy policy:", error);
      this.showError("خطا در دانلود حریم خصوصی");
    }
  }

  // Print privacy policy
  printPolicy() {
    const printWindow = window.open("", "_blank");
    const content = document.querySelector(".privacy-content").innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <title>حریم خصوصی - نتوریا</title>
        <style>
          body {
            font-family: 'Tahoma', sans-serif;
            line-height: 1.6;
            margin: 20px;
            direction: rtl;
          }
          h1, h2 {
            color: #333;
          }
          .privacy-section {
            margin-bottom: 30px;
          }
          .section-content {
            margin-top: 10px;
          }
          @media print {
            .privacy-actions {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>حریم خصوصی - نتوریا</h1>
        <p>آخرین به‌روزرسانی: ${this.formatDate(this.lastUpdated)}</p>
        ${content}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Get authentication token
  getAuthToken() {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  // Show success message
  showSuccess(message) {
    this.showToast(message, "success");
  }

  // Show error message
  showError(message) {
    this.showToast(message, "error");
  }

  // Show info message
  showInfo(message) {
    this.showToast(message, "info");
  }

  // Show toast notification
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const privacyManager = new PrivacyManager();
  privacyManager.initialize();
});
