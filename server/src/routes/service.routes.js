const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const serviceController = require("../controllers/service.controller");
const { body, validationResult } = require("express-validator");
const Service = require("../models/service");
const { Op } = require("sequelize");

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
 *     VMPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "atlas"
 *         name:
 *           type: string
 *           example: "اطلس"
 *         nameEn:
 *           type: string
 *           example: "Atlas"
 *         specs:
 *           type: object
 *           properties:
 *             cpu:
 *               type: integer
 *               example: 1
 *               description: Number of CPU cores
 *             ram:
 *               type: integer
 *               example: 2
 *               description: RAM in GB
 *             storage:
 *               type: integer
 *               example: 20
 *               description: Storage in GB
 *             traffic:
 *               type: integer
 *               example: 1024
 *               description: Traffic in GB (1 TB)
 *         description:
 *           type: string
 *           example: "مناسب برای وب سایت‌های کوچک و توسعه"
 *         descriptionEn:
 *           type: string
 *           example: "Suitable for small websites and development"
 *         pricing:
 *           type: object
 *           properties:
 *             monthly:
 *               type: number
 *               example: 30000
 *             quarterly:
 *               type: number
 *               example: 85500
 *             biannual:
 *               type: number
 *               example: 162000
 *             annual:
 *               type: number
 *               example: 306000
 *             hourly:
 *               type: number
 *               example: 41
 *
 *     OperatingSystem:
 *       type: object
 *       properties:
 *         linux:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Linux"
 *             nameFA:
 *               type: string
 *               example: "لینوکس"
 *             types:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "ubuntu"
 *                   name:
 *                     type: string
 *                     example: "Ubuntu"
 *                   nameFA:
 *                     type: string
 *                     example: "اوبونتو"
 *                   versions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "ubuntu-24"
 *                         version:
 *                           type: string
 *                           example: "24.04"
 *                         codeName:
 *                           type: string
 *                           example: "Noble Numbat"
 *                         name:
 *                           type: string
 *                           example: "Ubuntu 24.04"
 *                         nameFA:
 *                           type: string
 *                           example: "اوبونتو ورژن 24"
 *
 *     DataCenter:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "tehran"
 *         name:
 *           type: string
 *           example: "Tehran"
 *         nameFA:
 *           type: string
 *           example: "تهران"
 *         location:
 *           type: string
 *           example: "Iran"
 *         locationFA:
 *           type: string
 *           example: "ایران"
 *         status:
 *           type: string
 *           example: "active"
 *
 *     ServiceConfig:
 *       type: object
 *       properties:
 *         specs:
 *           type: object
 *           properties:
 *             cpu:
 *               type: integer
 *               example: 2
 *             ram:
 *               type: integer
 *               example: 4
 *             storage:
 *               type: integer
 *               example: 60
 *             traffic:
 *               type: integer
 *               example: 1024
 *         operatingSystem:
 *           type: string
 *           example: "ubuntu-24"
 *         dataCenter:
 *           type: string
 *           example: "tehran"
 *         paymentPeriod:
 *           type: string
 *           example: "monthly"
 *         pricing:
 *           type: object
 *           properties:
 *             basePrice:
 *               type: number
 *               example: 40000
 *             finalPrice:
 *               type: number
 *               example: 40000
 *             discountPercentage:
 *               type: number
 *               example: 0
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

