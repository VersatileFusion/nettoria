const axios = require("axios");
const { SMS, SMSTemplate, User, SMSCategory } = require("../models");
const logger = require("../utils/logger");
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notifications');
const { sendSMS } = require('../utils/sms-provider');
const { RateLimiter } = require('../utils/rate-limiter');

// SMS service configuration
const SMS_SERVICE_CONFIG = {
  apiKey: process.env.SMS_SERVICE_API_KEY,
  apiUrl: process.env.SMS_SERVICE_API_URL,
  sender: process.env.SMS_SENDER_ID,
};

class SMSService {
  static async sendSMS(userId, phoneNumber, message, templateId = null) {
    // Check rate limits
    const rateLimiter = new RateLimiter(userId, 'sms');
    await rateLimiter.checkLimit();

    // Get user's SMS credits
    const user = await User.findByPk(userId);
    if (!user || user.smsCredits <= 0) {
      throw new Error('Insufficient SMS credits');
    }

    let finalMessage = message;
    let template = null;

    // If template is provided, use it
    if (templateId) {
      template = await SMSTemplate.findByPk(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Replace template variables
      finalMessage = this.replaceTemplateVariables(template.content, message);
    }

    // Send SMS
    const smsResult = await sendSMS(phoneNumber, finalMessage);

    // Create SMS record
    const sms = await SMS.create({
      userId,
      phoneNumber,
      message: finalMessage,
      templateId,
      status: smsResult.status,
      messageId: smsResult.messageId,
      cost: smsResult.cost
    });

    // Deduct credits from user
    await user.update({
      smsCredits: user.smsCredits - smsResult.cost
    });

    // Update template usage if used
    if (template) {
      await template.increment('usageCount');
    }

    return sms;
  }

  static async sendBulkSMS(userId, phoneNumbers, message, templateId = null) {
    // Check rate limits for bulk sending
    const rateLimiter = new RateLimiter(userId, 'bulk-sms');
    await rateLimiter.checkLimit();

    // Get user's SMS credits
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate total cost
    const costPerSMS = 1; // This should be configurable
    const totalCost = phoneNumbers.length * costPerSMS;

    if (user.smsCredits < totalCost) {
      throw new Error('Insufficient SMS credits');
    }

    let template = null;
    if (templateId) {
      template = await SMSTemplate.findByPk(templateId);
      if (!template) {
        throw new Error('Template not found');
      }
    }

    // Send SMS to each number
    const results = [];
    for (const phoneNumber of phoneNumbers) {
      try {
        let finalMessage = message;
        if (template) {
          finalMessage = this.replaceTemplateVariables(template.content, message);
        }

        const smsResult = await sendSMS(phoneNumber, finalMessage);

        const sms = await SMS.create({
          userId,
          phoneNumber,
          message: finalMessage,
          templateId,
          status: smsResult.status,
          messageId: smsResult.messageId,
          cost: smsResult.cost
        });

        results.push(sms);
      } catch (error) {
        results.push({
          phoneNumber,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update user's credits
    await user.update({
      smsCredits: user.smsCredits - totalCost
    });

    // Update template usage if used
    if (template) {
      await template.increment('usageCount', { by: phoneNumbers.length });
    }

    return {
      totalSent: results.filter(r => r.status === 'sent').length,
      totalFailed: results.filter(r => r.status === 'failed').length,
      results
    };
  }

  static async getHistory(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows: sms } = await SMS.findAndCountAll({
      where: { userId },
      include: [
        {
          model: SMSTemplate,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      sms,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getStatus(userId, smsId) {
    const sms = await SMS.findOne({
      where: {
        id: smsId,
        userId
      },
      include: [
        {
          model: SMSTemplate,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!sms) {
      throw new Error('SMS not found');
    }

    // If status is pending, check with provider
    if (sms.status === 'pending') {
      const status = await this.checkDeliveryStatus(sms.messageId);
      await sms.update({ status });
    }

    return sms;
  }

  static async getTemplates(userId) {
    return await SMSTemplate.findAll({
      where: {
        [Op.or]: [
          { userId },
          { isPublic: true }
        ]
      },
      include: [
        {
          model: SMSCategory,
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });
  }

  static async createTemplate(templateData) {
    const { name, content, variables, category } = templateData;

    // Validate template content
    this.validateTemplateContent(content, variables);

    // Get or create category
    let categoryId = null;
    if (category) {
      const [cat] = await SMSCategory.findOrCreate({
        where: { name: category },
        defaults: { name: category }
      });
      categoryId = cat.id;
    }

    return await SMSTemplate.create({
      name,
      content,
      variables,
      categoryId,
      usageCount: 0
    });
  }

  static async updateTemplate(templateId, updateData) {
    const template = await SMSTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Validate template content if being updated
    if (updateData.content) {
      this.validateTemplateContent(updateData.content, updateData.variables || template.variables);
    }

    // Update category if provided
    if (updateData.category) {
      const [category] = await SMSCategory.findOrCreate({
        where: { name: updateData.category },
        defaults: { name: updateData.category }
      });
      updateData.categoryId = category.id;
      delete updateData.category;
    }

    await template.update(updateData);
    return template;
  }

  static async deleteTemplate(templateId) {
    const template = await SMSTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    await template.destroy();
  }

  static async getCategories() {
    return await SMSCategory.findAll({
      attributes: ['id', 'name', 'templateCount'],
      order: [['name', 'ASC']]
    });
  }

  static async getStatistics(userId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSent,
      totalFailed,
      monthlySent,
      monthlyFailed,
      totalCost,
      monthlyCost
    ] = await Promise.all([
      SMS.count({ where: { userId, status: 'sent' } }),
      SMS.count({ where: { userId, status: 'failed' } }),
      SMS.count({
        where: {
          userId,
          status: 'sent',
          createdAt: { [Op.gte]: startOfMonth }
        }
      }),
      SMS.count({
        where: {
          userId,
          status: 'failed',
          createdAt: { [Op.gte]: startOfMonth }
        }
      }),
      SMS.sum('cost', { where: { userId } }),
      SMS.sum('cost', {
        where: {
          userId,
          createdAt: { [Op.gte]: startOfMonth }
        }
      })
    ]);

    return {
      totalSent,
      totalFailed,
      monthlySent,
      monthlyFailed,
      totalCost: totalCost || 0,
      monthlyCost: monthlyCost || 0,
      successRate: totalSent / (totalSent + totalFailed) * 100
    };
  }

  static replaceTemplateVariables(template, variables) {
    let message = template;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return message;
  }

  static validateTemplateContent(content, variables) {
    if (!variables) return;

    // Check if all variables in content are defined
    const variableRegex = /{{([^}]+)}}/g;
    const matches = content.match(variableRegex) || [];
    const usedVariables = matches.map(m => m.slice(2, -2));

    const undefinedVariables = usedVariables.filter(v => !variables.includes(v));
    if (undefinedVariables.length > 0) {
      throw new Error(`Undefined variables in template: ${undefinedVariables.join(', ')}`);
    }
  }

  static async checkDeliveryStatus(messageId) {
    // Implement SMS provider's status check
    // This is a placeholder - implement actual provider integration
    return 'delivered';
  }
}

module.exports = SMSService;
