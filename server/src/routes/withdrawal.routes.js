const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { validateWithdrawal } = require("../validations/withdrawal.validation");
const WithdrawalController = require("../controllers/withdrawal.controller");

// Get withdrawal history
router.get(
  "/history",
  authenticateToken,
  WithdrawalController.getWithdrawalHistory
);

// Request withdrawal
router.post(
  "/request",
  authenticateToken,
  validateWithdrawal,
  WithdrawalController.requestWithdrawal
);

// Get withdrawal status
router.get(
  "/status/:withdrawalId",
  authenticateToken,
  WithdrawalController.getWithdrawalStatus
);

// Cancel withdrawal request
router.post(
  "/cancel/:withdrawalId",
  authenticateToken,
  WithdrawalController.cancelWithdrawal
);

module.exports = router;
