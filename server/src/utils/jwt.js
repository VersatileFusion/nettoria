const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * JWT utility for token operations
 */
class JWTService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'nettoria-secret-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
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
        expiresIn: expiresIn || this.expiresIn,
        issuer: 'nettoria',
        audience: 'nettoria-users'
      };

      const token = jwt.sign(payload, this.secret, options);
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
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'nettoria',
        audience: 'nettoria-users'
      });
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Generate access token
   * @param {Object} user - User object
   * @returns {string} - Access token
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    };

    return this.generateToken(payload, this.expiresIn);
  }

  /**
   * Generate refresh token
   * @param {Object} user - User object
   * @returns {string} - Refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user.id,
      type: 'refresh'
    };

    return this.generateToken(payload, this.refreshExpiresIn);
  }

  /**
   * Generate token pair (access + refresh)
   * @param {Object} user - User object
   * @returns {Object} - Token pair
   */
  generateTokenPair(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }

  /**
   * Decode token without verification
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Failed to decode token:', error);
      throw new Error('Token decoding failed');
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} - True if expired
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header
   * @returns {string|null} - Extracted token
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

// Create singleton instance
const jwtService = new JWTService();

// Export individual functions for backward compatibility
module.exports = {
  generateToken: (payload, expiresIn) => jwtService.generateToken(payload, expiresIn),
  verifyToken: (token) => jwtService.verifyToken(token),
  generateAccessToken: (user) => jwtService.generateAccessToken(user),
  generateRefreshToken: (user) => jwtService.generateRefreshToken(user),
  generateTokenPair: (user) => jwtService.generateTokenPair(user),
  decodeToken: (token) => jwtService.decodeToken(token),
  isTokenExpired: (token) => jwtService.isTokenExpired(token),
  extractTokenFromHeader: (authHeader) => jwtService.extractTokenFromHeader(authHeader),
  JWTService
};
