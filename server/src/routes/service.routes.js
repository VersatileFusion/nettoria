const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

console.log("Initializing Service Routes...");

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Cloud service management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "svc-12345"
 *         name:
 *           type: string
 *           example: "Web Hosting Plan"
 *         type:
 *           type: string
 *           enum: [vm, database, storage, backup, cdn]
 *           example: "vm"
 *         plan:
 *           type: string
 *           enum: [basic, standard, premium, enterprise]
 *           example: "standard"
 *         status:
 *           type: string
 *           enum: [active, pending, suspended, terminated]
 *           example: "active"
 *         resources:
 *           type: object
 *           properties:
 *             cpu:
 *               type: integer
 *               example: 2
 *             memoryGB:
 *               type: integer
 *               example: 4
 *             storageGB:
 *               type: integer
 *               example: 100
 *             bandwidth:
 *               type: integer
 *               example: 1000
 *         price:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               example: 29.99
 *             currency:
 *               type: string
 *               example: "USD"
 *             billingCycle:
 *               type: string
 *               enum: [monthly, quarterly, annually]
 *               example: "monthly"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-15T08:30:00Z"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T08:30:00Z"
 *       required:
 *         - name
 *         - type
 *         - plan
 *         - status
 *         - resources
 *         - price
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services for authenticated user
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, pending, suspended, terminated]
 *         description: Filter services by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [vm, database, storage, backup, cdn]
 *         description: Filter services by type
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
 *         description: Number of services per page
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *       401:
 *         description: Not authenticated
 */
