const axios = require('axios');
const config = require('../config');

class RegistrarAPI {
  static async initialize() {
    try {
      const response = await axios.post(`${config.registrar.url}/auth`, {
        apiKey: config.registrar.apiKey,
        apiSecret: config.registrar.apiSecret
      });
      this.token = response.data.token;
      return true;
    } catch (error) {
      console.error('Failed to initialize registrar session:', error);
      throw new Error('Failed to connect to registrar');
    }
  }

  static async getHeaders() {
    if (!this.token) {
      await this.initialize();
    }
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  static async checkAvailability(domainName) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${config.registrar.url}/domains/check/${domainName}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to check domain availability:', error);
      throw new Error('Failed to check domain availability');
    }
  }

  static async registerDomain({ name, period, nameservers, contacts }) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${config.registrar.url}/domains/register`,
        {
          domain: name,
          period,
          nameservers,
          contacts
        },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to register domain:', error);
      throw new Error('Failed to register domain');
    }
  }

  static async updateDomain(domainName, updateData) {
    try {
      const headers = await this.getHeaders();
      await axios.put(
        `${config.registrar.url}/domains/${domainName}`,
        updateData,
        { headers }
      );
      return true;
    } catch (error) {
      console.error('Failed to update domain:', error);
      throw new Error('Failed to update domain');
    }
  }

  static async renewDomain(domainName, period) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${config.registrar.url}/domains/${domainName}/renew`,
        { period },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to renew domain:', error);
      throw new Error('Failed to renew domain');
    }
  }

  static async transferDomain(domainName, transferData) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${config.registrar.url}/domains/${domainName}/transfer`,
        transferData,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to transfer domain:', error);
      throw new Error('Failed to transfer domain');
    }
  }

  static async addDNSRecord(domainName, recordData) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${config.registrar.url}/domains/${domainName}/dns/records`,
        recordData,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to add DNS record:', error);
      throw new Error('Failed to add DNS record');
    }
  }

  static async updateDNSRecord(domainName, recordName, updateData) {
    try {
      const headers = await this.getHeaders();
      await axios.put(
        `${config.registrar.url}/domains/${domainName}/dns/records/${recordName}`,
        updateData,
        { headers }
      );
      return true;
    } catch (error) {
      console.error('Failed to update DNS record:', error);
      throw new Error('Failed to update DNS record');
    }
  }

  static async deleteDNSRecord(domainName, recordName) {
    try {
      const headers = await this.getHeaders();
      await axios.delete(
        `${config.registrar.url}/domains/${domainName}/dns/records/${recordName}`,
        { headers }
      );
      return true;
    } catch (error) {
      console.error('Failed to delete DNS record:', error);
      throw new Error('Failed to delete DNS record');
    }
  }

  static async getSuggestions(keyword) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${config.registrar.url}/domains/suggestions/${keyword}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get domain suggestions:', error);
      throw new Error('Failed to get domain suggestions');
    }
  }

  static async getPricing(tld) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${config.registrar.url}/domains/pricing/${tld}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get domain pricing:', error);
      throw new Error('Failed to get domain pricing');
    }
  }
}

module.exports = RegistrarAPI; 