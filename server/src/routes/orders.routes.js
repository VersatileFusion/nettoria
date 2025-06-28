const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 description: ID of the service to order
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 description: Quantity of the service
 *               billingCycle:
 *                 type: string
 *                 enum: [hourly, daily, weekly, monthly, quarterly, yearly]
 *                 default: monthly
 *                 description: Billing cycle for the order
 *               customConfig:
 *                 type: object
 *                 description: Custom configuration for the service
 *               notes:
 *                 type: string
 *                 description: Additional notes for the order
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 */
router.post("/",
    authMiddleware.protect,
    [
        body('serviceId').isInt().withMessage('Service ID must be a valid integer'),
        body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('billingCycle').optional().isIn(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid billing cycle')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors.array()
            });
        }
        next();
    },
    orderController.createOrder
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of user orders
 *       401:
 *         description: Unauthorized
 */
router.get("/",
    authMiddleware.protect,
    orderController.getUserOrders
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.get("/:id",
    authMiddleware.protect,
    orderController.getOrderById
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *                 description: New order status
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Order status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.put("/:id/status",
    authMiddleware.protect,
    [
        body('status').optional().isIn(['pending', 'processing', 'completed', 'cancelled']).withMessage('Invalid status')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors.array()
            });
        }
        next();
    },
    orderController.updateOrderStatus
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.post("/:id/cancel",
    authMiddleware.protect,
    orderController.cancelOrder
);

/**
 * @swagger
 * /api/orders/{id}/pay:
 *   post:
 *     summary: Pay for order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [wallet, credit_card, bank_transfer, crypto]
 *                 description: Payment method
 *               paymentDetails:
 *                 type: object
 *                 description: Payment method specific details
 *     responses:
 *       200:
 *         description: Payment successful
 *       400:
 *         description: Payment failed or order not pending payment
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.post("/:id/pay",
    authMiddleware.protect,
    [
        body('paymentMethod').isIn(['wallet', 'credit_card', 'bank_transfer', 'crypto']).withMessage('Invalid payment method')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors.array()
            });
        }
        next();
    },
    orderController.payOrder
);

/**
 * @swagger
 * /api/orders/{id}/discount:
 *   post:
 *     summary: Apply discount code to order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discountCode
 *             properties:
 *               discountCode:
 *                 type: string
 *                 description: Discount code to apply
 *     responses:
 *       200:
 *         description: Discount applied successfully
 *       400:
 *         description: Invalid discount code or order not eligible
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.post("/:id/discount",
    authMiddleware.protect,
    [
        body('discountCode').notEmpty().withMessage('Discount code is required')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors.array()
            });
        }
        next();
    },
    orderController.applyDiscount
);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/stats",
    authMiddleware.protect,
    orderController.getOrderStats
);

module.exports = router; 