class TermsManager {
  constructor() {
    this.termsContent = null;
    this.lastUpdated = null;
  }

  // Initialize the terms manager
  async initialize() {
    try {
      await this.loadTermsContent();
      this.setupEventListeners();
      this.renderTerms();
    } catch (error) {
      console.error("Error initializing terms:", error);
      this.showError("خطا در بارگذاری شرایط استفاده");
    }
  }

  // Load terms content from backend
  async loadTermsContent() {
    try {
      const response = await fetch("/api/content/terms");
      if (!response.ok) {
        throw new Error("Failed to fetch terms content");
      }

      const data = await response.json();
      this.termsContent = data.data || this.getDefaultTermsContent();
      this.lastUpdated = data.lastUpdated || new Date().toISOString();
    } catch (error) {
      console.error("Error loading terms content:", error);
      // Fallback to default content
      this.termsContent = this.getDefaultTermsContent();
      this.lastUpdated = new Date().toISOString();
    }
  }

  // Get default terms content
  getDefaultTermsContent() {
    return {
      title: "شرایط استفاده از خدمات",
      sections: [
        {
          title: "پذیرش شرایط",
          content:
            "با استفاده از خدمات نتوریا، شما موافقت می‌کنید که این شرایط استفاده را پذیرفته‌اید. اگر با هر بخشی از این شرایط موافق نیستید، لطفاً از خدمات ما استفاده نکنید.",
        },
        {
          title: "شرح خدمات",
          content:
            "نتوریا خدمات هاستینگ، سرور مجازی، ثبت دامنه، VPN و سایر خدمات مرتبط با فناوری اطلاعات را ارائه می‌دهد. جزئیات کامل هر سرویس در صفحات مربوطه ذکر شده است.",
        },
        {
          title: "ثبت‌نام و حساب کاربری",
          content:
            "برای استفاده از خدمات، شما باید یک حساب کاربری ایجاد کنید. شما مسئول حفظ امنیت اطلاعات حساب کاربری خود و تمام فعالیت‌هایی که تحت حساب شما انجام می‌شود هستید.",
        },
        {
          title: "پرداخت و صورتحساب",
          content:
            "تمام خدمات بر اساس تعرفه‌های اعلام شده محاسبه می‌شود. پرداخت‌ها باید قبل از فعال‌سازی خدمات انجام شود. عدم پرداخت به موقع ممکن است منجر به تعلیق یا لغو خدمات شود.",
        },
        {
          title: "استفاده مجاز",
          content:
            "شما متعهد می‌شوید که از خدمات ما فقط برای اهداف قانونی استفاده کنید. استفاده از خدمات برای فعالیت‌های غیرقانونی، نقض حقوق دیگران یا ایجاد اختلال در سیستم‌ها ممنوع است.",
        },
        {
          title: "محدودیت‌های استفاده",
          content:
            "استفاده بیش از حد از منابع سرور، ارسال اسپم، حملات سایبری، نقض کپی‌رایت و سایر فعالیت‌های مخرب ممنوع است. ما حق داریم در صورت نقض این شرایط، خدمات را متوقف کنیم.",
        },
        {
          title: "امنیت و حریم خصوصی",
          content:
            "ما متعهد به حفظ امنیت و حریم خصوصی اطلاعات شما هستیم. اطلاعات شخصی شما طبق سیاست حریم خصوصی ما محافظت می‌شود.",
        },
        {
          title: "پشتیبانی فنی",
          content:
            "ما پشتیبانی فنی برای خدمات خود ارائه می‌دهیم. ساعات پشتیبانی و روش‌های تماس در بخش پشتیبانی وب‌سایت ذکر شده است.",
        },
        {
          title: "تضمین و مسئولیت",
          content:
            'خدمات ما "همان‌طور که هست" ارائه می‌شود. ما هیچ تضمینی برای عملکرد بدون وقفه یا عدم وجود خطا نمی‌دهیم. مسئولیت ما محدود به مبلغ پرداخت شده برای خدمات است.',
        },
        {
          title: "فسخ و لغو",
          content:
            "شما می‌توانید در هر زمان خدمات خود را لغو کنید. ما نیز ممکن است در صورت نقض شرایط، خدمات را متوقف کنیم. در صورت لغو، مبلغ باقی‌مانده طبق سیاست بازپرداخت ما محاسبه می‌شود.",
        },
        {
          title: "تغییرات در شرایط",
          content:
            "ما حق داریم این شرایط را در هر زمان تغییر دهیم. تغییرات مهم از طریق ایمیل یا اعلان در وب‌سایت به شما اطلاع داده خواهد شد. ادامه استفاده از خدمات پس از تغییرات، به معنای پذیرش شرایط جدید است.",
        },
        {
          title: "قانون حاکم",
          content:
            "این شرایط تحت قوانین جمهوری اسلامی ایران تفسیر و اجرا می‌شود. هرگونه اختلاف از طریق مذاکره یا مراجع قضایی حل خواهد شد.",
        },
      ],
    };
  }

  // Render terms page
  renderTerms() {
    const termsContainer = document.querySelector(".terms-container");
    if (!termsContainer) return;

    termsContainer.innerHTML = `
      <div class="terms-header">
        <h1>${this.termsContent.title}</h1>
        <p class="last-updated">
          آخرین به‌روزرسانی: ${this.formatDate(this.lastUpdated)}
        </p>
      </div>
      
      <div class="terms-content">
        ${this.termsContent.sections
        .map(
          (section, index) => `
          <div class="terms-section" id="section-${index}">
            <h2>${section.title}</h2>
            <div class="section-content">
              <p>${section.content}</p>
            </div>
          </div>
        `
        )
        .join("")}
      </div>
      
      <div class="terms-footer">
        <div class="contact-info">
          <h3>تماس با ما</h3>
          <p>برای سوالات مربوط به شرایط استفاده:</p>
          <div class="contact-details">
            <div class="contact-item">
              <i class="bx bx-envelope"></i>
              <span>legal@nettoria.com</span>
            </div>
            <div class="contact-item">
              <i class="bx bx-phone"></i>
              <span>021-12345678</span>
            </div>
          </div>
        </div>
        
        <div class="terms-actions">
          <button class="btn btn-primary download-terms">
            <i class="bx bx-download"></i>
            دانلود PDF
          </button>
          <button class="btn btn-secondary print-terms">
            <i class="bx bx-printer"></i>
            چاپ
          </button>
        </div>
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    // Download terms
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("download-terms")) {
        this.downloadTerms();
      }
    });

    // Print terms
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("print-terms")) {
        this.printTerms();
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

  // Download terms as PDF
  async downloadTerms() {
    try {
      const response = await fetch("/api/content/terms/pdf", {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download terms");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "terms-of-service.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      this.showSuccess("شرایط استفاده با موفقیت دانلود شد");
    } catch (error) {
      console.error("Error downloading terms:", error);
      this.showError("خطا در دانلود شرایط استفاده");
    }
  }

  // Print terms
  printTerms() {
    const printWindow = window.open("", "_blank");
    const content = document.querySelector(".terms-content").innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <title>شرایط استفاده - نتوریا</title>
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
          .terms-section {
            margin-bottom: 30px;
          }
          .section-content {
            margin-top: 10px;
          }
          @media print {
            .terms-actions {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>شرایط استفاده - نتوریا</h1>
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
  const termsManager = new TermsManager();
  termsManager.initialize();
});
