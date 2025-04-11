const smsService = require('../services/sms.service');
const logger = require('./logger');

/**
 * Utility for sending notifications through various channels (SMS, email, etc.)
 */
class NotificationUtil {
  /**
   * Send a verification code notification
   * @param {Object} options - Notification options
   * @param {Object} options.user - User object
   * @param {string} options.code - Verification code
   * @param {boolean} options.useSms - Whether to send SMS notification
   * @param {boolean} options.useEmail - Whether to send email notification
   * @returns {Promise<Object>} - Result of the notification attempt
   */
  static async sendVerificationCode(options) {
    const { user, code, useSms = true, useEmail = false } = options;
    const results = { success: false, channels: {} };
    
    try {
      // Send SMS if enabled and phone number exists
      if (useSms && user.phoneNumber) {
        const smsResult = await smsService.sendVerificationCode(user.phoneNumber, code);
        results.channels.sms = smsResult;
        
        if (smsResult.success) {
          results.success = true;
        }
      }
      
      // Send email if enabled and implemented
      if (useEmail && user.email) {
        // Email implementation would go here
        // For now, we'll just log it
        logger.info(`Would send verification code ${code} to email ${user.email}`);
        results.channels.email = { 
          success: true, 
          message: 'Email notification not implemented yet' 
        };
      }
      
      return results;
    } catch (error) {
      logger.error('Error sending verification code notification:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send notification' 
      };
    }
  }
  
  /**
   * Send a general notification
   * @param {Object} options - Notification options
   * @param {Object} options.user - User object
   * @param {string} options.message - Notification message
   * @param {string} options.subject - Email subject (for email notifications)
   * @param {boolean} options.useSms - Whether to send SMS notification
   * @param {boolean} options.useEmail - Whether to send email notification
   * @returns {Promise<Object>} - Result of the notification attempt
   */
  static async sendNotification(options) {
    const { user, message, subject, useSms = true, useEmail = false } = options;
    const results = { success: false, channels: {} };
    
    try {
      // Send SMS if enabled and phone number exists
      if (useSms && user.phoneNumber) {
        const smsResult = await smsService.sendSms(user.phoneNumber, message);
        results.channels.sms = smsResult;
        
        if (smsResult.success) {
          results.success = true;
        }
      }
      
      // Send email if enabled and implemented
      if (useEmail && user.email) {
        // Email implementation would go here
        // For now, we'll just log it
        logger.info(`Would send email with subject "${subject}" and message "${message}" to ${user.email}`);
        results.channels.email = { 
          success: true, 
          message: 'Email notification not implemented yet' 
        };
      }
      
      return results;
    } catch (error) {
      logger.error('Error sending notification:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send notification' 
      };
    }
  }
  
  /**
   * Send a bulk notification to multiple users
   * @param {Object} options - Notification options
   * @param {Array<Object>} options.users - Array of user objects
   * @param {string} options.message - Notification message
   * @param {string} options.subject - Email subject (for email notifications)
   * @param {boolean} options.useSms - Whether to send SMS notification
   * @param {boolean} options.useEmail - Whether to send email notification
   * @returns {Promise<Object>} - Result of the notification attempt
   */
  static async sendBulkNotification(options) {
    const { users, message, subject, useSms = true, useEmail = false } = options;
    const results = { success: false, channels: {} };
    
    try {
      // Send SMS if enabled
      if (useSms) {
        const phoneNumbers = users
          .filter(user => user.phoneNumber)
          .map(user => user.phoneNumber);
        
        if (phoneNumbers.length > 0) {
          const smsResult = await smsService.sendBulkSms(phoneNumbers, message);
          results.channels.sms = smsResult;
          
          if (smsResult.success) {
            results.success = true;
          }
        }
      }
      
      // Send email if enabled and implemented
      if (useEmail) {
        const emails = users
          .filter(user => user.email)
          .map(user => user.email);
        
        if (emails.length > 0) {
          // Email implementation would go here
          // For now, we'll just log it
          logger.info(`Would send email with subject "${subject}" and message "${message}" to ${emails.length} users`);
          results.channels.email = { 
            success: true, 
            message: 'Email notification not implemented yet' 
          };
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error sending bulk notification:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send bulk notification' 
      };
    }
  }
}

module.exports = NotificationUtil; 