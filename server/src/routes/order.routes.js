const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

console.log("Initializing Order Routes...");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management for cloud services
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "ord-12345"
 *         userId:
 *           type: string
 *           example: "usr-67890"
 *         serviceId:
 *           type: string
 *           example: "svc-54321"
 *         serviceName:
 *           type: string
 *           example: "Web Hosting Plan"
 *         serviceType:
 *           type: string
 *           enum: [vm, database, storage, backup, cdn]
 *           example: "vm"
 *         plan:
 *           type: string
 *           enum: [basic, standard, premium, enterprise]
 *           example: "standard"
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, cancelled, failed]
 *           example: "pending"
 *         pricing:
 *           type: object
 *           properties:
 *             subtotal:
 *               type: number
 *               example: 29.99
 *             discount:
 *               type: number
 *               example: 0
 *             tax:
 *               type: number
 *               example: 3.00
 *             total:
 *               type: number
 *               example: 32.99
 *             currency:
 *               type: string
 *               example: "USD"
 *         billingCycle:
 *           type: string
 *           enum: [monthly, quarterly, annually]
 *           example: "monthly"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T10:45:00Z"
 *       required:
 *         - serviceId
 *         - plan
 *         - billingCycle
 *     PaymentMethod:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "pm-12345"
 *         type:
 *           type: string
 *           enum: [credit_card, paypal, bank_transfer, wallet]
 *           example: "credit_card"
 *         details:
 *           type: object
 *           properties:
 *             lastFour:
 *               type: string
 *               example: "4242"
 *             cardType:
 *               type: string
 *               example: "Visa"
 *             expiryMonth:
 *               type: string
 *               example: "12"
 *             expiryYear:
 *               type: string
 *               example: "2025"
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled, failed]
 *         description: Filter orders by status
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: [vm, database, storage, backup, cdn]
 *         description: Filter orders by service type
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 2
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pages:
 *                           type: integer
 *                           example: 1
 *       401:
 *         description: Not authenticated
 */
router.get("/", authMiddleware.protect, (req, res) => {
  console.log("Fetching orders for user ID:", req.user.id);
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const serviceType = req.query.serviceType;
  
  // Sample orders data
  const orders = [
    {
      id: "ord-12345",
      userId: req.user.id,
      serviceId: "svc-54321",
      serviceName: "Web Hosting Plan",
      serviceType: "vm",
      plan: "standard",
      status: "completed",
      pricing: {
        subtotal: 29.99,
        discount: 0,
        tax: 3.00,
        total: 32.99,
        currency: "USD"
      },
      billingCycle: "monthly",
      createdAt: "2023-06-15T10:30:00Z",
      updatedAt: "2023-06-15T10:45:00Z"
    },
    {
      id: "ord-67890",
      userId: req.user.id,
      serviceId: "svc-98765",
      serviceName: "Database Service",
      serviceType: "database",
      plan: "premium",
      status: "pending",
      pricing: {
        subtotal: 49.99,
        discount: 5.00,
        tax: 4.50,
        total: 49.49,
        currency: "USD"
      },
      billingCycle: "monthly",
      createdAt: "2023-07-01T14:20:00Z",
      updatedAt: "2023-07-01T14:20:00Z"
    },
    {
      id: "ord-24680",
      userId: req.user.id,
      serviceId: "svc-13579",
      serviceName: "Storage Bucket",
      serviceType: "storage",
      plan: "basic",
      status: "cancelled",
      pricing: {
        subtotal: 19.99,
        discount: 0,
        tax: 2.00,
        total: 21.99,
        currency: "USD"
      },
      billingCycle: "monthly",
      createdAt: "2023-05-10T09:15:00Z",
      updatedAt: "2023-05-12T11:30:00Z"
    }
  ];
  
  // Apply filters
  let filteredOrders = [...orders];
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  if (serviceType) {
    filteredOrders = filteredOrders.filter(order => order.serviceType === serviceType);
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  res.status(200).json({
    status: "success",
    data: {
      orders: paginatedOrders,
      pagination: {
        total: orders.length,
        page: page,
        limit: limit,
        pages: Math.ceil(orders.length / limit)
      }
    }
  });
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this order
 */
router.get("/:id", authMiddleware.protect, (req, res) => {
  console.log(`Fetching order with ID: ${req.params.id} for user: ${req.user.id}`);
  
  const orderId = req.params.id;
  
  // Sample orders data
  const orders = {
    "ord-12345": {
      id: "ord-12345",
      userId: req.user.id,
      serviceId: "svc-54321",
      serviceName: "Web Hosting Plan",
      serviceType: "vm",
      plan: "standard",
      status: "completed",
      pricing: {
        subtotal: 29.99,
        discount: 0,
        tax: 3.00,
        total: 32.99,
        currency: "USD"
      },
      billingCycle: "monthly",
      createdAt: "2023-06-15T10:30:00Z",
      updatedAt: "2023-06-15T10:45:00Z",
      paymentMethod: {
        id: "pm-12345",
        type: "credit_card",
        details: {
          lastFour: "4242",
          cardType: "Visa",
          expiryMonth: "12",
          expiryYear: "2025"
        }
      },
      invoiceUrl: "https://example.com/invoices/inv-12345.pdf"
    },
    "ord-67890": {
      id: "ord-67890",
      userId: "usr-98765", // Different user
      serviceId: "svc-98765",
      serviceName: "Database Service",
      serviceType: "database",
      plan: "premium",
      status: "pending",
      pricing: {
        subtotal: 49.99,
        discount: 5.00,
        tax: 4.50,
        total: 49.49,
        currency: "USD"
      },
      billingCycle: "monthly",
      createdAt: "2023-07-01T14:20:00Z",
      updatedAt: "2023-07-01T14:20:00Z"
    }
  };
  
  // Check if order exists
  if (!orders[orderId]) {
    return res.status(404).json({
      status: "error",
      message: "Order not found"
    });
  }
  
  const order = orders[orderId];
  
  // Check if the order belongs to the authenticated user or if user is admin
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to view this order"
    });
  }
  
  res.status(200).json({
    status: "success",
    data: {
      order
    }
  });
});

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
 *               - plan
 *               - billingCycle
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: "svc-54321"
 *               plan:
 *                 type: string
 *                 enum: [basic, standard, premium, enterprise]
 *                 example: "standard"
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, quarterly, annually]
 *                 example: "monthly"
 *               paymentMethodId:
 *                 type: string
 *                 example: "pm-12345"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authenticated
 */