router.get("/", authMiddleware.protect, (req, res) => {
  console.log("Fetching services for user ID:", req.user.id);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const type = req.query.type;

  // Sample services data
  const services = [
    {
      id: "svc-12345",
      name: "Web Hosting Plan",
      type: "vm",
      plan: "standard",
      status: "active",
      resources: {
        cpu: 2,
        memoryGB: 4,
        storageGB: 100,
        bandwidth: 1000,
      },
      price: {
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      createdAt: "2023-01-15T08:30:00Z",
      expiresAt: "2024-01-15T08:30:00Z",
    },
    {
      id: "svc-67890",
      name: "Database Service",
      type: "database",
      plan: "premium",
      status: "active",
      resources: {
        cpu: 4,
        memoryGB: 8,
        storageGB: 200,
        bandwidth: 2000,
      },
      price: {
        amount: 49.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      createdAt: "2023-02-20T10:15:00Z",
      expiresAt: "2024-02-20T10:15:00Z",
    },
    {
      id: "svc-24680",
      name: "Storage Bucket",
      type: "storage",
      plan: "basic",
      status: "pending",
      resources: {
        storageGB: 500,
        bandwidth: 5000,
      },
      price: {
        amount: 19.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      createdAt: "2023-05-10T14:45:00Z",
      expiresAt: "2024-05-10T14:45:00Z",
    },
  ];

  // Apply filters
  let filteredServices = [...services];
  if (status) {
    filteredServices = filteredServices.filter(
      (service) => service.status === status
    );
  }
  if (type) {
    filteredServices = filteredServices.filter(
      (service) => service.type === type
    );
  }

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  res.status(200).json({
    status: "success",
    results: paginatedServices.length,
    data: {
      services: paginatedServices,
    },
  });
});

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get a specific service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
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
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *       401:
 *         description: Not authenticated
 */
router.get("/:id", authMiddleware.protect, (req, res) => {
  console.log(
    `Fetching service with ID: ${req.params.id} for user: ${req.user.id}`
  );

  const serviceId = req.params.id;

  // Sample services data
  const services = {
    "svc-12345": {
      id: "svc-12345",
      name: "Web Hosting Plan",
      type: "vm",
      plan: "standard",
      status: "active",
      resources: {
        cpu: 2,
        memoryGB: 4,
        storageGB: 100,
        bandwidth: 1000,
      },
      price: {
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      createdAt: "2023-01-15T08:30:00Z",
      expiresAt: "2024-01-15T08:30:00Z",
    },
    "svc-67890": {
      id: "svc-67890",
      name: "Database Service",
      type: "database",
      plan: "premium",
      status: "active",
      resources: {
        cpu: 4,
        memoryGB: 8,
        storageGB: 200,
        bandwidth: 2000,
      },
      price: {
        amount: 49.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      createdAt: "2023-02-20T10:15:00Z",
      expiresAt: "2024-02-20T10:15:00Z",
    },
  };

  // Check if service exists
  if (!services[serviceId]) {
    return res.status(404).json({
      status: "error",
      message: "Service not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      service: services[serviceId],
    },
  });
});

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - plan
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My New Service"
 *               type:
 *                 type: string
 *                 enum: [vm, database, storage, backup, cdn]
 *                 example: "vm"
 *               plan:
 *                 type: string
 *                 enum: [basic, standard, premium, enterprise]
 *                 example: "standard"
 *               resources:
 *                 type: object
 *                 properties:
 *                   cpu:
 *                     type: integer
 *                     example: 2
 *                   memoryGB:
 *                     type: integer
 *                     example: 4
 *                   storageGB:
 *                     type: integer
 *                     example: 100
 *     responses:
 *       201:
 *         description: Service created successfully
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
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authenticated
 */
router.post("/", authMiddleware.protect, (req, res) => {
  console.log(`Creating new service for user ID: ${req.user.id}`, req.body);

  const { name, type, plan, resources } = req.body;

  // Validate required fields
  if (!name || !type || !plan) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: name, type, and plan are required",
    });
  }

  // Validate service type
  const validTypes = ["vm", "database", "storage", "backup", "cdn"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid service type. Must be one of: ${validTypes.join(", ")}`,
    });
  }

  // Validate service plan
  const validPlans = ["basic", "standard", "premium", "enterprise"];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid service plan. Must be one of: ${validPlans.join(", ")}`,
    });
  }

  // Generate service ID
  const serviceId = `svc-${Math.floor(Math.random() * 100000)}`;

  // Create price object based on plan
  let price = {
    currency: "USD",
    billingCycle: "monthly",
  };

  switch (plan) {
    case "basic":
      price.amount = 19.99;
      break;
    case "standard":
      price.amount = 29.99;
      break;
    case "premium":
      price.amount = 49.99;
      break;
    case "enterprise":
      price.amount = 99.99;
      break;
  }

  // Create default resources based on plan if not provided
  const defaultResources = {
    basic: { cpu: 1, memoryGB: 2, storageGB: 50, bandwidth: 500 },
    standard: { cpu: 2, memoryGB: 4, storageGB: 100, bandwidth: 1000 },
    premium: { cpu: 4, memoryGB: 8, storageGB: 200, bandwidth: 2000 },
    enterprise: { cpu: 8, memoryGB: 16, storageGB: 500, bandwidth: 5000 },
  };

  const serviceResources = resources || defaultResources[plan];

  // Create expiration date (1 year from now)
  const now = new Date();
  const expiresAt = new Date(
    now.setFullYear(now.getFullYear() + 1)
  ).toISOString();

  // Create new service
  const newService = {
    id: serviceId,
    name,
    type,
    plan,
    status: "pending",
    resources: serviceResources,
    price,
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  res.status(201).json({
    status: "success",
    data: {
      service: newService,
    },
  });
});

/**
 * @swagger
 * /api/services/{id}/status:
 *   patch:
 *     summary: Update service status
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, terminated]
 *                 example: suspended
 *     responses:
 *       200:
 *         description: Service status updated successfully
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
 *                   example: Service status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Service not found
 *       401:
 *         description: Not authenticated
 */
router.patch("/:id/status", authMiddleware.protect, (req, res) => {
  console.log(`Updating status for service ID: ${req.params.id}`, req.body);

  const serviceId = req.params.id;
  const { status } = req.body;

  // Validate status
  const validStatuses = ["active", "suspended", "terminated"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      status: "error",
      message: `Status must be one of: ${validStatuses.join(", ")}`,
    });
  }

  // Sample services data
  const services = {
    "svc-12345": {
      id: "svc-12345",
      name: "Web Hosting Plan",
      type: "vm",
      plan: "standard",
      status: "active",
      resources: {
        cpu: 2,
        memoryGB: 4,
        storageGB: 100,
        bandwidth: 1000,
      },
      price: {
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      createdAt: "2023-01-15T08:30:00Z",
      expiresAt: "2024-01-15T08:30:00Z",
    },
  };

  // Check if service exists
  if (!services[serviceId]) {
    return res.status(404).json({
      status: "error",
      message: "Service not found",
    });
  }

  // Update service status
  const updatedService = {
    ...services[serviceId],
    status,
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    status: "success",
    message: "Service status updated successfully",
    data: {
      service: updatedService,
    },
  });
});

