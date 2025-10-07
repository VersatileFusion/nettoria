const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Email utility for sending emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Result object
   */
  async sendEmail(options) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Nettoria <noreply@nettoria.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${options.to}`);
      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send verification email
   * @param {string} email - Recipient email
   * @param {string} token - Verification token
   * @param {string} name - Recipient name
   * @returns {Promise<Object>} - Result object
   */
  async sendVerificationEmail(email, token, name) {
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${token}`;
    
    const options = {
      to: email,
      subject: 'تایید ایمیل - Nettoria',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>سلام ${name}</h2>
          <p>لطفاً برای تایید ایمیل خود روی لینک زیر کلیک کنید:</p>
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">تایید ایمیل</a>
          <p>یا این لینک را در مرورگر خود کپی کنید:</p>
          <p>${verificationUrl}</p>
          <p>این لینک تا 24 ساعت معتبر است.</p>
          <hr>
          <p><small>این ایمیل از طرف Nettoria ارسال شده است.</small></p>
        </div>
      `
    };

    return this.sendEmail(options);
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} token - Reset token
   * @param {string} name - Recipient name
   * @returns {Promise<Object>} - Result object
   */
  async sendPasswordResetEmail(email, token, name) {
    const resetUrl = `${process.env.BASE_URL}/api/auth/reset-password/${token}`;
    
    const options = {
      to: email,
      subject: 'بازیابی رمز عبور - Nettoria',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>سلام ${name}</h2>
          <p>درخواست بازیابی رمز عبور دریافت شد. برای تنظیم رمز عبور جدید روی لینک زیر کلیک کنید:</p>
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">بازیابی رمز عبور</a>
          <p>یا این لینک را در مرورگر خود کپی کنید:</p>
          <p>${resetUrl}</p>
          <p>این لینک تا 1 ساعت معتبر است.</p>
          <p><strong>اگر شما این درخواست را نکرده‌اید، این ایمیل را نادیده بگیرید.</strong></p>
          <hr>
          <p><small>این ایمیل از طرف Nettoria ارسال شده است.</small></p>
        </div>
      `
    };

    return this.sendEmail(options);
  }

  /**
   * Send notification email
   * @param {string} email - Recipient email
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   * @param {string} name - Recipient name
   * @returns {Promise<Object>} - Result object
   */
  async sendNotificationEmail(email, subject, message, name) {
    const options = {
      to: email,
      subject: `${subject} - Nettoria`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>سلام ${name}</h2>
          <p>${message}</p>
          <hr>
          <p><small>این ایمیل از طرف Nettoria ارسال شده است.</small></p>
        </div>
      `
    };

    return this.sendEmail(options);
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export individual functions for backward compatibility
module.exports = {
  sendEmail: (options) => emailService.sendEmail(options),
  sendVerificationEmail: (email, token, name) => emailService.sendVerificationEmail(email, token, name),
  sendPasswordResetEmail: (email, token, name) => emailService.sendPasswordResetEmail(email, token, name),
  sendNotificationEmail: (email, subject, message, name) => emailService.sendNotificationEmail(email, subject, message, name),
  EmailService
};
