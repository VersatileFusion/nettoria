const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Token utility for generating and validating tokens
 */
class TokenService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'nettoria-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @param {string} expiresIn - Token expiration time
   * @returns {string} - JWT token
   */
  generateToken(payload, expiresIn = null) {
    try {
      const options = {
        expiresIn: expiresIn || this.jwtExpiresIn,
        issuer: 'nettoria',
        audience: 'nettoria-users'
      };

      const token = jwt.sign(payload, this.jwtSecret, options);
      logger.debug('JWT token generated successfully');
      return token;
    } catch (error) {
      logger.error('Failed to generate JWT token:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'nettoria',
        audience: 'nettoria-users'
      });
      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate random token
   * @param {number} length - Token length
   * @returns {string} - Random token
   */
  generateRandomToken(length = 32) {
    try {
      const token = crypto.randomBytes(length).toString('hex');
      logger.debug('Random token generated successfully');
      return token;
    } catch (error) {
      logger.error('Failed to generate random token:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate verification code
   * @param {number} length - Code length
   * @returns {string} - Verification code
   */
  generateVerificationCode(length = 6) {
    try {
      const code = crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
      logger.debug('Verification code generated successfully');
      return code;
    } catch (error) {
      logger.error('Failed to generate verification code:', error);
      throw new Error('Verification code generation failed');
    }
  }

  /**
   * Generate API key
   * @returns {string} - API key
   */
  generateApiKey() {
    try {
      const prefix = 'nk_'; // Nettoria Key prefix
      const randomPart = crypto.randomBytes(32).toString('hex');
      const apiKey = `${prefix}${randomPart}`;
      logger.debug('API key generated successfully');
      return apiKey;
    } catch (error) {
      logger.error('Failed to generate API key:', error);
      throw new Error('API key generation failed');
    }
  }

  /**
   * Generate session token
   * @param {Object} user - User object
   * @returns {string} - Session token
   */
  generateSessionToken(user) {
    try {
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'session'
      };

      return this.generateToken(payload, '7d');
    } catch (error) {
      logger.error('Failed to generate session token:', error);
      throw new Error('Session token generation failed');
    }
  }

  /**
   * Generate refresh token
   * @param {Object} user - User object
   * @returns {string} - Refresh token
   */
  generateRefreshToken(user) {
    try {
      const payload = {
        userId: user.id,
        type: 'refresh'
      };

      return this.generateToken(payload, '30d');
    } catch (error) {
      logger.error('Failed to generate refresh token:', error);
      throw new Error('Refresh token generation failed');
    }
  }

  /**
   * Generate password reset token
   * @param {Object} user - User object
   * @returns {string} - Password reset token
   */
  generatePasswordResetToken(user) {
    try {
      const payload = {
        userId: user.id,
        email: user.email,
        type: 'password_reset'
      };

      return this.generateToken(payload, '1h');
    } catch (error) {
      logger.error('Failed to generate password reset token:', error);
      throw new Error('Password reset token generation failed');
    }
  }

  /**
   * Generate email verification token
   * @param {Object} user - User object
   * @returns {string} - Email verification token
   */
  generateEmailVerificationToken(user) {
    try {
      const payload = {
        userId: user.id,
        email: user.email,
        type: 'email_verification'
      };

      return this.generateToken(payload, '24h');
    } catch (error) {
      logger.error('Failed to generate email verification token:', error);
      throw new Error('Email verification token generation failed');
    }
  }
}

// Create singleton instance
const tokenService = new TokenService();

// Export individual functions for backward compatibility
module.exports = {
  generateToken: (payload, expiresIn) => tokenService.generateToken(payload, expiresIn),
  verifyToken: (token) => tokenService.verifyToken(token),
  generateRandomToken: (length) => tokenService.generateRandomToken(length),
  generateVerificationCode: (length) => tokenService.generateVerificationCode(length),
  generateApiKey: () => tokenService.generateApiKey(),
  generateSessionToken: (user) => tokenService.generateSessionToken(user),
  generateRefreshToken: (user) => tokenService.generateRefreshToken(user),
  generatePasswordResetToken: (user) => tokenService.generatePasswordResetToken(user),
  generateEmailVerificationToken: (user) => tokenService.generateEmailVerificationToken(user),
  TokenService
};
