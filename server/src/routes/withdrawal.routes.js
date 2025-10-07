const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require("../middleware/auth");
const { validateWithdrawal } = require("../validations/withdrawal.validation");
const WithdrawalController = require("../controllers/withdrawal.controller");
const WithdrawalService = require('../services/withdrawal.service');

// Get withdrawal history
router.get(
  "/history",
  auth,
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
      const history = await WithdrawalService.getHistory(req.user.id, page, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Request withdrawal
router.post(
  "/request",
  auth,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('paymentMethodId').isUUID().withMessage('Invalid payment method ID'),
    body('accountDetails').isObject().withMessage('Account details must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, paymentMethodId, accountDetails } = req.body;
      const withdrawal = await WithdrawalService.requestWithdrawal(
        req.user.id,
        amount,
        paymentMethodId,
        accountDetails
      );
      res.json(withdrawal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get withdrawal status
router.get(
  "/status/:withdrawalId",
  auth,
  async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const status = await WithdrawalService.getStatus(req.user.id, withdrawalId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Cancel withdrawal request
router.post(
  "/cancel/:withdrawalId",
  auth,
  async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const withdrawal = await WithdrawalService.cancelWithdrawal(req.user.id, withdrawalId);
      res.json(withdrawal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get available payment methods
router.get('/payment-methods',
  auth,
  async (req, res) => {
    try {
      const methods = await WithdrawalService.getPaymentMethods(req.user.id);
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Add payment method
router.post('/payment-methods',
  auth,
  [
    body('type').isIn(['bank', 'crypto', 'paypal']).withMessage('Invalid payment method type'),
    body('details').isObject().withMessage('Details must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, details } = req.body;
      const method = await WithdrawalService.addPaymentMethod(req.user.id, type, details);
      res.json(method);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Remove payment method
router.delete('/payment-methods/:methodId',
  auth,
  async (req, res) => {
    try {
      const { methodId } = req.params;
      await WithdrawalService.removePaymentMethod(req.user.id, methodId);
      res.json({ message: 'Payment method removed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get withdrawal limits
router.get('/limits',
  auth,
  async (req, res) => {
    try {
      const limits = await WithdrawalService.getWithdrawalLimits(req.user.id);
      res.json(limits);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
