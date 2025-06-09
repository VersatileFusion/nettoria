const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { sendSMS } = require("../services/sms.service");
const logger = require("../utils/logger");

class SuccessPasswordController {
  /**
   * Set success password for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async setSuccessPassword(req, res) {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's success password
      await User.update(
        { successPassword: hashedPassword },
        { where: { id: userId } }
      );

      // Send confirmation SMS
      const user = await User.findByPk(userId);
      await sendSMS(
        user.phoneNumber,
        "Your success password has been set successfully. This password will be required for sensitive operations.",
        userId
      );

      res.json({
        message: "Success password set successfully",
      });
    } catch (error) {
      logger.error("Error setting success password:", error);
      res.status(500).json({
        error: "Failed to set success password",
      });
    }
  }

  /**
   * Verify success password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async verifySuccessPassword(req, res) {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      // Get user's success password
      const user = await User.findByPk(userId);
      if (!user.successPassword) {
        return res.status(400).json({
          error: "Success password not set",
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.successPassword);
      if (!isValid) {
        return res.status(401).json({
          error: "Invalid success password",
        });
      }

      res.json({
        message: "Success password verified successfully",
      });
    } catch (error) {
      logger.error("Error verifying success password:", error);
      res.status(500).json({
        error: "Failed to verify success password",
      });
    }
  }

  /**
   * Reset success password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async resetSuccessPassword(req, res) {
    try {
      const userId = req.user.id;

      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Update user's success password reset code
      await User.update(
        {
          successPasswordResetCode: code,
          successPasswordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
        { where: { id: userId } }
      );

      // Send reset code via SMS
      const user = await User.findByPk(userId);
      await sendSMS(
        user.phoneNumber,
        `Your success password reset code is: ${code}. This code will expire in 10 minutes.`,
        userId
      );

      res.json({
        message: "Success password reset code sent successfully",
        expiresIn: "10 minutes",
      });
    } catch (error) {
      logger.error("Error resetting success password:", error);
      res.status(500).json({
        error: "Failed to reset success password",
      });
    }
  }

  /**
   * Confirm success password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async confirmSuccessPasswordReset(req, res) {
    try {
      const { code, newPassword } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await User.findByPk(userId);
      if (!user.successPasswordResetCode || !user.successPasswordResetExpires) {
        return res.status(400).json({
          error: "No pending success password reset",
        });
      }

      // Check if code is valid and not expired
      if (
        user.successPasswordResetCode !== code ||
        user.successPasswordResetExpires < new Date()
      ) {
        return res.status(400).json({
          error: "Invalid or expired reset code",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update success password and clear reset code
      await User.update(
        {
          successPassword: hashedPassword,
          successPasswordResetCode: null,
          successPasswordResetExpires: null,
        },
        { where: { id: userId } }
      );

      // Send confirmation SMS
      await sendSMS(
        user.phoneNumber,
        "Your success password has been reset successfully.",
        userId
      );

      res.json({
        message: "Success password reset successfully",
      });
    } catch (error) {
      logger.error("Error confirming success password reset:", error);
      res.status(500).json({
        error: "Failed to confirm success password reset",
      });
    }
  }
}

module.exports = SuccessPasswordController;
