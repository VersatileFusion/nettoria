const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { User } = require("../models");
const jwt = require("jsonwebtoken");

// Generate 2FA secret
router.post("/2fa/generate", async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: "Nettoria",
    });

    // Store the secret in the user's record
    await User.findByIdAndUpdate(req.user.id, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to generate 2FA secret",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Verify and enable 2FA
router.post(
  "/2fa/verify",
  [body("token").isLength({ min: 6, max: 6 }).isNumeric()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid token",
            code: "INVALID_INPUT",
            details: errors.array(),
          },
        });
      }

      const user = await User.findById(req.user.id);
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: req.body.token,
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid 2FA token",
            code: "INVALID_TOKEN",
          },
        });
      }

      user.twoFactorEnabled = true;
      await user.save();

      res.json({
        success: true,
        message: "2FA enabled successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to verify 2FA",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Disable 2FA
router.post(
  "/2fa/disable",
  [body("token").isLength({ min: 6, max: 6 }).isNumeric()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid token",
            code: "INVALID_INPUT",
            details: errors.array(),
          },
        });
      }

      const user = await User.findById(req.user.id);
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: req.body.token,
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid 2FA token",
            code: "INVALID_TOKEN",
          },
        });
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      await user.save();

      res.json({
        success: true,
        message: "2FA disabled successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to disable 2FA",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Generate OTP
router.post("/otp/generate", async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60000); // 15 minutes

    await User.findByIdAndUpdate(req.user.id, {
      otp,
      otpExpiry: expiry,
    });

    // TODO: Send OTP via email/SMS
    // For development, we'll return the OTP
    res.json({
      success: true,
      message: "OTP generated successfully",
      data: { otp }, // Remove this in production
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to generate OTP",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Verify OTP
router.post(
  "/otp/verify",
  [body("otp").isLength({ min: 6, max: 6 }).isNumeric()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid OTP",
            code: "INVALID_INPUT",
            details: errors.array(),
          },
        });
      }

      const user = await User.findById(req.user.id);

      if (!user.otp || !user.otpExpiry) {
        return res.status(400).json({
          success: false,
          error: {
            message: "No OTP found",
            code: "NO_OTP",
          },
        });
      }

      if (user.otpExpiry < new Date()) {
        return res.status(400).json({
          success: false,
          error: {
            message: "OTP expired",
            code: "OTP_EXPIRED",
          },
        });
      }

      if (user.otp !== req.body.otp) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid OTP",
            code: "INVALID_OTP",
          },
        });
      }

      // Clear OTP after successful verification
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      res.json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to verify OTP",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// 2FA Login Verification
router.post(
  "/2fa/verify-login",
  [
    body("tempToken").notEmpty(),
    body("code").isLength({ min: 6, max: 6 }).isNumeric(),
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

      const { tempToken, code } = req.body;

      // Verify the temporary token
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (!decoded || !decoded.userId || !decoded.temp) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid or expired token",
            code: "INVALID_TOKEN",
          },
        });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid 2FA code",
            code: "INVALID_CODE",
          },
        });
      }

      // Generate final JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Create session
      const sessionData = {
        token,
        device: req.headers["user-agent"],
        ip: req.ip,
        lastActive: new Date(),
      };
      await user.addSession(sessionData);

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
        },
      });
    } catch (error) {
      console.error("2FA login verification error:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to verify 2FA login",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
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

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
          },
        });
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            message: "Invalid email or password",
            code: "INVALID_CREDENTIALS",
          },
        });
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Generate temporary token for 2FA verification
        const tempToken = jwt.sign(
          { userId: user._id, temp: true },
          process.env.JWT_SECRET,
          { expiresIn: "5m" }
        );

        return res.json({
          success: true,
          data: {
            requires2FA: true,
            tempToken,
          },
        });
      }

      // If 2FA is not enabled, proceed with normal login
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Create session
      const sessionData = {
        token,
        device: req.headers["user-agent"],
        ip: req.ip,
        lastActive: new Date(),
      };
      await user.addSession(sessionData);

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to login",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

module.exports = router;