// Validation middleware
const validateService = [
  body("name").trim().notEmpty().withMessage("Service name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
];

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
router.get("/", authMiddleware.protect, async (req, res) => {
  console.log("Fetching services for user ID:", req.user.id);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const type = req.query.type;

  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;

  try {
    const services = await Service.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      results: services.count,
      data: {
        services: services.rows,
        pagination: {
          total: services.count,
          page,
          pages: Math.ceil(services.count / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching services",
      code: "INTERNAL_ERROR",
    });
  }
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
router.get("/:id", authMiddleware.protect, async (req, res) => {
  console.log(
    `Fetching service with ID: ${req.params.id} for user: ${req.user.id}`
  );

  const serviceId = req.params.id;

  try {
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        service,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching service",
      code: "INTERNAL_ERROR",
    });
  }
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
router.post("/", authMiddleware.protect, validateService, async (req, res) => {
  console.log(`Creating new service for user ID: ${req.user.id}`, req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      code: "INVALID_INPUT",
      details: errors.array(),
    });
  }

  const { name, type, plan, resources } = req.body;

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

  try {
    const service = await Service.create(newService);
    res.status(201).json({
      status: "success",
      data: {
        service,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating service",
      code: "INTERNAL_ERROR",
    });
  }
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
router.patch("/:id/status", authMiddleware.protect, async (req, res) => {
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

  try {
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    // Update service status
    const updatedService = await service.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({
      status: "success",
      message: "Service status updated successfully",
      data: {
        service: updatedService,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating service status",
      code: "INTERNAL_ERROR",
    });
  }
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
router.post("/:id/renew", authMiddleware.protect, async (req, res) => {
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

  try {
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

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
    const updatedService = await service.update({
      price: {
        ...service.price,
        billingCycle,
      },
      expiresAt: expirationDate.toISOString(),
      updatedAt: new Date().toISOString(),
    });

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
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error renewing service",
      code: "INTERNAL_ERROR",
    });
  }
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
router.patch("/:id/upgrade", authMiddleware.protect, async (req, res) => {
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

  try {
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

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
    const updatedService = await service.update({
      plan,
      resources: planDetails[plan].resources,
      price: {
        ...service.price,
        amount: newPrice,
      },
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({
      status: "success",
      message: "Service plan updated successfully",
      data: {
        service: updatedService,
        priceDifference: Math.round(priceDifference * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error upgrading service plan",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * @swagger
 * /api/services/plans:
 *   get:
 *     summary: Get all predefined VM plans
 *     description: Returns a list of all available VM plans with specifications and pricing options
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of VM plans successfully retrieved
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
 *                     plans:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/VMPlan'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve VM plans
 */
router.get("/plans", serviceController.getVmPlans);

/**
 * @swagger
 * /api/services/operating-systems:
 *   get:
 *     summary: Get all available operating systems
 *     description: Returns a list of all available operating systems and their versions
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of operating systems successfully retrieved
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
 *                     operatingSystems:
 *                       $ref: '#/components/schemas/OperatingSystem'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve operating systems
 */
router.get("/operating-systems", serviceController.getOperatingSystems);

/**
 * @swagger
 * /api/services/configure:
 *   post:
 *     summary: Configure custom VM service
 *     description: Configure a custom VM with specified resources, operating system, and payment period
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
 *               - cpu
 *               - ram
 *               - storage
 *               - operatingSystem
 *               - dataCenter
 *               - paymentPeriod
 *             properties:
 *               cpu:
 *                 type: number
 *                 example: 2
 *                 description: Number of CPU cores
 *               ram:
 *                 type: number
 *                 example: 4
 *                 description: RAM in GB
 *               storage:
 *                 type: number
 *                 example: 60
 *                 description: Storage in GB
 *               traffic:
 *                 type: number
 *                 example: 1024
 *                 description: Traffic in GB (1 TB)
 *               operatingSystem:
 *                 type: string
 *                 example: "ubuntu-24"
 *                 description: Operating system ID
 *               dataCenter:
 *                 type: string
 *                 example: "tehran"
 *                 description: Data center ID
 *               paymentPeriod:
 *                 type: string
 *                 enum: [hourly, monthly, quarterly, biannual, annual]
 *                 example: "monthly"
 *                 description: Payment period
 *     responses:
 *       200:
 *         description: Service configuration with pricing successfully created
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
 *                     serviceConfig:
 *                       $ref: '#/components/schemas/ServiceConfig'
 *       400:
 *         description: Bad request - missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Missing required configuration parameters
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to configure service
 */
router.post(
  "/configure",
  authMiddleware.protect,
  serviceController.configureService
);

/**
 * @swagger
 * /api/services/data-centers:
 *   get:
 *     summary: Get available data centers
 *     description: Returns a list of all available data centers
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of data centers successfully retrieved
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
 *                     dataCenters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DataCenter'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve data centers
 */
router.get("/data-centers", serviceController.getDataCenters);

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
