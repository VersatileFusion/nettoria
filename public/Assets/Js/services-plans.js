const apiClient = new ApiClient();

class ServicePlansManager {
  constructor() {
    this.plans = [];
    this.currentPlan = null;
  }

  // Load service plans from backend
  async loadServicePlans() {
    try {
      const res = await apiClient.get("/api/services/plans");
      this.plans = res.data.plans || [];
      this.renderPlans();
    } catch (error) {
      console.error("Failed to load service plans", error);
      this.showError("خطا در بارگذاری پلن‌های سرویس");
    }
  }

  // Get operating systems
  async getOperatingSystems() {
    try {
      const res = await apiClient.get("/api/services/operating-systems");
      return res.data || [];
    } catch (error) {
      console.error("Failed to load operating systems", error);
      throw error;
    }
  }

  // Get data centers
  async getDataCenters() {
    try {
      const res = await apiClient.get("/api/services/data-centers");
      return res.data || [];
    } catch (error) {
      console.error("Failed to load data centers", error);
      throw error;
    }
  }

  // Render plans in the UI
  renderPlans() {
    const container = document.getElementById("service-plans");
    if (!container) return;

    container.innerHTML = this.plans
      .map(
        (plan) => `
        <div class="plan-card" data-plan-id="${plan.id}">
          <div class="plan-header">
            <h3>${plan.nameEn || plan.name}</h3>
            <div class="plan-price">
              <span class="price">${plan.pricing.monthly.toLocaleString()}</span>
              <span class="currency">تومان</span>
              <span class="period">/ ماه</span>
            </div>
          </div>
          <div class="plan-specs">
            <div class="spec-item">
              <i class="bx bx-cpu"></i>
              <span>${plan.specs.cpu} CPU</span>
            </div>
            <div class="spec-item">
              <i class="bx bx-memory-card"></i>
              <span>${plan.specs.ram} GB RAM</span>
            </div>
            <div class="spec-item">
              <i class="bx bx-hdd"></i>
              <span>${plan.specs.storage} GB Storage</span>
            </div>
            <div class="spec-item">
              <i class="bx bx-network-chart"></i>
              <span>${plan.specs.bandwidth || "نامحدود"} Bandwidth</span>
            </div>
          </div>
          <div class="plan-actions">
            <button class="btn btn-primary select-plan" data-plan-id="${
              plan.id
            }">
              انتخاب این پلن
            </button>
            <button class="btn btn-secondary compare-plan" data-plan-id="${
              plan.id
            }">
              مقایسه
            </button>
          </div>
        </div>
      `
      )
      .join("");

    this.setupEventListeners();
  }

  // Setup event listeners
  setupEventListeners() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("select-plan")) {
        const planId = e.target.dataset.planId;
        this.selectPlan(planId);
      }

      if (e.target.classList.contains("compare-plan")) {
        const planId = e.target.dataset.planId;
        this.comparePlan(planId);
      }
    });
  }

  // Select a plan
  selectPlan(planId) {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return;

    this.currentPlan = plan;

    // Store selected plan in session storage
    sessionStorage.setItem("selectedPlan", JSON.stringify(plan));

    // Show confirmation
    this.showSuccess(`پلن ${plan.nameEn || plan.name} انتخاب شد`);

    // Redirect to service configuration or cart
    setTimeout(() => {
      window.location.href = "/select-service.html";
    }, 1500);
  }

  // Compare plans
  comparePlan(planId) {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return;

    // Add to comparison list
    let comparisons = JSON.parse(
      sessionStorage.getItem("planComparisons") || "[]"
    );
    if (!comparisons.find((p) => p.id === planId)) {
      comparisons.push(plan);
      sessionStorage.setItem("planComparisons", JSON.stringify(comparisons));
      this.showSuccess(
        `پلن ${plan.nameEn || plan.name} به لیست مقایسه اضافه شد`
      );
    } else {
      this.showInfo("این پلن قبلاً در لیست مقایسه موجود است");
    }
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

// Initialize service plans manager
const servicePlansManager = new ServicePlansManager();

// Load service plans when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  servicePlansManager.loadServicePlans();
});
