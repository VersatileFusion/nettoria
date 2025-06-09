// API Service for handling all backend communications
class ApiService {
  constructor() {
    this.baseUrl = "/api";
    this.token = localStorage.getItem("token");
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "An error occurred");
    }
    return data;
  }

  // Authentication APIs
  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse(response);
    this.setToken(data.token);
    return data;
  }

  async register(email, password, name) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    const data = await this.handleResponse(response);
    this.setToken(data.token);
    return data;
  }

  async forgotPassword(email) {
    const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  async resetPassword(token, password) {
    const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ token, password }),
    });
    return this.handleResponse(response);
  }

  // Cart APIs
  async getCart() {
    const response = await fetch(`${this.baseUrl}/cart`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async addToCart(serviceId, quantity) {
    const response = await fetch(`${this.baseUrl}/cart/add`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ serviceId, quantity }),
    });
    return this.handleResponse(response);
  }

  async updateCartItem(itemId, quantity) {
    const response = await fetch(`${this.baseUrl}/cart/update/${itemId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return this.handleResponse(response);
  }

  async removeFromCart(itemId) {
    const response = await fetch(`${this.baseUrl}/cart/remove/${itemId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Withdrawal APIs
  async getWithdrawalHistory(page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/withdrawals/history?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async requestWithdrawal(amount, paymentMethod, accountDetails) {
    const response = await fetch(`${this.baseUrl}/withdrawals/request`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, paymentMethod, accountDetails }),
    });
    return this.handleResponse(response);
  }

  // Service Management APIs
  async getServices() {
    const response = await fetch(`${this.baseUrl}/services`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getServiceDetails(serviceId) {
    const response = await fetch(`${this.baseUrl}/services/${serviceId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Ticket System APIs
  async getTickets(page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/tickets?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async createTicket(subject, message, priority) {
    const response = await fetch(`${this.baseUrl}/tickets`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ subject, message, priority }),
    });
    return this.handleResponse(response);
  }

  // Blog System APIs
  async getBlogs(page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/blogs?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async getBlogPost(postId) {
    const response = await fetch(`${this.baseUrl}/blogs/${postId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getBlogComments(postId, page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/blogs/${postId}/comments?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async addBlogComment(postId, content, parentId = null) {
    const response = await fetch(`${this.baseUrl}/blogs/${postId}/comments`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ content, parentId }),
    });
    return this.handleResponse(response);
  }

  // Payment System APIs
  async getPaymentMethods() {
    const response = await fetch(`${this.baseUrl}/payments/methods`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async processPayment(amount, method, details) {
    const response = await fetch(`${this.baseUrl}/payments/process`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, method, details }),
    });
    return this.handleResponse(response);
  }

  // Wallet APIs
  async getWalletBalance() {
    const response = await fetch(`${this.baseUrl}/wallet/balance`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getTransactionHistory(page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/wallet/transactions?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // SMS Management APIs
  async getSmsHistory(page = 1, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/sms/history?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async sendSms(recipient, message) {
    const response = await fetch(`${this.baseUrl}/sms/send`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ recipient, message }),
    });
    return this.handleResponse(response);
  }

  // Contact Methods
  async submitContactForm(data) {
    const response = await fetch(`${this.baseUrl}/contact`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async sendSMS(recipient, message) {
    try {
      const response = await fetch(`${this.baseUrl}/sms/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ recipient, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send SMS");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw error;
    }
  }

  async getSMSHistory(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/sms/history?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch SMS history");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching SMS history:", error);
      throw error;
    }
  }

  /**
   * Check domain availability
   * @param {string} name - Domain name to check
   * @returns {Promise<Object>} - Domain availability status
   */
  async checkDomainAvailability(name) {
    try {
      const response = await fetch(`${this.baseUrl}/domains/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Error checking domain availability");
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking domain availability:", error);
      throw error;
    }
  }

  /**
   * Get user's domains
   * @param {number} page - Page number
   * @param {number} limit - Number of items per page
   * @returns {Promise<Object>} - List of domains
   */
  async getDomains(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/domains?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching domains");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching domains:", error);
      throw error;
    }
  }

  /**
   * Register a new domain
   * @param {string} name - Domain name
   * @param {number} period - Registration period in years
   * @returns {Promise<Object>} - Registration result
   */
  async registerDomain(name, period) {
    try {
      const response = await fetch(`${this.baseUrl}/domains/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ name, period }),
      });

      if (!response.ok) {
        throw new Error("Error registering domain");
      }

      return await response.json();
    } catch (error) {
      console.error("Error registering domain:", error);
      throw error;
    }
  }

  /**
   * Transfer a domain
   * @param {string} name - Domain name
   * @param {string} authCode - Authorization code
   * @returns {Promise<Object>} - Transfer result
   */
  async transferDomain(name, authCode) {
    try {
      const response = await fetch(`${this.baseUrl}/domains/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ name, authCode }),
      });

      if (!response.ok) {
        throw new Error("Error transferring domain");
      }

      return await response.json();
    } catch (error) {
      console.error("Error transferring domain:", error);
      throw error;
    }
  }

  /**
   * Get DNS records for a domain
   * @param {string} domainId - Domain ID
   * @returns {Promise<Object>} - List of DNS records
   */
  async getDNSRecords(domainId) {
    try {
      const response = await fetch(`${this.baseUrl}/domains/${domainId}/dns`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching DNS records");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching DNS records:", error);
      throw error;
    }
  }

  /**
   * Add DNS record
   * @param {string} domainId - Domain ID
   * @param {Object} record - DNS record details
   * @returns {Promise<Object>} - Added record
   */
  async addDNSRecord(domainId, record) {
    try {
      const response = await fetch(`${this.baseUrl}/domains/${domainId}/dns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error("Error adding DNS record");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding DNS record:", error);
      throw error;
    }
  }

  /**
   * Delete DNS record
   * @param {string} recordId - DNS record ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteDNSRecord(recordId) {
    try {
      const response = await fetch(`${this.baseUrl}/domains/dns/${recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error deleting DNS record");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting DNS record:", error);
      throw error;
    }
  }

  /**
   * Get VPN configuration
   * @returns {Promise<Object>} - VPN configuration
   */
  async getVPNConfig() {
    try {
      const response = await fetch(`${this.baseUrl}/vpn/config`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching VPN configuration");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching VPN configuration:", error);
      throw error;
    }
  }

  /**
   * Get VPN connection status
   * @returns {Promise<Object>} - VPN status
   */
  async getVPNStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/vpn/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching VPN status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching VPN status:", error);
      throw error;
    }
  }

  /**
   * Connect to VPN
   * @returns {Promise<Object>} - Connection result
   */
  async connectVPN() {
    try {
      const response = await fetch(`${this.baseUrl}/vpn/connect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error connecting to VPN");
      }

      return await response.json();
    } catch (error) {
      console.error("Error connecting to VPN:", error);
      throw error;
    }
  }

  /**
   * Disconnect from VPN
   * @returns {Promise<Object>} - Disconnection result
   */
  async disconnectVPN() {
    try {
      const response = await fetch(`${this.baseUrl}/vpn/disconnect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error disconnecting from VPN");
      }

      return await response.json();
    } catch (error) {
      console.error("Error disconnecting from VPN:", error);
      throw error;
    }
  }

  /**
   * Get available VPN servers
   * @returns {Promise<Object>} - List of servers
   */
  async getVPNServers() {
    try {
      const response = await fetch(`${this.baseUrl}/vpn/servers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching VPN servers");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching VPN servers:", error);
      throw error;
    }
  }

  /**
   * Get VPN usage statistics
   * @returns {Promise<Object>} - Usage statistics
   */
  async getVPNUsage() {
    try {
      const response = await fetch(`${this.baseUrl}/vpn/usage`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error fetching VPN usage");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching VPN usage:", error);
      throw error;
    }
  }
}

// Create a global instance
const apiService = new ApiService();
