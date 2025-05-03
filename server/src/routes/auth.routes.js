const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

console.log("Initializing Auth Routes...");

/**
 * @swagger
 * /api/auth/demo:
 *   get:
 *     summary: Demo endpoint for testing auth API
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Auth API is working
 */
router.get("/demo", (req, res) => {
  res.json({ message: "Auth API is working" });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request or user already exists
 */

/**
 * @swagger
 * /api/auth/verify-phone:
 *   post:
 *     summary: Verify phone number with OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - verificationCode
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phone verified successfully
 *       400:
 *         description: Invalid verification code
 */

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify email with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email/phone and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/request-login-otp:
 *   post:
 *     summary: Request OTP for login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/verify-login-otp:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - verificationCode
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified and login successful
 *       400:
 *         description: Invalid verification code
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/auth/update-profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               nationalId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/send-phone-verification:
 *   post:
 *     summary: Send phone verification code
 *     description: Sends a verification code to the user's phone number
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Phone already verified or invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Register
router.post("/register", authController.register);

// Verify phone
router.post("/verify-phone", authController.verifyPhone);

// Verify email
router.get("/verify-email/:token", authController.verifyEmail);

// Login
router.post("/login", authController.login);

// Request OTP for login
router.post("/request-login-otp", authController.requestLoginOTP);

// Verify OTP and login
router.post("/verify-login-otp", authController.verifyLoginOTP);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post("/reset-password/:token", authController.resetPassword);

// Get current user
router.get("/me", authMiddleware.protect, authController.getCurrentUser);

// Update user details
router.patch(
  "/update-me",
  authMiddleware.protect,
  authController.updateCurrentUser
);

// Update password
router.patch(
  "/update-password",
  authMiddleware.protect,
  authController.updatePassword
);

// Check token
router.get("/check-token", authMiddleware.protect, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Token is valid",
    data: {
      user: req.user,
    },
  });
});

// Send phone verification (protected)
router.post(
  "/send-phone-verification",
  authMiddleware.authenticate,
  authController.sendPhoneVerification
);

console.log("Auth Routes initialized successfully");

module.exports = router;
