const axios = require('axios');
const logger = require('./logger');

/**
 * SMS Provider utility for sending SMS messages
 */
class SMSProvider {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.lineNumber = process.env.SMS_LINE_NUMBER;
    this.baseURL = 'https://api.sms.ir/v1';
  }

  /**
   * Send SMS message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - SMS message content
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Result object
   */
  async sendSMS(phoneNumber, message, options = {}) {
    try {
      if (!this.apiKey) {
        logger.warn('SMS API key not configured');
        return {
          success: false,
          error: 'SMS service not configured'
        };
      }

      const payload = {
        mobile: phoneNumber,
        message: message,
        lineNumber: this.lineNumber || options.lineNumber
      };

      const response = await axios.post(`${this.baseURL}/send/verify`, payload, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      logger.info(`SMS sent successfully to ${phoneNumber}`);
      return {
        success: true,
        messageId: response.data.messageId,
        data: response.data
      };

    } catch (error) {
      logger.error('SMS sending failed:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Send verification code SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} code - Verification code
   * @returns {Promise<Object>} - Result object
   */
  async sendVerificationCode(phoneNumber, code) {
    const message = `کد تایید شما: ${code}\nاین کد تا 5 دقیقه معتبر است.`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send notification SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} title - Notification title
   * @param {string} content - Notification content
   * @returns {Promise<Object>} - Result object
   */
  async sendNotification(phoneNumber, title, content) {
    const message = `${title}\n${content}`;
    return this.sendSMS(phoneNumber, message);
  }
}

// Create singleton instance
const smsProvider = new SMSProvider();

// Export individual functions for backward compatibility
module.exports = {
  sendSMS: (phoneNumber, message, options) => smsProvider.sendSMS(phoneNumber, message, options),
  sendVerificationCode: (phoneNumber, code) => smsProvider.sendVerificationCode(phoneNumber, code),
  sendNotification: (phoneNumber, title, content) => smsProvider.sendNotification(phoneNumber, title, content),
  SMSProvider
};
