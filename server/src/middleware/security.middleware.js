const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../utils/logger');

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// Security middleware setup
const securityMiddleware = [
    // Set security HTTP headers
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            }
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: { policy: 'same-site' },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        ieNoOpen: true,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true
    }),

    // Enable CORS
    cors(corsOptions),

    // Data sanitization against NoSQL query injection
    mongoSanitize(),

    // Data sanitization against XSS
    xss(),

    // Prevent parameter pollution
    hpp(),

    // Custom security headers
    (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        next();
    },

    // Request body size limit
    (req, res, next) => {
        if (req.headers['content-length'] > 1024 * 1024) { // 1MB
            return res.status(413).json({
                success: false,
                message: 'حجم درخواست بیش از حد مجاز است'
            });
        }
        next();
    },

    // Block suspicious requests
    (req, res, next) => {
        const suspiciousPatterns = [
            /\.\.\//, // Path traversal
            /<script>/, // XSS attempt
            /exec\(/, // Command injection
            /eval\(/, // Code injection
            /union\s+select/i, // SQL injection
            /document\.cookie/i, // Cookie theft
            /onload\s*=/i, // Event handler injection
            /javascript:/i // Protocol handler injection
        ];

        const checkString = JSON.stringify(req.body) + req.url + JSON.stringify(req.query);
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(checkString)) {
                logger.warn('Suspicious request blocked:', {
                    url: req.url,
                    method: req.method,
                    ip: req.ip,
                    pattern: pattern.toString()
                });
                return res.status(403).json({
                    success: false,
                    message: 'درخواست نامعتبر'
                });
            }
        }
        next();
    }
];

module.exports = securityMiddleware; 