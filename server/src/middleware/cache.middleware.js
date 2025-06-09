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
    logger.error('Redis cache error:', err);
});

// Cache middleware
const cache = (duration) => {
    return async (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Skip caching for authenticated requests
        if (req.headers.authorization) {
            return next();
        }

        const key = `cache:${req.originalUrl}`;

        try {
            const cachedResponse = await redis.get(key);

            if (cachedResponse) {
                const data = JSON.parse(cachedResponse);
                return res.json(data);
            }

            // Store original res.json
            const originalJson = res.json;

            // Override res.json
            res.json = function(data) {
                // Store in cache
                redis.setex(key, duration, JSON.stringify(data))
                    .catch(err => logger.error('Cache set error:', err));

                // Call original res.json
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

// Clear cache for specific pattern
const clearCache = async (pattern) => {
    try {
        const keys = await redis.keys(`cache:${pattern}`);
        if (keys.length > 0) {
            await redis.del(keys);
        }
    } catch (error) {
        logger.error('Clear cache error:', error);
    }
};

// Cache invalidation middleware
const invalidateCache = (pattern) => {
    return async (req, res, next) => {
        // Store original res.json
        const originalJson = res.json;

        // Override res.json
        res.json = async function(data) {
            // Clear cache
            await clearCache(pattern);

            // Call original res.json
            return originalJson.call(this, data);
        };

        next();
    };
};

module.exports = {
    cache,
    clearCache,
    invalidateCache
}; 