router.post("/", authMiddleware.protect, (req, res) => {
  console.log(`Creating new order for user ID: ${req.user.id}`, req.body);
  
  const { serviceId, plan, billingCycle, paymentMethodId } = req.body;
  
  // Validate required fields
  if (!serviceId || !plan || !billingCycle) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: serviceId, plan, and billingCycle are required"
    });
  }
  
  // Validate plan
  const validPlans = ["basic", "standard", "premium", "enterprise"];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid plan. Must be one of: ${validPlans.join(", ")}`
    });
  }
  
  // Validate billing cycle
  const validBillingCycles = ["monthly", "quarterly", "annually"];
  if (!validBillingCycles.includes(billingCycle)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid billing cycle. Must be one of: ${validBillingCycles.join(", ")}`
    });
  }
  
  // Mock service retrieval based on ID
  const services = {
    "svc-54321": {
      id: "svc-54321",
      name: "Web Hosting Plan",
      type: "vm",
      plans: {
        basic: 19.99,
        standard: 29.99,
        premium: 49.99,
        enterprise: 99.99
      }
    }
  };
  
  // Check if service exists
  if (!services[serviceId]) {
    return res.status(404).json({
      status: "error",
      message: "Service not found"
    });
  }
  
  const service = services[serviceId];
  
  // Calculate pricing
  const basePrice = service.plans[plan];
  let subtotal = basePrice;
  let discount = 0;
  
  // Apply billing cycle discounts
  switch (billingCycle) {
    case "quarterly":
      subtotal = basePrice * 3;
      discount = subtotal * 0.05; // 5% discount
      break;
    case "annually":
      subtotal = basePrice * 12;
      discount = subtotal * 0.1; // 10% discount
      break;
    default:
      // Monthly - no discount
      break;
  }
  
  const tax = (subtotal - discount) * 0.1; // 10% tax
  const total = subtotal - discount + tax;
  
  // Generate order ID
  const orderId = `ord-${Math.floor(Math.random() * 100000)}`;
  
  // Create new order
  const newOrder = {
    id: orderId,
    userId: req.user.id,
    serviceId,
    serviceName: service.name,
    serviceType: service.type,
    plan,
    status: "pending",
    pricing: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      currency: "USD"
    },
    billingCycle,
    paymentMethodId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    status: "success",
    data: {
      order: newOrder
    }
  });
});

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Changed my mind"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request or order cannot be cancelled
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to cancel this order
 */
