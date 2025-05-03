const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../utils/logger");

console.log("Initializing Auth Middleware...");

// Define middleware functions
const authMiddleware = {
  // Protect routes (required authentication)
  protect: async (req, res, next) => {
    try {
      // 1) Get token
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return res.status(401).json({
          status: "error",
          message: "You are not logged in. Please log in to get access.",
        });
      }

      // 2) Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3) Check if user still exists
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "The user belonging to this token no longer exists.",
        });
      }

      // 4) Check if user is active
      if (user.status === 'pending') {
        return res.status(403).json({
          status: "error",
          message: "Your account is pending verification. Please verify your phone number.",
          data: {
            requiresPhoneVerification: true,
            phoneNumber: user.phoneNumber
          }
        });
      }
      
      if (user.status === 'suspended' || user.status === 'blocked') {
        return res.status(403).json({
          status: "error",
          message: `Your account is ${user.status}. Please contact support.`
        });
      }

      // GRANT ACCESS TO PROTECTED ROUTE
      req.user = user;
      next();
    } catch (error) {
      logger.error("Authentication error:", error);
      res.status(401).json({
        status: "error",
        message: "Not authorized to access this route",
        error: error.message,
      });
    }
  },

  // Less strict authentication (allows proceeding even if not authenticated)
  authenticate: async (req, res, next) => {
    try {
      // 1) Get token
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        // Still allow access, but without user info
        return next();
      }

      // 2) Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3) Check if user still exists
      const user = await User.findByPk(decoded.id);

      if (user) {
        req.user = user;
      }

      next();
    } catch (error) {
      // Still allow access if token validation fails
      logger.error("Token validation error:", error);
      next();
    }
  },

  // Restrict to certain user roles
  restrictTo: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "You are not logged in. Please log in to get access.",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: "You do not have permission to perform this action",
        });
      }

      next();
    };
  },

  // Specifically for admin only routes
  isAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "This action requires admin privileges",
      });
    }

    next();
  },
};

console.log("Auth Middleware initialized successfully");

module.exports = authMiddleware;
