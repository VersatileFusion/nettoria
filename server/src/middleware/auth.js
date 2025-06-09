const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    // Check if session exists and is active
    const session = user.sessions.find((s) => s.token === token);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Session expired",
          code: "SESSION_EXPIRED",
        },
      });
    }

    // Update last active timestamp
    session.lastActive = new Date();
    await user.save();

    // Check if session has timed out
    const timeout = user.securityPreferences.sessionTimeout * 60 * 60 * 1000; // Convert hours to milliseconds
    const now = new Date();
    if (now - session.lastActive > timeout) {
      await user.removeSession(token);
      return res.status(401).json({
        success: false,
        error: {
          message: "Session timed out",
          code: "SESSION_TIMEOUT",
        },
      });
    }

    // Check if 2FA is required but not verified
    if (user.securityPreferences.require2FA && !user.twoFactorEnabled) {
      return res.status(403).json({
        success: false,
        error: {
          message: "2FA setup required",
          code: "2FA_REQUIRED",
        },
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: {
        message: "Authentication failed",
        code: "AUTH_FAILED",
      },
    });
  }
};

// Admin role middleware
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: {
            message: "Admin access required",
            code: "ADMIN_REQUIRED",
          },
        });
      }
      next();
    });
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: {
        message: "Authentication failed",
        code: "AUTH_FAILED",
      },
    });
  }
};

module.exports = {
  auth,
  adminAuth,
};
