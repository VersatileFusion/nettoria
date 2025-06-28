class SupportManager {
  constructor() {
    this.faqs = [];
    this.supportCategories = [];
    this.currentCategory = null;
  }

  // Initialize the support manager
  async initialize() {
    try {
      await this.loadFAQs();
      await this.loadSupportCategories();
      this.setupEventListeners();
      this.renderSupport();
    } catch (error) {
      console.error("Error initializing support:", error);
      this.showError("خطا در بارگذاری بخش پشتیبانی");
    }
  }

  // Load FAQs from backend
  async loadFAQs() {
    try {
      const response = await fetch("/api/content/faq");
      if (!response.ok) {
        throw new Error("Failed to fetch FAQs");
      }

      const data = await response.json();
      this.faqs = data.data || [];
    } catch (error) {
      console.error("Error loading FAQs:", error);
      // Fallback to static FAQs
      this.faqs = this.getDefaultFAQs();
    }
  }

  // Load support categories
  async loadSupportCategories() {
    try {
      const response = await fetch("/api/support/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch support categories");
      }

      const data = await response.json();
      this.supportCategories = data.data || [];
    } catch (error) {
      console.error("Error loading support categories:", error);
      // Fallback to static categories
      this.supportCategories = this.getDefaultCategories();
    }
  }

  // Get default FAQs
  getDefaultFAQs() {
    return [
      {
        id: 1,
        question: "چگونه می‌توانم سرور مجازی خود را راه‌اندازی کنم؟",
        answer:
          "برای راه‌اندازی سرور مجازی، ابتدا از پنل کاربری خود یک سرور جدید ایجاد کنید، سپس سیستم عامل مورد نظر را انتخاب کرده و تنظیمات شبکه را انجام دهید.",
        category: "vps",
      },
      {
        id: 2,
        question: "آیا امکان تغییر پلن سرور وجود دارد؟",
        answer:
          "بله، شما می‌توانید از طریق پنل کاربری خود پلن سرور را ارتقا یا تنزل دهید. این عملیات معمولاً بدون از دست رفتن اطلاعات انجام می‌شود.",
        category: "vps",
      },
      {
        id: 3,
        question: "چگونه می‌توانم دامنه خود را ثبت کنم؟",
        answer:
          "برای ثبت دامنه، ابتدا از قسمت دامنه‌ها، نام دامنه مورد نظر خود را جستجو کنید و در صورت موجود بودن، آن را خریداری کنید.",
        category: "domain",
      },
      {
        id: 4,
        question: "آیا پشتیبانی 24/7 ارائه می‌شود؟",
        answer:
          "بله، تیم پشتیبانی ما 24 ساعت شبانه‌روز و 7 روز هفته آماده پاسخگویی به سوالات شما هستند.",
        category: "general",
      },
    ];
  }

  // Get default categories
  getDefaultCategories() {
    return [
      { id: "general", name: "عمومی", icon: "bx-help-circle" },
      { id: "vps", name: "سرور مجازی", icon: "bx-server" },
      { id: "domain", name: "دامنه", icon: "bx-globe" },
      { id: "hosting", name: "هاستینگ", icon: "bx-cloud" },
      { id: "vpn", name: "VPN", icon: "bx-shield" },
      { id: "billing", name: "پرداخت", icon: "bx-credit-card" },
    ];
  }

  // Render support page
  renderSupport() {
    const supportContainer = document.querySelector(".support-container");
    if (!supportContainer) return;

    supportContainer.innerHTML = `
      <div class="support-header">
        <h1>مرکز پشتیبانی</h1>
        <p>سوالات متداول و راهنمای استفاده از خدمات</p>
      </div>
      
      <div class="support-content">
        <div class="support-sidebar">
          <h3>دسته‌بندی‌ها</h3>
          <div class="category-list">
            ${this.supportCategories
              .map(
                (category) => `
              <div class="category-item" data-category="${category.id}">
                <i class="bx ${category.icon}"></i>
                <span>${category.name}</span>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="contact-support">
            <h3>تماس با پشتیبانی</h3>
            <p>اگر پاسخ سوال خود را نیافتید، با ما تماس بگیرید:</p>
            <div class="contact-methods">
              <div class="contact-method">
                <i class="bx bx-phone"></i>
                <span>021-12345678</span>
              </div>
              <div class="contact-method">
                <i class="bx bx-envelope"></i>
                <span>support@nettoria.com</span>
              </div>
              <div class="contact-method">
                <i class="bx bx-message-square"></i>
                <span>تیکت پشتیبانی</span>
              </div>
            </div>
            <button class="btn btn-primary create-ticket">
              ایجاد تیکت جدید
            </button>
          </div>
        </div>
        
        <div class="support-main">
          <div class="faq-section">
            <h2>سوالات متداول</h2>
            <div class="search-box">
              <input type="text" id="faq-search" placeholder="جستجو در سوالات...">
              <i class="bx bx-search"></i>
            </div>
            <div class="faq-list">
              ${this.renderFAQs()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render FAQs
  renderFAQs() {
    return this.faqs
      .map(
        (faq) => `
      <div class="faq-item" data-category="${faq.category}">
        <div class="faq-question">
          <h4>${faq.question}</h4>
          <i class="bx bx-chevron-down"></i>
        </div>
        <div class="faq-answer">
          <p>${faq.answer}</p>
        </div>
      </div>
    `
      )
      .join("");
  }

  // Setup event listeners
  setupEventListeners() {
    // Category selection
    document.addEventListener("click", (e) => {
      if (e.target.closest(".category-item")) {
        const categoryItem = e.target.closest(".category-item");
        const category = categoryItem.dataset.category;
        this.selectCategory(category);
      }
    });

    // FAQ accordion
    document.addEventListener("click", (e) => {
      if (e.target.closest(".faq-question")) {
        const faqItem = e.target.closest(".faq-item");
        this.toggleFAQ(faqItem);
      }
    });

    // FAQ search
    const searchInput = document.getElementById("faq-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchFAQs(e.target.value);
      });
    }

    // Create ticket
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("create-ticket")) {
        this.createTicket();
      }
    });
  }

  // Select category
  selectCategory(category) {
    // Update active category
    document.querySelectorAll(".category-item").forEach((item) => {
      item.classList.remove("active");
    });
    document
      .querySelector(`[data-category="${category}"]`)
      .classList.add("active");

    // Filter FAQs
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
      if (category === "all" || item.dataset.category === category) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });

    this.currentCategory = category;
  }

  // Toggle FAQ
  toggleFAQ(faqItem) {
    const answer = faqItem.querySelector(".faq-answer");
    const icon = faqItem.querySelector(".faq-question i");

    if (answer.style.display === "block") {
      answer.style.display = "none";
      icon.classList.remove("bx-chevron-up");
      icon.classList.add("bx-chevron-down");
    } else {
      answer.style.display = "block";
      icon.classList.remove("bx-chevron-down");
      icon.classList.add("bx-chevron-up");
    }
  }

  // Search FAQs
  searchFAQs(query) {
    const faqItems = document.querySelectorAll(".faq-item");
    const searchTerm = query.toLowerCase();

    faqItems.forEach((item) => {
      const question = item.querySelector("h4").textContent.toLowerCase();
      const answer = item.querySelector("p").textContent.toLowerCase();

      if (question.includes(searchTerm) || answer.includes(searchTerm)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Create ticket
  createTicket() {
    // Redirect to tickets page
    window.location.href = "/tickets.html";
  }

  // Submit support request
  async submitSupportRequest(formData) {
    try {
      const response = await fetch("/api/support/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit support request");
      }

      const data = await response.json();
      this.showSuccess("درخواست پشتیبانی با موفقیت ارسال شد");
      return data;
    } catch (error) {
      console.error("Error submitting support request:", error);
      this.showError("خطا در ارسال درخواست پشتیبانی");
      throw error;
    }
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
  const supportManager = new SupportManager();
  supportManager.initialize();
});
