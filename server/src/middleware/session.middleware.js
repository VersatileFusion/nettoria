const { AppError } = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');

const sessionMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'Authentication required. Please login.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    // Check if session is expired
    if (decoded.exp < Date.now() / 1000) {
      throw new AppError(401, 'Session expired. Please login again.');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError(401, 'Invalid token. Please login again.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError(401, 'Session expired. Please login again.'));
    } else {
      next(error);
    }
  }
};

module.exports = sessionMiddleware; 