router.patch("/:id/cancel", authMiddleware.protect, (req, res) => {
  console.log(`Cancelling order with ID: ${req.params.id}`, req.body);
  
  const orderId = req.params.id;
  const { reason } = req.body;
  
  // Validate reason
  if (!reason) {
    return res.status(400).json({
      status: "error",
      message: "Cancellation reason is required"
    });
  }
  
  // Sample orders data
  const orders = {
    "ord-12345": {
      id: "ord-12345",
      userId: req.user.id,
      serviceId: "svc-54321",
      serviceName: "Web Hosting Plan",
      serviceType: "vm",
      plan: "standard",
      status: "completed",
      pricing: {
        subtotal: 29.99,
        discount: 0,
        tax: 3.00,
        total: 32.99,
        currency: "USD"
      },
      billingCycle: "monthly",
      createdAt: "2023-06-15T10:30:00Z",
      updatedAt: "2023-06-15T10:45:00Z"
    },
    "ord-67890": {
      id: "ord-67890",
      userId: req.user.id,
      serviceId: "svc-98765",
      serviceName: "Database Service",
      serviceType: "database",
      plan: "premium",
      status: "pending",
      pricing: {
        subtotal: 49.99,
        discount: 5.00,
        tax: 4.50,
        total: 49.49,
        currency: "USD"
      },
      billingCycle: "monthly",
      createdAt: "2023-07-01T14:20:00Z",
      updatedAt: "2023-07-01T14:20:00Z"
    }
  };
  
  // Check if order exists
  if (!orders[orderId]) {
    return res.status(404).json({
      status: "error",
      message: "Order not found"
    });
  }
  
  const order = orders[orderId];
  
  // Check if the order belongs to the authenticated user or if user is admin
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to cancel this order"
    });
  }
  
  // Update order status to cancelled
  order.status = "cancelled";
  order.updatedAt = new Date().toISOString();
  
  res.status(200).json({
    status: "success",
    message: "Order cancelled successfully",
    data: {
      order
    }
  });
});

/**
 * @swagger
 * /api/orders/{id}/pay:
 *   post:
 *     summary: Pay for an order
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
 *                 enum: [credit_card, wallet]
 *                 example: credit_card
 *               paymentDetails:
 *                 type: object
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *                     example: '4111111111111111'
 *                   cardExpiry:
 *                     type: string
 *                     example: '12/25'
 *                   cardCvv:
 *                     type: string
 *                     example: '123'
 *     responses:
 *       200:
 *         description: Payment successful
 *       400:
 *         description: Invalid request or payment failed
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authenticated
 */
router.post("/:id/pay", authMiddleware.protect, (req, res) => {
  console.log(`Processing payment for order ${req.params.id}`, req.body);

  // For demo purposes, we'll just return success
  res.status(200).json({
    status: "success",
    message: "Payment processed successfully",
    data: {
      order: {
        id: parseInt(req.params.id),
        status: "paid",
        paymentStatus: "paid",
        paymentMethod: req.body.paymentMethod,
        paymentTransactionId:
          "txn_" + Math.random().toString(36).substring(2, 15),
        paidAt: new Date().toISOString(),
      },
    },
  });
});

/**
 * @swagger
 * /api/orders/{id}/renew:
 *   post:
 *     summary: Renew a service order
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
 *               billingPeriod:
 *                 type: string
 *                 enum: [monthly, quarterly, semiannual, annual]
 *                 example: monthly
 *               autoRenew:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Service renewed successfully
 *       400:
 *         description: Cannot renew this service
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authenticated
 */
router.post("/:id/renew", authMiddleware.protect, (req, res) => {
  console.log(`Renewing service for order ${req.params.id}`, req.body);

  // For demo purposes, we'll just return success
  res.status(200).json({
    status: "success",
    message: "Service renewed successfully",
    data: {
      order: {
        id: parseInt(req.params.id),
        status: "paid",
        billingPeriod: req.body.billingPeriod || "monthly",
        autoRenew: req.body.autoRenew || false,
        validFrom: new Date().toISOString(),
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days ahead
      },
    },
  });
});

// For demonstration only - mock endpoint
router.get("/demo", (req, res) => {
  res.json({
    message: "Orders API is working (mock mode)",
    orders: [
      { id: 1, service: "Demo VM", total: 21.6, status: "pending" },
      { id: 2, service: "Demo Storage", total: 0.72, status: "paid" },
    ],
  });
});

console.log("Order Routes initialized successfully");

module.exports = router;
