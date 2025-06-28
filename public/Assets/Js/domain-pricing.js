class DomainPricingManager {
  constructor() {
    this.pricing = [];
    this.tlds = [];
    this.currentTld = null;
  }

  // Initialize the domain pricing manager
  async initialize() {
    try {
      await this.loadPricing();
      this.setupEventListeners();
      this.renderPricing();
    } catch (error) {
      console.error('Error initializing domain pricing:', error);
      this.showError('خطا در بارگذاری قیمت‌های دامنه');
    }
  }

  // Load domain pricing from backend
  async loadPricing() {
    try {
      const response = await fetch('/api/domains/pricing');
      if (!response.ok) {
        throw new Error('Failed to fetch domain pricing');
      }
      
      const data = await response.json();
      this.pricing = data.data || [];
      this.tlds = [...new Set(this.pricing.map(item => item.tld))];
    } catch (error) {
      console.error('Error loading domain pricing:', error);
      throw error;
    }
    // Fallback to static data if API fails
    if (this.pricing.length === 0) {
      this.pricing = this.getDefaultPricing();
      this.tlds = [...new Set(this.pricing.map(item => item.tld))];
    }
  }

  // Get default pricing data
  getDefaultPricing() {
    return [
      { tld: '.com', register: 500000, transfer: 400000, renew: 450000 },
      { tld: '.net', register: 600000, transfer: 500000, renew: 550000 },
      { tld: '.org', register: 550000, transfer: 450000, renew: 500000 },
      { tld: '.ir', register: 300000, transfer: 250000, renew: 280000 },
      { tld: '.co.ir', register: 200000, transfer: 150000, renew: 180000 },
      { tld: '.org.ir', register: 200000, transfer: 150000, renew: 180000 },
      { tld: '.net.ir', register: 200000, transfer: 150000, renew: 180000 },
      { tld: '.info', register: 450000, transfer: 350000, renew: 400000 },
      { tld: '.biz', register: 500000, transfer: 400000, renew: 450000 },
      { tld: '.me', register: 800000, transfer: 700000, renew: 750000 }
    ];
  }

  // Render pricing in the UI
  renderPricing() {
    const pricingContainer = document.querySelector('.domain-pricing-container');
    if (!pricingContainer) return;

    pricingContainer.innerHTML = `
      <div class="pricing-header">
        <h2>قیمت‌های دامنه</h2>
        <div class="pricing-filters">
          <select id="tld-filter" class="form-control">
            <option value="">همه پسوندها</option>
            ${this.tlds.map(tld => `<option value="${tld}">${tld}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="pricing-table">
        <table>
          <thead>
            <tr>
              <th>پسوند دامنه</th>
              <th>ثبت</th>
              <th>انتقال</th>
              <th>تمدید</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            ${this.pricing.map(item => `
              <tr data-tld="${item.tld}">
                <td><strong>${item.tld}</strong></td>
                <td>${item.register.toLocaleString()} تومان</td>
                <td>${item.transfer.toLocaleString()} تومان</td>
                <td>${item.renew.toLocaleString()} تومان</td>
                <td>
                  <button class="btn btn-sm btn-primary register-domain" data-tld="${item.tld}">
                    ثبت دامنه
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    // TLD filter
    const tldFilter = document.getElementById('tld-filter');
    if (tldFilter) {
      tldFilter.addEventListener('change', (e) => {
        this.filterByTld(e.target.value);
      });
    }

    // Register domain buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('register-domain')) {
        const tld = e.target.dataset.tld;
        this.registerDomain(tld);
      }
    });
  }

  // Filter pricing by TLD
  filterByTld(tld) {
    const rows = document.querySelectorAll('.pricing-table tbody tr');
    
    rows.forEach(row => {
      if (!tld || row.dataset.tld === tld) {
        row.style.display = 'table-row';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // Register domain
  registerDomain(tld) {
    const pricing = this.pricing.find(item => item.tld === tld);
    if (!pricing) return;

    // Store selected TLD pricing in session storage
    sessionStorage.setItem('selectedDomainPricing', JSON.stringify(pricing));
    
    // Show confirmation
    this.showSuccess(`دامنه با پسوند ${tld} برای ثبت انتخاب شد`);
    
    // Redirect to domain registration page
    setTimeout(() => {
      window.location.href = '/domain.html';
    }, 1500);
  }

  // Check domain availability
  async checkDomainAvailability(domainName) {
    try {
      const response = await fetch(`/api/domains/check/${domainName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check domain availability');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking domain availability:', error);
      throw error;
    }
  }

  // Get domain suggestions
  async getDomainSuggestions(keyword) {
    try {
      const response = await fetch(`/api/domains/suggestions/${keyword}`);
      if (!response.ok) {
        throw new Error('Failed to get domain suggestions');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting domain suggestions:', error);
      throw error;
    }
  }

  // Show success message
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  // Show error message
  showError(message) {
    this.showToast(message, 'error');
  }

  // Show info message
  showInfo(message) {
    this.showToast(message, 'info');
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const domainPricingManager = new DomainPricingManager();
  domainPricingManager.initialize();
});
