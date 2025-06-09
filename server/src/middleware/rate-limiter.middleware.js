const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../utils/logger');

// Create Redis client
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('error', (err) => {
    logger.error('Redis error:', err);
});

// Create rate limiter store
const store = new RedisStore({
    client: redis,
    prefix: 'rate-limit:'
});

// General API rate limiter
const apiLimiter = rateLimit({
    store,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفا کمی صبر کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter limiter for authentication routes
const authLimiter = rateLimit({
    store,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'تعداد تلاش‌های ورود بیش از حد مجاز است. لطفا یک ساعت دیگر تلاش کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter limiter for password reset
const passwordResetLimiter = rateLimit({
    store,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        success: false,
        message: 'تعداد درخواست‌های بازنشانی رمز عبور بیش از حد مجاز است. لطفا یک ساعت دیگر تلاش کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter limiter for 2FA verification
const twoFactorLimiter = rateLimit({
    store,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'تعداد تلاش‌های تایید دو مرحله‌ای بیش از حد مجاز است. لطفا 15 دقیقه دیگر تلاش کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter limiter for sensitive operations
const sensitiveOperationLimiter = rateLimit({
    store,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفا یک ساعت دیگر تلاش کنید.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    apiLimiter,
    authLimiter,
    passwordResetLimiter,
    twoFactorLimiter,
    sensitiveOperationLimiter
}; 