/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle API errors in a consistent format
 * @param {Error} err - The error object
 * @param {Object} res - Express response object
 */
const handleError = (err, res) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).json({
    success: false,
    error: {
      message: message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = {
  ApiError,
  handleError
}; 