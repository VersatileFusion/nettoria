const { User, OneTimeLogin } = require("../models");
const { generateToken } = require("../utils/jwt");
const { sendSMS } = require("../services/sms.service");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

class OneTimeLoginController {
  /**
   * Generate a one-time login link/code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async generateOneTimeLogin(req, res) {
    try {
      const { phoneNumber } = req.body;

      // Validate phone number
      if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
        return res.status(400).json({
          error: "Invalid phone number format",
        });
      }

      // Check if user exists
      const user = await User.findOne({
        where: { phoneNumber },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Create one-time login record
      const oneTimeLogin = await OneTimeLogin.create({
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      // Send code via SMS
      await sendSMS(
        phoneNumber,
        `Your one-time login code is: ${code}. This code will expire in 10 minutes.`,
        user.id
      );

      res.json({
        message: "One-time login code sent successfully",
        expiresIn: "10 minutes",
      });
    } catch (error) {
      logger.error("Error generating one-time login:", error);
      res.status(500).json({
        error: "Failed to generate one-time login",
      });
    }
  }

  /**
   * Validate and use one-time login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async validateOneTimeLogin(req, res) {
    try {
      const { phoneNumber, code } = req.body;

      // Find the one-time login record
      const oneTimeLogin = await OneTimeLogin.findOne({
        where: {
          code,
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
        include: [
          {
            model: User,
            where: { phoneNumber },
          },
        ],
      });

      if (!oneTimeLogin) {
        return res.status(400).json({
          error: "Invalid or expired code",
        });
      }

      // Generate JWT token
      const token = generateToken({
        id: oneTimeLogin.user.id,
        email: oneTimeLogin.user.email,
        role: oneTimeLogin.user.role,
      });

      // Delete the used one-time login record
      await oneTimeLogin.destroy();

      res.json({
        message: "Login successful",
        token,
        user: {
          id: oneTimeLogin.user.id,
          email: oneTimeLogin.user.email,
          name: oneTimeLogin.user.name,
          role: oneTimeLogin.user.role,
        },
      });
    } catch (error) {
      logger.error("Error validating one-time login:", error);
      res.status(500).json({
        error: "Failed to validate one-time login",
      });
    }
  }

  /**
   * Check one-time login status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async checkOneTimeLoginStatus(req, res) {
    try {
      const { token } = req.params;

      const oneTimeLogin = await OneTimeLogin.findOne({
        where: {
          code: token,
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (!oneTimeLogin) {
        return res.status(404).json({
          error: "Invalid or expired token",
        });
      }

      res.json({
        status: "valid",
        expiresAt: oneTimeLogin.expiresAt,
      });
    } catch (error) {
      logger.error("Error checking one-time login status:", error);
      res.status(500).json({
        error: "Failed to check one-time login status",
      });
    }
  }
}

module.exports = OneTimeLoginController;
