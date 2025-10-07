/**
 * Custom error classes for the application
 */

/**
 * Base error class
 */
class BaseError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
class ValidationError extends BaseError {
  constructor(message = 'Validation Error', statusCode = 422) {
    super(message, statusCode);
  }
}

/**
 * Not found error
 */
class NotFoundError extends BaseError {
  constructor(message = 'Resource Not Found', statusCode = 404) {
    super(message, statusCode);
  }
}

/**
 * Authentication error
 */
class AuthenticationError extends BaseError {
  constructor(message = 'Authentication Failed', statusCode = 401) {
    super(message, statusCode);
  }
}

/**
 * Authorization error
 */
class AuthorizationError extends BaseError {
  constructor(message = 'Access Denied', statusCode = 403) {
    super(message, statusCode);
  }
}

/**
 * Conflict error
 */
class ConflictError extends BaseError {
  constructor(message = 'Resource Conflict', statusCode = 409) {
    super(message, statusCode);
  }
}

/**
 * Bad request error
 */
class BadRequestError extends BaseError {
  constructor(message = 'Bad Request', statusCode = 400) {
    super(message, statusCode);
  }
}

/**
 * Internal server error
 */
class InternalServerError extends BaseError {
  constructor(message = 'Internal Server Error', statusCode = 500) {
    super(message, statusCode);
  }
}

/**
 * Service unavailable error
 */
class ServiceUnavailableError extends BaseError {
  constructor(message = 'Service Unavailable', statusCode = 503) {
    super(message, statusCode);
  }
}

/**
 * Rate limit error
 */
class RateLimitError extends BaseError {
  constructor(message = 'Rate Limit Exceeded', statusCode = 429) {
    super(message, statusCode);
  }
}

/**
 * Database error
 */
class DatabaseError extends BaseError {
  constructor(message = 'Database Error', statusCode = 500) {
    super(message, statusCode);
  }
}

/**
 * External service error
 */
class ExternalServiceError extends BaseError {
  constructor(message = 'External Service Error', statusCode = 502) {
    super(message, statusCode);
  }
}

module.exports = {
  BaseError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  ServiceUnavailableError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError
};
