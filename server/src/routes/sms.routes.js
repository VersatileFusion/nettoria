const express = require("express");
const router = express.Router();
const smsController = require("../controllers/sms.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require('express-validator');
const SMSService = require('../services/sms.service');

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
router.post(
  "/verification/send",
  authMiddleware.authenticate,
  smsController.sendVerificationCode
);

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
router.post(
  "/verification/verify",
  authMiddleware.authenticate,
  smsController.verifyCode
);

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
router.post(
  "/notification",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  smsController.sendNotification
);

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
router.get("/credit", authMiddleware.authenticate, smsController.getCredit);

// Template Management
router.get(
  "/templates",
  authMiddleware.authenticate,
  smsController.getTemplates
);
router.post(
  "/templates",
  authMiddleware.authenticate,
  smsController.createTemplate
);
router.put(
  "/templates/:id",
  authMiddleware.authenticate,
  smsController.updateTemplate
);
router.delete(
  "/templates/:id",
  authMiddleware.authenticate,
  smsController.deleteTemplate
);

// SMS Sending
router.post('/send',
  authMiddleware.authenticate,
  [
    body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('templateId').optional().isUUID().withMessage('Invalid template ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, message, templateId } = req.body;
      const result = await SMSService.sendSMS(req.user.id, phoneNumber, message, templateId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post('/send-bulk',
  authMiddleware.authenticate,
  [
    body('phoneNumbers').isArray().withMessage('Phone numbers must be an array'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('templateId').optional().isUUID().withMessage('Invalid template ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumbers, message, templateId } = req.body;
      const result = await SMSService.sendBulkSMS(req.user.id, phoneNumbers, message, templateId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// SMS History
router.get('/history',
  authMiddleware.authenticate,
  [
    body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page = 1, limit = 10 } = req.query;
      const history = await SMSService.getHistory(req.user.id, page, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/status/:smsId',
  authMiddleware.authenticate,
  async (req, res) => {
    try {
      const { smsId } = req.params;
      const status = await SMSService.getStatus(req.user.id, smsId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get SMS categories
router.get('/categories',
  authMiddleware.authenticate,
  async (req, res) => {
    try {
      const categories = await SMSService.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get SMS statistics
router.get('/statistics',
  authMiddleware.authenticate,
  async (req, res) => {
    try {
      const statistics = await SMSService.getStatistics(req.user.id);
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
