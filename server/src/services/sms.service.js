const axios = require("axios");
const { SMS } = require("../models");
const logger = require("../utils/logger");

// SMS service configuration
const SMS_SERVICE_CONFIG = {
  apiKey: process.env.SMS_SERVICE_API_KEY,
  apiUrl: process.env.SMS_SERVICE_API_URL,
  sender: process.env.SMS_SENDER_ID,
};

/**
 * Send SMS using the configured SMS service
 * @param {string} recipient - Phone number of the recipient
 * @param {string} message - Message content
 * @param {number} userId - ID of the user sending the SMS
 * @returns {Promise<Object>} - Result of the SMS sending operation
 */
async function sendSMS(recipient, message, userId) {
  try {
    // Create SMS record in database
    const smsRecord = await SMS.create({
      userId,
      recipient,
      message,
      status: "pending",
    });

    // Send SMS through the service
    const response = await axios.post(SMS_SERVICE_CONFIG.apiUrl, {
      apiKey: SMS_SERVICE_CONFIG.apiKey,
      sender: SMS_SERVICE_CONFIG.sender,
      recipient,
      message,
    });

    // Update SMS record with result
    if (response.data.success) {
      await smsRecord.update({
        status: "sent",
        messageId: response.data.messageId,
      });
      return {
        success: true,
        messageId: response.data.messageId,
      };
    } else {
      await smsRecord.update({
        status: "failed",
        error: response.data.error,
      });
      throw new Error(response.data.error);
    }
  } catch (error) {
    logger.error("Error sending SMS:", error);
    throw error;
  }
}

/**
 * Send bulk SMS to multiple recipients
 * @param {string[]} recipients - Array of phone numbers
 * @param {string} message - Message content
 * @param {number} userId - ID of the user sending the SMS
 * @returns {Promise<Object[]>} - Results of the SMS sending operations
 */
async function sendBulkSMS(recipients, message, userId) {
  try {
    const results = await Promise.all(
      recipients.map((recipient) => sendSMS(recipient, message, userId))
    );
    return results;
  } catch (error) {
    logger.error("Error sending bulk SMS:", error);
    throw error;
  }
}

/**
 * Get SMS delivery status
 * @param {string} messageId - ID of the sent message
 * @returns {Promise<Object>} - Status of the SMS
 */
async function getSMSStatus(messageId) {
  try {
    const response = await axios.get(`${SMS_SERVICE_CONFIG.apiUrl}/status`, {
      params: {
        apiKey: SMS_SERVICE_CONFIG.apiKey,
        messageId,
      },
    });

    return response.data;
  } catch (error) {
    logger.error("Error getting SMS status:", error);
    throw error;
  }
}

/**
 * Get remaining SMS credit
 * @returns {Promise<number>} - Remaining credit
 */
async function getCredit() {
  try {
    const response = await axios.get(`${SMS_SERVICE_CONFIG.apiUrl}/credit`, {
      params: {
        apiKey: SMS_SERVICE_CONFIG.apiKey,
      },
    });

    return response.data.credit;
  } catch (error) {
    logger.error("Error getting SMS credit:", error);
    throw error;
  }
}

module.exports = {
  sendSMS,
  sendBulkSMS,
  getSMSStatus,
  getCredit,
};
