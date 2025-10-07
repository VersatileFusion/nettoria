/**
 * API Error class for handling application errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, isOperational = true, stack = "") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Create a bad request error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static badRequest(message = "Bad Request") {
    return new ApiError(message, 400);
  }

  /**
   * Create an unauthorized error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  /**
   * Create a forbidden error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  /**
   * Create a not found error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static notFound(message = "Not Found") {
    return new ApiError(message, 404);
  }

  /**
   * Create a conflict error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static conflict(message = "Conflict") {
    return new ApiError(message, 409);
  }

  /**
   * Create a validation error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static validation(message = "Validation Error") {
    return new ApiError(message, 422);
  }

  /**
   * Create a too many requests error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static tooManyRequests(message = "Too Many Requests") {
    return new ApiError(message, 429);
  }

  /**
   * Create an internal server error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static internal(message = "Internal Server Error") {
    return new ApiError(message, 500);
  }

  /**
   * Create a service unavailable error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static serviceUnavailable(message = "Service Unavailable") {
    return new ApiError(message, 503);
  }

  /**
   * Convert error to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      stack: this.stack,
    };
  }
}

module.exports = ApiError;
