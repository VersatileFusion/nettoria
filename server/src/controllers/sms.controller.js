const smsService = require('../services/sms.service');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Send verification code to a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendVerificationCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }
    
    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the verification code in the user record
    // (In a real system, you'd want to hash this and add expiration)
    if (req.user && req.user.id) {
      await User.update(
        { 
          verificationCode,
          verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        },
        { where: { id: req.user.id } }
      );
    }
    
    // Send the verification code via SMS
    const result = await smsService.sendVerificationCode(phoneNumber, verificationCode);
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: result.error 
      });
    }
    
    res.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresIn: '10 minutes'
    });
  } catch (error) {
    logger.error('Error sending verification code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send verification code' 
    });
  }
};

/**
 * Verify a verification code entered by the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code is required' 
      });
    }
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }
    
    // Get the user record
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if verification code is valid and not expired
    if (
      !user.verificationCode || 
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code' 
      });
    }
    
    // Mark the phone as verified
    await User.update(
      { 
        phoneVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      },
      { where: { id: user.id } }
    );
    
    res.json({
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    logger.error('Error verifying code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify code' 
    });
  }
};

/**
 * Send a notification SMS
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendNotification = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and message are required' 
      });
    }
    
    // Send the SMS
    const result = await smsService.sendSms(phoneNumber, message);
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: result.error 
      });
    }
    
    res.json({
      success: true,
      messageId: result.messageId,
      message: 'SMS notification sent successfully'
    });
  } catch (error) {
    logger.error('Error sending notification SMS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send notification SMS' 
    });
  }
};

/**
 * Get SMS service credit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCredit = async (req, res) => {
  try {
    const result = await smsService.getCredit();
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: result.error 
      });
    }
    
    res.json({
      success: true,
      credit: result.credit
    });
  } catch (error) {
    logger.error('Error getting SMS credit:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get SMS credit' 
    });
  }
}; 