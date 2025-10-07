const rateLimit = require('express-rate-limit');
const logger = require('./logger');

/**
 * Rate Limiter utility for API rate limiting
 */
class RateLimiter {
  constructor() {
    this.limiters = new Map();
  }

  /**
   * Create a rate limiter
   * @param {Object} options - Rate limiter options
   * @returns {Function} - Rate limiter middleware
   */
  createLimiter(options) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفا کمی صبر کنید.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json(options.message);
      }
    };

    const limiterOptions = { ...defaultOptions, ...options };
    const limiter = rateLimit(limiterOptions);
    
    return limiter;
  }

  /**
   * Get or create a named rate limiter
   * @param {string} name - Limiter name
   * @param {Object} options - Rate limiter options
   * @returns {Function} - Rate limiter middleware
   */
  getLimiter(name, options = {}) {
    if (!this.limiters.has(name)) {
      const limiter = this.createLimiter(options);
      this.limiters.set(name, limiter);
    }
    return this.limiters.get(name);
  }

  /**
   * Create API rate limiter
   * @returns {Function} - Rate limiter middleware
   */
  apiLimiter() {
    return this.getLimiter('api', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
  }

  /**
   * Create authentication rate limiter
   * @returns {Function} - Rate limiter middleware
   */
  authLimiter() {
    return this.getLimiter('auth', {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        success: false,
        message: 'تعداد تلاش‌های ورود بیش از حد مجاز است. لطفا یک ساعت دیگر تلاش کنید.'
      }
    });
  }

  /**
   * Create password reset rate limiter
   * @returns {Function} - Rate limiter middleware
   */
  passwordResetLimiter() {
    return this.getLimiter('password-reset', {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // limit each IP to 3 requests per windowMs
      message: {
        success: false,
        message: 'تعداد درخواست‌های بازنشانی رمز عبور بیش از حد مجاز است. لطفا یک ساعت دیگر تلاش کنید.'
      }
    });
  }

  /**
   * Create 2FA rate limiter
   * @returns {Function} - Rate limiter middleware
   */
  twoFactorLimiter() {
    return this.getLimiter('two-factor', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        success: false,
        message: 'تعداد تلاش‌های تایید دو مرحله‌ای بیش از حد مجاز است. لطفا 15 دقیقه دیگر تلاش کنید.'
      }
    });
  }

  /**
   * Create SMS rate limiter
   * @returns {Function} - Rate limiter middleware
   */
  smsLimiter() {
    return this.getLimiter('sms', {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 SMS requests per hour
      message: {
        success: false,
        message: 'تعداد درخواست‌های پیامک بیش از حد مجاز است. لطفا یک ساعت دیگر تلاش کنید.'
      }
    });
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Export individual functions for backward compatibility
module.exports = {
  RateLimiter,
  apiLimiter: () => rateLimiter.apiLimiter(),
  authLimiter: () => rateLimiter.authLimiter(),
  passwordResetLimiter: () => rateLimiter.passwordResetLimiter(),
  twoFactorLimiter: () => rateLimiter.twoFactorLimiter(),
  smsLimiter: () => rateLimiter.smsLimiter()
};
