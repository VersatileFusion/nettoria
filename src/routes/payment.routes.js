const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Create a payment request
 *     description: Creates a payment request for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order to pay
 *     responses:
 *       200:
 *         description: Payment request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 paymentUrl:
 *                   type: string
 *                   description: URL to redirect user for payment
 *                 authority:
 *                   type: string
 *                   description: ZarinPal authority code
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post('/create', authMiddleware.authenticate, paymentController.createPayment);

/**
 * @swagger
 * /api/payments/verify:
 *   get:
 *     summary: Verify payment
 *     description: Callback endpoint for ZarinPal to verify payment
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: Authority
 *         schema:
 *           type: string
 *         required: true
 *         description: ZarinPal authority code
 *       - in: query
 *         name: Status
 *         schema:
 *           type: string
 *         required: true
 *         description: ZarinPal status code
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The order ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       302:
 *         description: Redirects to success or failure page
 *       500:
 *         description: Server error
 */
router.get('/verify', paymentController.verifyPayment);

module.exports = router; 