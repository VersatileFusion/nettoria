const express = require('express');
const router = express.Router();
const smsController = require('../controllers/sms.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/sms/verification/send:
 *   post:
 *     summary: Send verification code via SMS
 *     description: Sends a verification code to the specified phone number
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
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
 *                 description: The phone number to send the verification code to
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/verification/send', authMiddleware.authenticate, smsController.sendVerificationCode);

/**
 * @swagger
 * /api/sms/verification/verify:
 *   post:
 *     summary: Verify SMS code
 *     description: Verify a verification code that was sent to a user's phone
 *     tags: [SMS]
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
 *             properties:
 *               code:
 *                 type: string
 *                 description: The verification code to verify
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *       400:
 *         description: Invalid or expired verification code
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/verification/verify', authMiddleware.authenticate, smsController.verifyCode);

/**
 * @swagger
 * /api/sms/notification:
 *   post:
 *     summary: Send notification SMS
 *     description: Sends a custom notification SMS to the specified phone number
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number to send the SMS to
 *               message:
 *                 type: string
 *                 description: The message content to send
 *     responses:
 *       200:
 *         description: SMS notification sent successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/notification', authMiddleware.authenticate, authMiddleware.isAdmin, smsController.sendNotification);

/**
 * @swagger
 * /api/sms/credit:
 *   get:
 *     summary: Get SMS service credit
 *     description: Retrieves the remaining credit for the SMS service
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved SMS credit
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/credit', authMiddleware.authenticate, authMiddleware.isAdmin, smsController.getCredit);

module.exports = router; 