const express = require("express");
const router = express.Router();
const successPasswordController = require("../controllers/success-password.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/success-password/set:
 *   post:
 *     summary: Set success password
 *     description: Set a new success password for the authenticated user
 *     tags: [Success Password]
 *     security:
 *       - bearerAuth: []
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
 *                 description: The new success password
 *     responses:
 *       200:
 *         description: Success password set successfully
 *       400:
 *         description: Invalid password format
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/set",
  authMiddleware.authenticate,
  successPasswordController.setSuccessPassword
);

/**
 * @swagger
 * /api/success-password/verify:
 *   post:
 *     summary: Verify success password
 *     description: Verify the success password for the authenticated user
 *     tags: [Success Password]
 *     security:
 *       - bearerAuth: []
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
 *                 description: The success password to verify
 *     responses:
 *       200:
 *         description: Success password verified successfully
 *       400:
 *         description: Success password not set
 *       401:
 *         description: Invalid success password
 *       500:
 *         description: Server error
 */
router.post(
  "/verify",
  authMiddleware.authenticate,
  successPasswordController.verifySuccessPassword
);

/**
 * @swagger
 * /api/success-password/reset:
 *   post:
 *     summary: Request success password reset
 *     description: Request a reset code for the success password
 *     tags: [Success Password]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reset code sent successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/reset",
  authMiddleware.authenticate,
  successPasswordController.resetSuccessPassword
);

/**
 * @swagger
 * /api/success-password/confirm-reset:
 *   post:
 *     summary: Confirm success password reset
 *     description: Reset the success password using the reset code
 *     tags: [Success Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - newPassword
 *             properties:
 *               code:
 *                 type: string
 *                 description: The reset code received via SMS
 *               newPassword:
 *                 type: string
 *                 description: The new success password
 *     responses:
 *       200:
 *         description: Success password reset successfully
 *       400:
 *         description: Invalid or expired reset code
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/confirm-reset",
  authMiddleware.authenticate,
  successPasswordController.confirmSuccessPasswordReset
);

module.exports = router;
