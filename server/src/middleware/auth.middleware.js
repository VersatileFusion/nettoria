const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');

console.log('Initializing Auth Middleware...');

// Protect routes that require authentication
exports.protect = async (req, res, next) => {
  console.log('Checking authentication for protected route');
  
  try {
    // 1) Check if token exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access'
      });
    }
    
    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(`Token verified for user ID: ${decoded.id}`);
    
    // 3) Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.log(`Authentication failed: User with ID ${decoded.id} no longer exists`);
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists'
      });
    }
    
    // 4) Add user to request
    req.user = user;
    console.log(`User authenticated: ${user.email}`);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Restrict access to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(`Checking role authorization: User ${req.user.email} has role ${req.user.role}`);
    
    if (!roles.includes(req.user.role)) {
      console.log(`Authorization failed: User ${req.user.email} does not have required role`);
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    
    console.log(`Authorization successful for user ${req.user.email}`);
    next();
  };
};

console.log('Auth Middleware initialized successfully'); 