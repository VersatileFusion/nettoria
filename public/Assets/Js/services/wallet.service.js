import AuthService from './auth.service.js';

class WalletService {
  constructor() {
    this.baseUrl = '/api/wallet';
  }

  // Get authentication headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AuthService.getToken()}`
    };
  }

  // Get wallet balance
  async getWalletBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch wallet balance');
      }

      return data.data?.balance;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  // Get wallet transactions
  async getWalletTransactions(page = 1, limit = 20, type = null) {
    try {
      let url = `${this.baseUrl}/transactions`;
      const params = new URLSearchParams();
      
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (type) params.append('type', type);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch transactions');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
  }

  // Add funds to wallet
  async addFunds(amount, method, paymentData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/deposit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount,
          method,
          ...paymentData
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to add funds');
      }

      return data.data;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  }

  // Withdraw funds from wallet
  async withdrawFunds(amount, method, withdrawalData = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/withdraw`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount,
          method,
          ...withdrawalData
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to withdraw funds');
      }

      return data.data;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }

  // Get withdrawal history
  async getWithdrawalHistory(page = 1, limit = 20, status = null) {
    try {
      let url = '/api/withdrawals';
      const params = new URLSearchParams();
      
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (status) params.append('status', status);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch withdrawal history');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch payment methods');
      }

      return data.data?.paymentMethods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Add payment method
  async addPaymentMethod(paymentMethodData) {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentMethodData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to add payment method');
      }

      return data.data?.paymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId) {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to remove payment method');
      }

      return data;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Get wallet statistics
  async getWalletStatistics(period = 'month') {
    try {
      const response = await fetch(`${this.baseUrl}/statistics?period=${period}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch wallet statistics');
      }

      return data.data?.statistics;
    } catch (error) {
      console.error('Error fetching wallet statistics:', error);
      throw error;
    }
  }

  // Get invoice history
  async getInvoiceHistory(page = 1, limit = 20, status = null) {
    try {
      let url = '/api/invoices';
      const params = new URLSearchParams();
      
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (status) params.append('status', status);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch invoice history');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching invoice history:', error);
      throw error;
    }
  }

  // Get invoice details
  async getInvoiceDetails(invoiceId) {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch invoice details');
      }

      return data.data?.invoice;
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      throw error;
    }
  }

  // Pay invoice
  async payInvoice(invoiceId, paymentMethodId) {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ paymentMethodId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to pay invoice');
      }

      return data.data;
    } catch (error) {
      console.error('Error paying invoice:', error);
      throw error;
    }
  }

  // Get discount codes
  async getDiscountCodes() {
    try {
      const response = await fetch(`${this.baseUrl}/discount-codes`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to fetch discount codes');
      }

      return data.data?.discountCodes || [];
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      throw error;
    }
  }

  // Validate discount code
  async validateDiscountCode(code, amount) {
    try {
      const response = await fetch(`${this.baseUrl}/discount-codes/validate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ code, amount }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to validate discount code');
      }

      return data.data?.discount;
    } catch (error) {
      console.error('Error validating discount code:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const walletService = new WalletService();

export default walletService; 