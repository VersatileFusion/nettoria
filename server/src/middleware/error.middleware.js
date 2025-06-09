const logger = require('../utils/logger');

// Custom error class for API errors
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user ? req.user.id : 'anonymous'
    });

    // Development error response
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
    }
    // Production error response
    else {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message
            });
        }
        // Programming or other unknown error: don't leak error details
        else {
            // Log error
            logger.error('Unexpected error:', err);

            // Send generic message
            res.status(500).json({
                success: false,
                status: 'error',
                message: 'خطای سیستمی'
            });
        }
    }
};

// Handle specific error types
const handleCastErrorDB = (err) => {
    const message = `مقدار نامعتبر ${err.value} برای ${err.path}`;
    return new ApiError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `مقدار تکراری: ${value}. لطفا از مقدار دیگری استفاده کنید`;
    return new ApiError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `داده نامعتبر. ${errors.join('. ')}`;
    return new ApiError(message, 400);
};

const handleJWTError = () => new ApiError('توکن نامعتبر. لطفا دوباره وارد شوید', 401);

const handleJWTExpiredError = () => new ApiError('توکن منقضی شده است. لطفا دوباره وارد شوید', 401);

// Error type handler
const errorTypeHandler = (err) => {
    if (err.name === 'CastError') return handleCastErrorDB(err);
    if (err.code === 11000) return handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') return handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') return handleJWTError();
    if (err.name === 'TokenExpiredError') return handleJWTExpiredError();
    return err;
};

// Not found handler
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(`مسیر ${req.originalUrl} یافت نشد`, 404);
    next(error);
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    ApiError,
    errorHandler,
    errorTypeHandler,
    notFoundHandler,
    asyncHandler
}; 