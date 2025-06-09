const axios = require("axios");
const config = require("../config");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

class DomainService {
  constructor() {
    this.registrarApi = axios.create({
      baseURL: config.domainRegistrar.apiUrl,
      headers: {
        Authorization: `Bearer ${config.domainRegistrar.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Check domain availability
   * @param {string} domain - Domain name to check
   * @returns {Promise<boolean>} - Whether the domain is available
   */
  async checkAvailability(domain) {
    try {
      const response = await this.registrarApi.post("/check", { domain });
      return response.data.available;
    } catch (error) {
      logger.error("Error checking domain availability:", error);
      throw new ApiError("Failed to check domain availability", 500);
    }
  }

  /**
   * Register a new domain
   * @param {string} domain - Domain name to register
   * @param {number} period - Registration period in years
   * @param {Object} registrant - Registrant information
   * @returns {Promise<Object>} - Registration result
   */
  async registerDomain(domain, period, registrant) {
    try {
      const response = await this.registrarApi.post("/register", {
        domain,
        period,
        registrant: {
          name: registrant.name,
          email: registrant.email,
          phone: registrant.phone,
          address: registrant.address,
          city: registrant.city,
          state: registrant.state,
          country: registrant.country,
          postalCode: registrant.postalCode,
        },
      });

      return {
        expiryDate: response.data.expiryDate,
        registrationId: response.data.registrationId,
      };
    } catch (error) {
      logger.error("Error registering domain:", error);
      throw new ApiError("Failed to register domain", 500);
    }
  }

  /**
   * Renew domain registration
   * @param {string} domain - Domain name to renew
   * @param {number} period - Renewal period in years
   * @returns {Promise<Object>} - Renewal result
   */
  async renewDomain(domain, period) {
    try {
      const response = await this.registrarApi.post("/renew", {
        domain,
        period,
      });

      return {
        expiryDate: response.data.expiryDate,
        renewalId: response.data.renewalId,
      };
    } catch (error) {
      logger.error("Error renewing domain:", error);
      throw new ApiError("Failed to renew domain", 500);
    }
  }

  /**
   * Transfer domain to another registrar
   * @param {string} domain - Domain name to transfer
   * @param {string} transferCode - Transfer authorization code
   * @param {string} newRegistrar - New registrar information
   * @returns {Promise<Object>} - Transfer result
   */
  async transferDomain(domain, transferCode, newRegistrar) {
    try {
      const response = await this.registrarApi.post("/transfer", {
        domain,
        transferCode,
        newRegistrar,
      });

      return {
        transferId: response.data.transferId,
        status: response.data.status,
      };
    } catch (error) {
      logger.error("Error transferring domain:", error);
      throw new ApiError("Failed to transfer domain", 500);
    }
  }

  /**
   * Add DNS record
   * @param {string} domain - Domain name
   * @param {Object} record - DNS record information
   * @returns {Promise<Object>} - DNS record result
   */
  async addDNSRecord(domain, record) {
    try {
      const response = await this.registrarApi.post(
        `/dns/${domain}/records`,
        record
      );
      return response.data;
    } catch (error) {
      logger.error("Error adding DNS record:", error);
      throw new ApiError("Failed to add DNS record", 500);
    }
  }

  /**
   * Delete DNS record
   * @param {string} domain - Domain name
   * @param {Object} record - DNS record to delete
   * @returns {Promise<void>}
   */
  async deleteDNSRecord(domain, record) {
    try {
      await this.registrarApi.delete(`/dns/${domain}/records/${record.id}`);
    } catch (error) {
      logger.error("Error deleting DNS record:", error);
      throw new ApiError("Failed to delete DNS record", 500);
    }
  }

  /**
   * Get domain pricing
   * @param {string} domain - Domain name
   * @returns {Promise<Object>} - Pricing information
   */
  async getDomainPricing(domain) {
    try {
      const response = await this.registrarApi.get(`/pricing/${domain}`);
      return response.data;
    } catch (error) {
      logger.error("Error getting domain pricing:", error);
      throw new ApiError("Failed to get domain pricing", 500);
    }
  }

  /**
   * Get domain status
   * @param {string} domain - Domain name
   * @returns {Promise<Object>} - Domain status information
   */
  async getDomainStatus(domain) {
    try {
      const response = await this.registrarApi.get(`/status/${domain}`);
      return response.data;
    } catch (error) {
      logger.error("Error getting domain status:", error);
      throw new ApiError("Failed to get domain status", 500);
    }
  }
}

module.exports = new DomainService();