/**
 * @swagger
 * /api/services/{id}/renew:
 *   post:
 *     summary: Renew a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billingCycle
 *             properties:
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, quarterly, annually]
 *                 example: annually
 *     responses:
 *       200:
 *         description: Service renewed successfully
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
 *                   example: Service renewed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *                     invoice:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: inv-98765
 *                         amount:
 *                           type: number
 *                           example: 299.88
 *                         currency:
 *                           type: string
 *                           example: USD
 *                         status:
 *                           type: string
 *                           example: pending
 *       400:
 *         description: Bad request
 *       404:
 *         description: Service not found
 *       401:
 *         description: Not authenticated
 */
router.post("/:id/renew", authMiddleware.protect, (req, res) => {
  console.log(`Renewing service ID: ${req.params.id}`, req.body);

  const serviceId = req.params.id;
  const { billingCycle } = req.body;

  // Validate billing cycle
  const validBillingCycles = ["monthly", "quarterly", "annually"];
  if (!billingCycle || !validBillingCycles.includes(billingCycle)) {
    return res.status(400).json({
      status: "error",
      message: `Billing cycle must be one of: ${validBillingCycles.join(", ")}`,
    });
  }

  // Sample services data
  const services = {
    "svc-12345": {
      id: "svc-12345",
      name: "Web Hosting Plan",
      type: "vm",
      plan: "standard",
      status: "active",
      resources: {
        cpu: 2,
        memoryGB: 4,
        storageGB: 100,
        bandwidth: 1000,
      },
      price: {
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      createdAt: "2023-01-15T08:30:00Z",
      expiresAt: "2024-01-15T08:30:00Z",
    },
  };

  // Check if service exists
  if (!services[serviceId]) {
    return res.status(404).json({
      status: "error",
      message: "Service not found",
    });
  }

  const service = services[serviceId];

  // Calculate new expiration date
  let expirationDate = new Date(service.expiresAt);
  switch (billingCycle) {
    case "monthly":
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      break;
    case "quarterly":
      expirationDate.setMonth(expirationDate.getMonth() + 3);
      break;
    case "annually":
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      break;
  }

  // Calculate invoice amount based on billing cycle
  let invoiceAmount = service.price.amount;
  switch (billingCycle) {
    case "monthly":
      // Base price
      break;
    case "quarterly":
      invoiceAmount = service.price.amount * 3 * 0.95; // 5% discount
      break;
    case "annually":
      invoiceAmount = service.price.amount * 12 * 0.9; // 10% discount
      break;
  }

  // Round to 2 decimal places
  invoiceAmount = Math.round(invoiceAmount * 100) / 100;

  // Update service
  const updatedService = {
    ...service,
    price: {
      ...service.price,
      billingCycle,
    },
    expiresAt: expirationDate.toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Generate invoice
  const invoice = {
    id: `inv-${Math.floor(Math.random() * 100000)}`,
    serviceId,
    amount: invoiceAmount,
    currency: service.price.currency,
    status: "pending",
    billingCycle,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
  };

  res.status(200).json({
    status: "success",
    message: "Service renewed successfully",
    data: {
      service: updatedService,
      invoice,
    },
  });
});

/**
 * @swagger
 * /api/services/{id}/upgrade:
 *   patch:
 *     summary: Upgrade or downgrade a service plan
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [basic, standard, premium, enterprise]
 *                 example: premium
 *     responses:
 *       200:
 *         description: Service plan updated successfully
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
 *                   example: Service plan updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       $ref: '#/components/schemas/Service'
 *                     priceDifference:
 *                       type: number
 *                       example: 20.00
 *       400:
 *         description: Bad request
 *       404:
 *         description: Service not found
 *       401:
 *         description: Not authenticated
 */
router.patch("/:id/upgrade", authMiddleware.protect, (req, res) => {
  console.log(`Upgrading service ID: ${req.params.id}`, req.body);

  const serviceId = req.params.id;
  const { plan } = req.body;

  // Validate plan
  const validPlans = ["basic", "standard", "premium", "enterprise"];
  if (!plan || !validPlans.includes(plan)) {
    return res.status(400).json({
      status: "error",
      message: `Plan must be one of: ${validPlans.join(", ")}`,
    });
  }

  // Sample services data
  const services = {
    "svc-12345": {
      id: "svc-12345",
      name: "Web Hosting Plan",
      type: "vm",
      plan: "standard",
      status: "active",
      resources: {
        cpu: 2,
        memoryGB: 4,
        storageGB: 100,
        bandwidth: 1000,
      },
      price: {
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      createdAt: "2023-01-15T08:30:00Z",
      expiresAt: "2024-01-15T08:30:00Z",
    },
  };

  // Check if service exists
  if (!services[serviceId]) {
    return res.status(404).json({
      status: "error",
      message: "Service not found",
    });
  }

  const service = services[serviceId];

  // Skip if plan is the same
  if (service.plan === plan) {
    return res.status(400).json({
      status: "error",
      message: `Service is already on the ${plan} plan`,
    });
  }

  // Define resources and prices for each plan
  const planDetails = {
    basic: {
      resources: { cpu: 1, memoryGB: 2, storageGB: 50, bandwidth: 500 },
      price: 19.99,
    },
    standard: {
      resources: { cpu: 2, memoryGB: 4, storageGB: 100, bandwidth: 1000 },
      price: 29.99,
    },
    premium: {
      resources: { cpu: 4, memoryGB: 8, storageGB: 200, bandwidth: 2000 },
      price: 49.99,
    },
    enterprise: {
      resources: { cpu: 8, memoryGB: 16, storageGB: 500, bandwidth: 5000 },
      price: 99.99,
    },
  };

  // Calculate price difference
  const currentPrice = service.price.amount;
  const newPrice = planDetails[plan].price;
  const priceDifference = newPrice - currentPrice;

  // Update service
  const updatedService = {
    ...service,
    plan,
    resources: planDetails[plan].resources,
    price: {
      ...service.price,
      amount: newPrice,
    },
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    status: "success",
    message: "Service plan updated successfully",
    data: {
      service: updatedService,
      priceDifference: Math.round(priceDifference * 100) / 100,
    },
  });
});

// For demonstration only - mock endpoint
router.get("/demo", (req, res) => {
  res.json({
    message: "Service API is working (mock mode)",
    demoServices: [
      {
        id: "svc-demo-1",
        name: "Demo Web Server",
        type: "vm",
        plan: "standard",
        status: "active",
      },
      {
        id: "svc-demo-2",
        name: "Demo Database",
        type: "database",
        plan: "premium",
        status: "active",
      },
    ],
  });
});

console.log("Service Routes initialized successfully");

module.exports = router;
