import AuthService from './auth.service.js';
import vmService from './vm.service.js';
import serviceService from './service.service.js';
import walletService from './wallet.service.js';

class DashboardService {
  constructor() {
    this.baseUrl = '/api';
  }

  // Get authentication headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AuthService.getToken()}`
    };
  }

  // Get user dashboard summary
  async getDashboardSummary() {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/summary`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch dashboard summary');
      }

      return data.data?.summary;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      // Fallback to individual API calls
      return this.getFallbackDashboardSummary();
    }
  }

  // Fallback method to get dashboard data from individual services
  async getFallbackDashboardSummary() {
    try {
      const [vms, walletBalance, orders] = await Promise.all([
        vmService.getUserVMs().catch(() => []),
        walletService.getWalletBalance().catch(() => 0),
        serviceService.getUserOrders().catch(() => ({ items: [], pagination: { total: 0 } }))
      ]);

      return {
        vms: vms.length,
        walletBalance,
        totalOrders: orders.pagination?.total || 0,
        activeServices: orders.items?.filter(order => order.status === 'active').length || 0
      };
    } catch (error) {
      console.error('Error getting fallback dashboard summary:', error);
      return {
        vms: 0,
        walletBalance: 0,
        totalOrders: 0,
        activeServices: 0
      };
    }
  }

  // Get user services by category
  async getUserServicesByCategory() {
    try {
      const [domains, hosts, vps, cloudServers, vpns] = await Promise.all([
        this.getUserDomains(),
        this.getUserHosts(),
        this.getUserVPS(),
        this.getUserCloudServers(),
        this.getUserVPNs()
      ]);

      return {
        domains,
        hosts,
        vps,
        cloudServers,
        vpns
      };
    } catch (error) {
      console.error('Error fetching user services by category:', error);
      return {
        domains: [],
        hosts: [],
        vps: [],
        cloudServers: [],
        vpns: []
      };
    }
  }

  // Get user domains
  async getUserDomains() {
    try {
      const response = await fetch(`${this.baseUrl}/domains`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch domains');
      }

      return data.data?.domains || [];
    } catch (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
  }

  // Get user hosts
  async getUserHosts() {
    try {
      const response = await fetch(`${this.baseUrl}/cloud-host`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch hosts');
      }

      return data.data?.hosts || [];
    } catch (error) {
      console.error('Error fetching hosts:', error);
      return [];
    }
  }

  // Get user VPS
  async getUserVPS() {
    try {
      return await vmService.getUserVMs();
    } catch (error) {
      console.error('Error fetching VPS:', error);
      return [];
    }
  }

  // Get user cloud servers
  async getUserCloudServers() {
    try {
      const response = await fetch(`${this.baseUrl}/cloud-server`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch cloud servers');
      }

      return data.data?.cloudServers || [];
    } catch (error) {
      console.error('Error fetching cloud servers:', error);
      return [];
    }
  }

  // Get user VPNs
  async getUserVPNs() {
    try {
      const response = await fetch(`${this.baseUrl}/vpn`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch VPNs');
      }

      return data.data?.vpns || [];
    } catch (error) {
      console.error('Error fetching VPNs:', error);
      return [];
    }
  }

  // Get recent activity
  async getRecentActivity(limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/activity?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch recent activity');
      }

      return data.data?.activities || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Get system status
  async getSystemStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch system status');
      }

      return data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      return { status: 'unknown' };
    }
  }

  // Get notifications
  async getNotifications(unreadOnly = false) {
    try {
      let url = `${this.baseUrl}/notifications`;
      if (unreadOnly) {
        url += '?unread=true';
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch notifications');
      }

      return data.data?.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to mark notification as read');
      }

      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics(period = 'month') {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/statistics?period=${period}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch user statistics');
      }

      return data.data?.statistics;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return null;
    }
  }

  // Update dashboard display
  updateDashboardDisplay(summary, services) {
    // Update service counts
    this.updateServiceCounts(services);
    
    // Update wallet balance
    this.updateWalletBalance(summary.walletBalance);
    
    // Update recent activity
    this.updateRecentActivity();
    
    // Update system status
    this.updateSystemStatus();
  }

  // Update service counts in the UI
  updateServiceCounts(services) {
    // Update domain count
    const domainCount = document.querySelector('[data-category="domain"] .service-count');
    if (domainCount) {
      domainCount.textContent = `${services.domains.length} عدد`;
    }

    // Update host count
    const hostCount = document.querySelector('[data-category="host"] .service-count');
    if (hostCount) {
      hostCount.textContent = `${services.hosts.length} عدد`;
    }

    // Update VPS count
    const vpsCount = document.querySelector('[data-category="vps"] .service-count');
    if (vpsCount) {
      vpsCount.textContent = `${services.vps.length} عدد`;
    }

    // Update cloud server count
    const cloudCount = document.querySelector('[data-category="cloud"] .service-count');
    if (cloudCount) {
      cloudCount.textContent = `${services.cloudServers.length} عدد`;
    }

    // Update VPN count
    const vpnCount = document.querySelector('[data-category="vpn"] .service-count');
    if (vpnCount) {
      vpnCount.textContent = `${services.vpns.length} عدد`;
    }
  }

  // Update wallet balance in the UI
  updateWalletBalance(balance) {
    const walletElements = document.querySelectorAll('[data-wallet-balance]');
    walletElements.forEach(element => {
      element.textContent = `${balance.toLocaleString()} تومان`;
    });
  }

  // Update recent activity in the UI
  async updateRecentActivity() {
    try {
      const activities = await this.getRecentActivity(5);
      const activityContainer = document.getElementById('recent-activity');
      
      if (activityContainer && activities.length > 0) {
        activityContainer.innerHTML = activities.map(activity => `
          <div class="activity-item">
            <i class="bx ${this.getActivityIcon(activity.type)}"></i>
            <div class="activity-content">
              <p>${activity.description}</p>
              <small>${new Date(activity.createdAt).toLocaleString('fa-IR')}</small>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Error updating recent activity:', error);
    }
  }

  // Update system status in the UI
  async updateSystemStatus() {
    try {
      const status = await this.getSystemStatus();
      const statusElement = document.getElementById('system-status');
      
      if (statusElement) {
        const statusClass = status.status === 'ok' ? 'status-ok' : 'status-error';
        statusElement.className = `system-status ${statusClass}`;
        statusElement.textContent = status.status === 'ok' ? 'سیستم فعال' : 'مشکل در سیستم';
      }
    } catch (error) {
      console.error('Error updating system status:', error);
    }
  }

  // Get activity icon based on type
  getActivityIcon(type) {
    const iconMap = {
      'vm_created': 'bx-server',
      'vm_powered_on': 'bx-power-off',
      'vm_powered_off': 'bx-stop-circle',
      'order_created': 'bx-cart',
      'payment_received': 'bx-wallet',
      'ticket_created': 'bx-support',
      'default': 'bx-info-circle'
    };
    
    return iconMap[type] || iconMap.default;
  }
}

// Create and export a singleton instance
const dashboardService = new DashboardService();

export default dashboardService; 