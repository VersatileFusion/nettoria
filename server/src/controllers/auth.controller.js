const User = require("../models/user.model");
const authUtils = require("../utils/auth.utils");
const { Sequelize } = require("sequelize");
const NotificationUtil = require("../utils/notification.util");
const logger = require("../utils/logger");
const smsService = require("../services/sms.service");
const { AppError, createErrorResponse } = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { sendEmail } = require('../utils/email');
const { generateToken } = require('../utils/token');

console.log("Initializing Auth Controller...");

// Define all controller methods upfront
const authController = {
  // Register new user
  register: async (req, res) => {
    console.log("Processing registration request", req.body);
    try {
      const { firstName, lastName, email, phoneNumber, password, role } = req.body;
      console.log("Received registration data:", { firstName, lastName, email, phoneNumber, role });

      // Validate required fields
      if (!firstName || !lastName || !email || !phoneNumber || !password) {
        return res.status(400).json({
          status: "error",
          message: "Please provide all required fields: firstName, lastName, email, phoneNumber, password",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Sequelize.Op.or]: [{ email }, { phoneNumber }],
        },
      });

      if (existingUser) {
        console.log(`Registration failed: User with email ${email} or phone ${phoneNumber} already exists`);
        return res.status(400).json({
          status: "error",
          message: "User with this email or phone number already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user with pending status
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        role: role || "user",
        status: "pending",
      });

      console.log(`User created with ID: ${newUser.id} - pending OTP verification`);

      // Generate verification code for phone
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      newUser.phoneVerificationCode = verificationCode;
      newUser.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await newUser.save();

      // Log the OTP code in terminal for testing
      console.log("\n=== OTP CODE FOR TESTING ===");
      console.log(`Phone Number: ${phoneNumber}`);
      console.log(`OTP Code: ${verificationCode}`);
      console.log("===========================\n");

      // Send SMS verification
      try {
        await smsService.sendVerificationCode(phoneNumber, verificationCode);
        console.log(`Verification SMS sent to ${phoneNumber}`);
      } catch (smsError) {
        console.error("Error sending verification SMS:", smsError);
        // Continue with registration even if SMS fails, but notify the user
        return res.status(201).json({
          status: "warning",
          message: "Registration created but SMS verification could not be sent. Please contact support.",
          data: {
            userId: newUser.id,
            phoneNumber: newUser.phoneNumber,
          },
        });
      }

      // Generate verification token
      const verificationToken = generateToken();

      // Save verification token
      await newUser.update({ verificationToken });

      // Send verification email
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        text: `Please verify your email by clicking this link: ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
      });

      // Return response without generating token yet
      res.status(201).json({
        status: "success",
        message: "Registration initiated. Please verify your phone number with the OTP sent and your email.",
        data: {
          userId: newUser.id,
          phoneNumber: newUser.phoneNumber,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        status: "error",
        message: "Registration failed",
        error: error.message,
      });
    }
  },

  // Verify phone number after registration
  verifyPhone: async (req, res) => {
    console.log("Processing phone verification request", req.body);

    try {
      const { phoneNumber, verificationCode } = req.body;

      // Find user by phone number
      const user = await User.findOne({
        where: { phoneNumber },
      });

      if (!user) {
        console.log(
          `Phone verification failed: User with phone ${phoneNumber} not found`
        );
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Check if verification code is valid and not expired
      if (
        !user.phoneVerificationCode ||
        user.phoneVerificationCode !== verificationCode ||
        !user.phoneVerificationExpires ||
        user.phoneVerificationExpires < new Date()
      ) {
        console.log(
          `Phone verification failed: Invalid or expired code for ${phoneNumber}`
        );
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired verification code",
        });
      }

      // Update user status
      user.isPhoneVerified = true;
      user.phoneVerificationCode = null;
      user.status = "active"; // Activate the user
      await user.save();

      console.log(`Phone verification successful for ${phoneNumber}`);

      // Generate token now that the user is verified
      const token = authUtils.generateToken(user);

      // Generate email verification token and send email (optional)
      const emailVerificationToken = authUtils.generateRandomToken();
      user.emailVerificationToken = emailVerificationToken;
      await user.save();

      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/auth/verify-email/${emailVerificationToken}`;

      try {
        await authUtils.sendVerificationEmail(user, verificationUrl);
      } catch (emailError) {
        console.error("Email verification sending failed:", emailError);
        // Continue even if email fails
      }

      res.status(200).json({
        status: "success",
        message: "Phone verified successfully. You can now log in.",
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isPhoneVerified: user.isPhoneVerified,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Phone verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Phone verification failed",
        error: error.message,
      });
    }
  },

  // Request OTP for login
  requestLoginOTP: async (req, res) => {
    console.log("Processing login OTP request", req.body);

    try {
      const { phoneNumber } = req.body;

      // Generate verification code
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Log the OTP code in terminal for testing
      console.log("\n=== OTP CODE FOR TESTING ===");
      console.log(`Phone Number: ${phoneNumber}`);
      console.log(`OTP Code: ${verificationCode}`);
      console.log("===========================\n");

      // In development mode, always return the OTP code
      return res.status(200).json({
        status: "success",
        message: "Verification code sent successfully (Development Mode)",
        data: {
          phoneNumber,
          verificationCode,
          expiresIn: "2 minutes",
        },
      });

      // Note: SMS sending is disabled in development mode
      // try {
      //   await smsService.sendVerificationCode(phoneNumber, verificationCode);
      //   console.log(`Verification SMS sent to ${phoneNumber}`);
      // } catch (smsError) {
      //   console.error("Error sending verification SMS:", smsError);
      //   return res.status(200).json({
      //     status: "success",
      //     message: "Verification code sent successfully (Development Mode)",
      //     data: {
      //       phoneNumber,
      //       verificationCode,
      //       expiresIn: "2 minutes"
      //     }
      //   });
      // }

      // res.status(200).json({
      //   status: "success",
      //   message: "Verification code sent successfully",
      //   data: {
      //     phoneNumber,
      //     expiresIn: "2 minutes"
      //   }
      // });
    } catch (error) {
      console.error("Login OTP request error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to process OTP request",
        error: error.message,
      });
    }
  },

  // Verify login OTP
  verifyLoginOTP: async (req, res) => {
    console.log("Processing login OTP verification", req.body);

    try {
      const { phoneNumber, verificationCode } = req.body;

      // For now, we'll just check if the code matches what was sent
      // In a real implementation, you would verify against stored code
      const isValid = true; // This should be replaced with actual verification

      if (!isValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid verification code",
        });
      }

      // Generate a temporary token for the user
      const token = authUtils.generateToken({
        phoneNumber,
        isTemporary: true,
      });

      res.status(200).json({
        status: "success",
        message: "Login successful",
        data: {
          token,
          phoneNumber,
        },
      });
    } catch (error) {
      console.error("Login OTP verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to verify OTP",
        error: error.message,
      });
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    console.log("Processing email verification request", req.params);

    try {
      const { token } = req.params;

      // Find user by email verification token
      const user = await User.findOne({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        console.log(`Email verification failed: Invalid token ${token}`);
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired token",
        });
      }

      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await user.save();

      console.log(`Email verification successful for ${user.email}`);

      res.status(200).json({
        status: "success",
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Email verification failed",
        error: error.message,
      });
    }
  },

  // Login with email/phone and password
  login: async (req, res) => {
    console.log("Processing login request", req.body);
    try {
      const { identifier, password } = req.body;
      console.log("Received login data:", { identifier });

      if (!identifier || !password) {
        console.log("Login failed: Missing identifier or password");
        return res.status(400).json({
          status: "error",
          message: "Please provide email/phone and password",
        });
      }

      // Find user by email or phone
      const user = await User.findOne({
        where: {
          [Sequelize.Op.or]: [
            { email: identifier },
            { phoneNumber: identifier },
          ],
        },
      });

      if (!user || !(await user.comparePassword(password))) {
        console.log(`Login failed: Invalid credentials for ${identifier}`);
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Validate user status
      if (user.status === "pending") {
        return res.status(403).json({
          status: "error",
          message: "Your account is pending verification. Please verify your phone number first.",
          data: {
            requiresPhoneVerification: true,
            phoneNumber: user.phoneNumber,
          },
        });
      }

      if (user.status === "suspended" || user.status === "blocked") {
        return res.status(403).json({
          status: "error",
          message: `Your account is ${user.status}. Please contact support.`,
        });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw new AppError(401, 'Please verify your email first');
      }

      // Check if 2FA is enabled
      if (user.is2FAEnabled) {
        // Generate temporary token for 2FA
        const tempToken = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );

        res.cookie('temp_token', tempToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 5 * 60 * 1000 // 5 minutes
        });

        return res.json({
          success: true,
          requires2FA: true,
          message: '2FA verification required'
        });
      }

      // Generate token
      const token = authUtils.generateToken(user);

      // Set cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.status(200).json({
        status: "success",
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: "error",
        message: "Login failed",
        error: error.message,
      });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    console.log("Processing forgot password request", req.body);

    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        console.log(
          `Forgot password failed: User with email ${email} not found`
        );
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Generate password reset token
      const resetToken = authUtils.generateRandomToken();
      user.passwordResetToken = resetToken;

      // Set expiration time (10 minutes)
      user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Send password reset email
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/auth/reset-password/${resetToken}`;
      await authUtils.sendPasswordResetEmail(user, resetUrl);

      console.log(`Password reset email sent to ${email}`);

      res.status(200).json({
        status: "success",
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to send password reset email",
        error: error.message,
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    console.log("Processing reset password request", req.params, req.body);

    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find user by reset token and check if token is expired
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Sequelize.Op.gt]: new Date() },
        },
      });

      if (!user) {
        console.log(`Reset password failed: Invalid or expired token ${token}`);
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired token",
        });
      }

      // Update password and reset token fields
      user.password = password;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      console.log(`Password reset successful for ${user.email}`);

      // Generate token for automatic login
      const authToken = authUtils.generateToken(user);

      res.status(200).json({
        status: "success",
        message: "Password reset successful",
        data: {
          token: authToken,
        },
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to reset password",
        error: error.message,
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    console.log("Processing profile update request", req.user.id, req.body);

    try {
      // Fields that can be updated
      const { firstName, lastName, nationalId } = req.body;

      // Find user by ID (from JWT)
      const user = await User.findByPk(req.user.id);

      if (!user) {
        console.log(
          `Profile update failed: User with ID ${req.user.id} not found`
        );
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Update user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (nationalId) user.nationalId = nationalId;

      await user.save();

      console.log(`Profile updated for user ${user.email}`);

      res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isPhoneVerified: user.isPhoneVerified,
            isEmailVerified: user.isEmailVerified,
            nationalId: user.nationalId,
          },
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update profile",
        error: error.message,
      });
    }
  },

  // Send phone verification code
  sendPhoneVerification: async (req, res) => {
    console.log("Processing phone verification send request", req.body);

    try {
      const { phoneNumber } = req.body;
      const user = req.user;

      // Generate verification code
      const verificationCode = user.generateVerificationCode();
      await user.save();

      // Send SMS verification
      await authUtils.sendSmsVerification(phoneNumber, verificationCode);

      res.status(200).json({
        status: "success",
        message: "Verification code sent to your phone number",
      });
    } catch (error) {
      console.error("Send phone verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to send verification code",
        error: error.message,
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    console.log("Getting current user profile", req.user.id);

    try {
      res.status(200).json({
        status: "success",
        data: {
          user: {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            phoneNumber: req.user.phoneNumber,
            isPhoneVerified: req.user.isPhoneVerified,
            isEmailVerified: req.user.isEmailVerified,
            nationalId: req.user.nationalId,
            role: req.user.role,
            status: req.user.status,
          },
        },
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to get user profile",
        error: error.message,
      });
    }
  },

  // Update current user
  updateCurrentUser: async (req, res) => {
    console.log("Processing update user request", req.user.id, req.body);

    try {
      // Fields that can be updated
      const { firstName, lastName, nationalId } = req.body;

      // Update user fields
      if (firstName) req.user.firstName = firstName;
      if (lastName) req.user.lastName = lastName;
      if (nationalId) req.user.nationalId = nationalId;

      await req.user.save();

      console.log(`User profile updated for ${req.user.email}`);

      res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        data: {
          user: {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            phoneNumber: req.user.phoneNumber,
            isPhoneVerified: req.user.isPhoneVerified,
            isEmailVerified: req.user.isEmailVerified,
            nationalId: req.user.nationalId,
            role: req.user.role,
            status: req.user.status,
          },
        },
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update profile",
        error: error.message,
      });
    }
  },

  // Update password
  updatePassword: async (req, res) => {
    console.log("Processing password update request", req.user.id);

    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: "error",
          message: "Please provide current and new password",
        });
      }

      // Verify current password
      if (!(await req.user.comparePassword(currentPassword))) {
        return res.status(401).json({
          status: "error",
          message: "Current password is incorrect",
        });
      }

      // Update password
      req.user.password = newPassword;
      await req.user.save();

      // Generate new token
      const token = authUtils.generateToken(req.user);

      console.log(`Password updated for ${req.user.email}`);

      res.status(200).json({
        status: "success",
        message: "Password updated successfully",
        data: { token },
      });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update password",
        error: error.message,
      });
    }
  },

  // Setup 2FA
  setup2FA: async (req, res) => {
    try {
      const userId = req.user.userId;

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Nettoria:${req.user.email}`
      });

      // Save secret to user
      await User.update(
        { twoFactorSecret: secret.base32 },
        { where: { id: userId } }
      );

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      res.json({
        success: true,
        data: {
          secret: secret.base32,
          qrCode
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify 2FA
  verify2FA: async (req, res) => {
    try {
      const { code } = req.body;
      const tempToken = req.cookies.temp_token;

      if (!tempToken) {
        throw new AppError(401, 'Invalid or expired session');
      }

      // Verify temp token
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        throw new AppError(401, 'User not found');
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code
      });

      if (!verified) {
        throw new AppError(401, 'Invalid 2FA code');
      }

      // Generate final JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Clear temp token
      res.clearCookie('temp_token');

      // Set auth token
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        success: true,
        message: '2FA verification successful',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Request password reset
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal that user doesn't exist
        return res.json({
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link'
        });
      }

      // Generate reset token
      const resetToken = generateToken();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token
      await user.update({
        resetToken,
        resetTokenExpiry
      });

      // Send reset email
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        text: `Please reset your password by clicking this link: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      });

      res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: { [Sequelize.Op.gt]: Date.now() }
        }
      });

      if (!user) {
        throw new AppError(400, 'Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await user.update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });

      res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout
  logout: async (req, res) => {
    res.clearCookie('auth_token');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

// Export all controller methods
module.exports = authController;

console.log("Auth Controller initialized successfully");
