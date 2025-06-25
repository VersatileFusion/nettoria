const apiClient = new ApiClient();
async function loadServicePlans() {
  try {
    const res = await apiClient.get("/services/plans");
    const container = document.getElementById("service-plans");
    if (!container) return;
    container.innerHTML = res.data.plans
      .map(
        (plan) => `
      <div class="plan">
        <strong>${plan.nameEn || plan.name}</strong>: ${plan.specs.cpu} CPU, ${
          plan.specs.ram
        }GB RAM, ${plan.specs.storage}GB Storage, ${
          plan.pricing.monthly
        } per month
      </div>
    `
      )
      .join("");
  } catch (e) {
    console.error("Failed to load service plans", e);
  }
}
document.addEventListener("DOMContentLoaded", loadServicePlans);
