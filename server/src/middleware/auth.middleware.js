const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const speakeasy = require('speakeasy');

console.log("Initializing Auth Middleware...");

// Define middleware functions
const authMiddleware = {
  // Protect routes (required authentication)
  protect: async (req, res, next) => {
    try {
      let token;

      // Get token from Authorization header
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'لطفا وارد حساب کاربری خود شوید'
        });
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id).select('+twoFactorSecret');
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'کاربر یافت نشد'
          });
        }

        // Check if user is active
        if (user.status !== 'active') {
          return res.status(401).json({
            success: false,
            message: 'حساب کاربری شما غیرفعال است'
          });
        }

        // Attach user to request
        req.user = user;
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'توکن نامعتبر است'
        });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در احراز هویت'
      });
    }
  },

  // Verify two-factor authentication code
  verify2FA: async (req, res, next) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'کد تایید الزامی است'
        });
      }

      // Verify code
      const verified = speakeasy.totp.verify({
        secret: req.user.twoFactorSecret,
        encoding: 'base32',
        token: code
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'کد تایید نامعتبر است'
        });
      }

      next();
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در تایید کد'
      });
    }
  },

  // Restrict access to specific roles
  restrictTo: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'شما دسترسی به این بخش را ندارید'
        });
      }
      next();
    };
  },

  // Check if user has two-factor authentication enabled
  check2FA: (req, res, next) => {
    if (req.user.twoFactorEnabled) {
      return res.status(403).json({
        success: false,
        message: 'نیاز به تایید دو مرحله‌ای است',
        require2FA: true
      });
    }
    next();
  },

  // Add login history
  addLoginHistory: async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const device = userAgent ? userAgent.split('(')[1].split(')')[0] : 'Unknown';

      await req.user.addLoginHistory(ip, device, 'success');
      next();
    } catch (error) {
      console.error('Add login history error:', error);
      next();
    }
  },

  // Check if user is verified
  isVerified: (req, res, next) => {
    if (!req.user.isEmailVerified || !req.user.isPhoneVerified) {
      return res.status(403).json({
        success: false,
        message: 'لطفا ابتدا حساب کاربری خود را تایید کنید',
        requireVerification: true
      });
    }
    next();
  },

  // Check if user has completed profile
  hasCompleteProfile: (req, res, next) => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !req.user[field]);

    if (missingFields.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'لطفا ابتدا پروفایل خود را تکمیل کنید',
        missingFields
      });
    }
    next();
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
