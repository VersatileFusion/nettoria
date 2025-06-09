const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth } = require("../middleware/auth");

// Get security preferences
router.get("/preferences", auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        preferences: req.user.securityPreferences,
        twoFactorEnabled: req.user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Get security preferences error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get security preferences",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Update security preferences
router.put(
  "/preferences",
  [
    auth,
    body("require2FA").optional().isBoolean(),
    body("sessionTimeout").optional().isInt({ min: 1, max: 168 }), // 1 hour to 1 week
    body("maxSessions").optional().isInt({ min: 1, max: 10 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid input",
            code: "INVALID_INPUT",
            details: errors.array(),
          },
        });
      }

      const { require2FA, sessionTimeout, maxSessions } = req.body;

      // If enabling require2FA, check if 2FA is already set up
      if (require2FA && !req.user.twoFactorEnabled) {
        return res.status(400).json({
          success: false,
          error: {
            message: "2FA must be enabled before requiring it",
            code: "2FA_NOT_SETUP",
          },
        });
      }

      await req.user.updateSecurityPreferences({
        require2FA,
        sessionTimeout,
        maxSessions,
      });

      res.json({
        success: true,
        data: {
          preferences: req.user.securityPreferences,
        },
      });
    } catch (error) {
      console.error("Update security preferences error:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to update security preferences",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Get active sessions
router.get("/sessions", auth, async (req, res) => {
  try {
    const activeSessions = req.user.getActiveSessions();

    res.json({
      success: true,
      data: {
        sessions: activeSessions.map((session) => ({
          device: session.device,
          ip: session.ip,
          lastActive: session.lastActive,
          createdAt: session.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get sessions",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Terminate session
router.delete("/sessions/:token", auth, async (req, res) => {
  try {
    const { token } = req.params;

    // Don't allow terminating the current session
    if (token === req.token) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Cannot terminate current session",
          code: "INVALID_OPERATION",
        },
      });
    }

    await req.user.removeSession(token);

    res.json({
      success: true,
      data: {
        message: "Session terminated successfully",
      },
    });
  } catch (error) {
    console.error("Terminate session error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to terminate session",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Terminate all other sessions
router.delete("/sessions", auth, async (req, res) => {
  try {
    // Keep only the current session
    req.user.sessions = req.user.sessions.filter((s) => s.token === req.token);
    await req.user.save();

    res.json({
      success: true,
      data: {
        message: "All other sessions terminated successfully",
      },
    });
  } catch (error) {
    console.error("Terminate all sessions error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to terminate sessions",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

module.exports = router;
