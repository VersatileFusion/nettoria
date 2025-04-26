const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

console.log("Initializing Payment Routes...");

/**
 * @swagger
 * /api/payments/demo:
 *   get:
 *     summary: Demo payment endpoint
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Demo payment data
 */
router.get("/demo", (req, res) => {
  res.json({
    message: "Payment API is working",
    demoPayment: {
      id: "demo-payment-1",
      amount: 100,
      currency: "USD",
      status: "pending",
      created: new Date()
    }
  });
});

/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     summary: Get available payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available payment methods
 *       401:
 *         description: Unauthorized
 */
router.get("/methods", authMiddleware.authenticate, (req, res) => {
  res.json({
    success: true,
    data: [
      { id: "credit-card", name: "Credit Card", enabled: true },
      { id: "bank-transfer", name: "Bank Transfer", enabled: true },
      { id: "paypal", name: "PayPal", enabled: true }
    ]
  });
});

console.log("Payment Routes initialized successfully");

module.exports = router; 