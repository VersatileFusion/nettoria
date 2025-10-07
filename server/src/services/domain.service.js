const { Domain, DNSRecord, User } = require('../models');
const { Op } = require('sequelize');
const NotificationUtil = require('../utils/notification.util');
const { calculateDomainPrice } = require('../utils/pricing');
const { registrarAPI } = require('../utils/registrar-api');

class DomainService {
  static async getUserDomains(userId) {
    return await Domain.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getDomainDetails(userId, domainId) {
    const domain = await Domain.findOne({
      where: {
        id: domainId,
        userId
      },
      include: [DNSRecord]
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    return domain;
  }

  static async registerDomain(userId, domainData) {
    const { name, registrar, registrationPeriod, autoRenew, nameservers, contacts } = domainData;

    // Check domain availability
    const availability = await this.checkDomainAvailability(name);
    if (!availability.isAvailable) {
      throw new Error('Domain is not available');
    }

    // Calculate price
    const price = calculateDomainPrice(name, registrationPeriod);

    // Check user's balance
    const user = await User.findByPk(userId);
    if (!user || user.balance < price) {
      throw new Error('Insufficient balance');
    }

    // Register domain with registrar
    const registrarResponse = await registrarAPI.registerDomain({
      name,
      period: registrationPeriod,
      nameservers,
      contacts
    });

    // Create domain record
    const domain = await Domain.create({
      userId,
      name,
      registrar,
      registrationPeriod,
      autoRenew,
      nameservers: nameservers || [],
      contacts: contacts || {},
      status: 'active',
      expiryDate: new Date(Date.now() + registrationPeriod * 365 * 24 * 60 * 60 * 1000),
      price
    });

    // Deduct balance
    await user.update({
      balance: user.balance - price
    });

    // Create notification
    await NotificationUtil.sendNotification({
      userId,
      type: 'domain_registered',
      title: 'Domain Registered',
      message: `Your domain "${name}" has been registered successfully`,
      data: { domainId: domain.id }
    });

    return domain;
  }

  static async updateDomain(userId, domainId, updateData) {
    const domain = await Domain.findOne({
      where: {
        id: domainId,
        userId
      }
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    // Update domain with registrar
    await registrarAPI.updateDomain(domain.name, updateData);

    // Update domain record
    await domain.update(updateData);

    return domain;
  }

  static async renewDomain(userId, domainId, period) {
    const domain = await Domain.findOne({
      where: {
        id: domainId,
        userId
      }
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    // Calculate renewal price
    const price = calculateDomainPrice(domain.name, period);

    // Check user's balance
    const user = await User.findByPk(userId);
    if (!user || user.balance < price) {
      throw new Error('Insufficient balance');
    }

    // Renew domain with registrar
    await registrarAPI.renewDomain(domain.name, period);

    // Update domain record
    const newExpiryDate = new Date(domain.expiryDate.getTime() + period * 365 * 24 * 60 * 60 * 1000);
    await domain.update({
      expiryDate: newExpiryDate,
      registrationPeriod: domain.registrationPeriod + period
    });

    // Deduct balance
    await user.update({
      balance: user.balance - price
    });

    // Create notification
    await NotificationUtil.sendNotification({
      userId,
      type: 'domain_renewed',
      title: 'Domain Renewed',
      message: `Your domain "${domain.name}" has been renewed for ${period} year(s)`,
      data: { domainId: domain.id }
    });

    return domain;
  }

  static async transferDomain(userId, domainId, transferData) {
    const domain = await Domain.findOne({
      where: {
        id: domainId,
        userId
      }
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    // Initiate transfer with registrar
    await registrarAPI.transferDomain(domain.name, transferData);

    // Update domain record
    await domain.update({
      status: 'transfer_pending',
      newRegistrar: transferData.newRegistrar
    });

    // Create notification
    await NotificationUtil.sendNotification({
      userId,
      type: 'domain_transfer',
      title: 'Domain Transfer Initiated',
      message: `Transfer of domain "${domain.name}" has been initiated`,
      data: { domainId: domain.id }
    });

    return domain;
  }

  static async getDNSRecords(userId, domainId) {
    const domain = await Domain.findOne({
      where: {
        id: domainId,
        userId
      }
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    return await DNSRecord.findAll({
      where: { domainId },
      order: [['type', 'ASC'], ['name', 'ASC']]
    });
  }

  static async addDNSRecord(userId, domainId, recordData) {
    const domain = await Domain.findOne({
      where: {
        id: domainId,
        userId
      }
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    // Add DNS record with registrar
    await registrarAPI.addDNSRecord(domain.name, recordData);

    // Create DNS record
    const record = await DNSRecord.create({
      domainId,
      ...recordData
    });

    return record;
  }

  static async updateDNSRecord(userId, domainId, recordId, updateData) {
    const domain = await Domain.findOne({
      where: {
        id: domainId,
        userId
      }
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    const record = await DNSRecord.findOne({
      where: {
        id: recordId,
        domainId
      }
    });

    if (!record) {
      throw new Error('DNS record not found');
    }

    // Update DNS record with registrar
    await registrarAPI.updateDNSRecord(domain.name, record.name, updateData);

    // Update DNS record
    await record.update(updateData);

    return record;
  }

  static async deleteDNSRecord(userId, domainId, recordId) {
    const domain = await Domain.findOne({
      where: {
        id: domainId,
        userId
      }
    });

    if (!domain) {
      throw new Error('Domain not found');
    }

    const record = await DNSRecord.findOne({
      where: {
        id: recordId,
        domainId
      }
    });

    if (!record) {
      throw new Error('DNS record not found');
    }

    // Delete DNS record with registrar
    await registrarAPI.deleteDNSRecord(domain.name, record.name);

    // Delete DNS record
    await record.destroy();
  }

  static async checkDomainAvailability(domainName) {
    const availability = await registrarAPI.checkAvailability(domainName);
    const price = calculateDomainPrice(domainName, 1);
    return { ...availability, price };
  }

  static async getDomainSuggestions(keyword) {
    const suggestions = await registrarAPI.getSuggestions(keyword);
    return suggestions.map(suggestion => ({
      ...suggestion,
      price: calculateDomainPrice(suggestion.name, 1)
    }));
  }

  static async getDomainPricing(tld) {
    return await registrarAPI.getPricing(tld);
  }
}

module.exports = DomainService;
