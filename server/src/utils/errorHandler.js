const createErrorResponse = (status, message, code = null) => {
  return {
    success: false,
    error: {
      status,
      message,
      code,
      timestamp: new Date().toISOString()
    }
  };
};

class AppError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (err, req, res, next) => {
  err.status = err.status || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.status).json({
      success: false,
      error: {
        status: err.status,
        message: err.message,
        code: err.code,
        stack: err.stack,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    // Production mode - don't send stack trace
    res.status(err.status).json({
      success: false,
      error: {
        status: err.status,
        message: err.message,
        code: err.code,
        timestamp: new Date().toISOString()
      }
    });
  }
};

module.exports = {
  createErrorResponse,
  AppError,
  handleError
}; 