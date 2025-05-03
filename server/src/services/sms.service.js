const { Smsir } = require('smsir-js');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * SMS Service for sending text messages and verification codes
 */
class SmsService {
  constructor() {
    // Initialize SMS client with API key and line number from config
    // Make sure the line number is correct - use format without country code (3000211985)
    const lineNumber = config.SMS_LINE_NUMBER;
    logger.info(`Initializing SMS service with line number: ${lineNumber}`);
    
    this.smsClient = new Smsir(
      config.SMS_API_KEY,
      lineNumber
    );
  }

  /**
   * Send verification code to user's phone
   * @param {string} mobile - User's mobile number
   * @param {string} code - Verification code to send
   * @returns {Promise<object>} - Response from SMS service
   */
  async sendVerificationCode(mobile, code) {
    try {
      // Template parameters for verification code
      const parameters = [
        { name: 'CODE', value: code }
      ];

      // Send verification code using the predefined template
      const response = await this.smsClient.SendVerifyCode(
        mobile,
        config.SMS_VERIFICATION_TEMPLATE_ID,
        parameters
      );

      logger.info(`Verification SMS sent to ${mobile}`);
      return {
        success: true,
        messageId: response.data?.data?.messageId,
        message: 'Verification code sent successfully'
      };
    } catch (error) {
      logger.error('Error sending verification SMS:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification code'
      };
    }
  }

  /**
   * Send a custom text message to a user
   * @param {string} mobile - User's mobile number
   * @param {string} message - Message content
   * @returns {Promise<object>} - Response from SMS service
   */
  async sendSms(mobile, message) {
    try {
      // Send a single SMS to one recipient
      const response = await this.smsClient.SendBulk(
        message,
        [mobile],
        null,  // SendDateTime (null for immediate sending)
        config.SMS_LINE_NUMBER  // Use the configured line number from .env
      );

      logger.info(`SMS sent to ${mobile}`);
      return {
        success: true,
        messageId: response.data?.data?.messageIds?.[0],
        message: 'SMS sent successfully'
      };
    } catch (error) {
      logger.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Send bulk SMS to multiple recipients
   * @param {string[]} mobiles - Array of phone numbers
   * @param {string} message - Message content
   * @returns {Promise<object>} - Response from SMS service
   */
  async sendBulkSms(mobiles, message) {
    try {
      // Send the same message to multiple recipients
      const response = await this.smsClient.SendBulk(
        message,
        mobiles,
        null,  // SendDateTime (null for immediate sending)
        config.SMS_LINE_NUMBER  // Use the configured line number from .env
      );

      logger.info(`Bulk SMS sent to ${mobiles.length} recipients`);
      return {
        success: true,
        messageIds: response.data?.data?.messageIds,
        message: 'Bulk SMS sent successfully'
      };
    } catch (error) {
      logger.error('Error sending bulk SMS:', error);
      return {
        success: false,
        error: error.message || 'Failed to send bulk SMS'
      };
    }
  }

  /**
   * Check remaining credit for SMS service
   * @returns {Promise<object>} - Credit information
   */
  async getCredit() {
    try {
      const response = await this.smsClient.getCredit();
      return {
        success: true,
        credit: response.data
      };
    } catch (error) {
      logger.error('Error getting SMS credit:', error);
      return {
        success: false,
        error: error.message || 'Failed to get SMS credit'
      };
    }
  }
}

module.exports = new SmsService(); 