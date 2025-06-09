const rateLimit = require('express-rate-limit');
const { createErrorResponse } = require('../utils/errorHandler');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: createErrorResponse(429, 'Too many login attempts. Please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: createErrorResponse(429, 'Too many requests. Please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: createErrorResponse(429, 'Too many password reset attempts. Please try again later.'),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
  passwordResetLimiter
}; 