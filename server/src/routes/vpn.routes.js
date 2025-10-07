const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");
const vpnController = require("../controllers/vpn.controller");
const vpnValidators = require("../validators/vpn.validator");
const { validateRequest } = require("../middleware/validate-request");
const { requireAuth } = require("../middleware/require-auth");
const { auth } = require("../middleware/auth");
const VPNService = require('../services/vpn.service');

// Validation middleware
const validateVPN = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
  body("plan")
    .optional()
    .isIn(["basic", "premium", "enterprise"])
    .withMessage("Invalid plan type"),
];

// Get all VPNs
router.get("/", authMiddleware.authenticate, async (req, res) => {
  try {
    const vpns = await VPN.findAll({
      where: { userId: req.user.id },
    });
    res.json({ success: true, data: vpns });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching VPNs",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Get VPN by ID
router.get("/:id", authMiddleware.authenticate, async (req, res) => {
  try {
    const vpn = await VPN.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!vpn) {
      return res.status(404).json({
        success: false,
        error: {
          message: "VPN not found",
          code: "NOT_FOUND",
        },
      });
    }

    res.json({ success: true, data: vpn });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching VPN",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

/**
 * @swagger
 * /api/vpn/config:
 *   get:
 *     summary: Get VPN configuration
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: VPN configuration retrieved successfully
 *       404:
 *         description: VPN configuration not found
 */
router.get("/config", requireAuth, vpnController.getConfig);

/**
 * @swagger
 * /api/vpn/status:
 *   get:
 *     summary: Get VPN connection status
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: VPN status retrieved successfully
 *       404:
 *         description: VPN configuration not found
 */
router.get("/status", requireAuth, vpnController.getStatus);

/**
 * @swagger
 * /api/vpn/connect:
 *   post:
 *     summary: Connect to VPN
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serverId
 *             properties:
 *               serverId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connected to VPN successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: VPN configuration not found
 */
router.post(
  "/connect",
  requireAuth,
  vpnValidators.connect,
  validateRequest,
  vpnController.connect
);

/**
 * @swagger
 * /api/vpn/disconnect:
 *   post:
 *     summary: Disconnect from VPN
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disconnected from VPN successfully
 *       404:
 *         description: VPN configuration not found
 */
router.post("/disconnect", requireAuth, vpnController.disconnect);

/**
 * @swagger
 * /api/vpn/servers:
 *   get:
 *     summary: Get available VPN servers
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available servers
 */
router.get("/servers", requireAuth, vpnController.getServers);

/**
 * @swagger
 * /api/vpn/usage:
 *   get:
 *     summary: Get VPN usage statistics
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
 *       404:
 *         description: VPN configuration not found
 */
router.get("/usage", requireAuth, vpnController.getUsage);

/**
 * @swagger
 * /api/vpn/usage:
 *   post:
 *     summary: Update VPN usage statistics
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - upload
 *               - download
 *             properties:
 *               upload:
 *                 type: number
 *               download:
 *                 type: number
 *     responses:
 *       200:
 *         description: Usage statistics updated successfully
 *       400:
 *         description: Invalid request
 */
router.post(
  "/usage",
  requireAuth,
  vpnValidators.updateUsage,
  validateRequest,
  vpnController.updateUsage
);

/**
 * @swagger
 * /api/vpn:
 *   post:
 *     summary: Create new VPN configuration
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *     responses:
 *       201:
 *         description: VPN configuration created successfully
 *       400:
 *         description: Invalid request
 */
router.post(
  "/",
  requireAuth,
  vpnValidators.create,
  validateRequest,
  vpnController.create
);

/**
 * @swagger
 * /api/vpn:
 *   put:
 *     summary: Update VPN configuration
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *               autoRenew:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: VPN configuration updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: VPN configuration not found
 */
router.put(
  "/",
  requireAuth,
  vpnValidators.update,
  validateRequest,
  vpnController.update
);

// Delete VPN
router.delete("/:id", authMiddleware.authenticate, async (req, res) => {
  try {
    const vpn = await VPN.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!vpn) {
      return res.status(404).json({
        success: false,
        error: {
          message: "VPN not found",
          code: "NOT_FOUND",
        },
      });
    }

    await vpn.destroy();
    res.json({ success: true, message: "VPN deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error deleting VPN",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Get user's VPN connections
router.get("/connections",
  auth,
  async (req, res) => {
    try {
      const connections = await VPNService.getUserConnections(req.user.id);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get VPN connection details
router.get("/connections/:connectionId",
  auth,
  async (req, res) => {
    try {
      const connection = await VPNService.getConnectionDetails(req.user.id, req.params.connectionId);
      res.json(connection);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Create new VPN connection
router.post("/connections/create",
  auth,
  [
    body('name').isString().notEmpty().withMessage('Connection name is required'),
    body('serverId').isUUID().withMessage('Invalid server ID'),
    body('protocol').isIn(['openvpn', 'wireguard']).withMessage('Invalid protocol'),
    body('config').isObject().withMessage('Configuration must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const connection = await VPNService.createConnection(req.user.id, req.body);
      res.status(201).json(connection);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update VPN connection
router.put("/connections/:connectionId",
  auth,
  [
    body('name').optional().isString().notEmpty().withMessage('Connection name cannot be empty'),
    body('config').optional().isObject().withMessage('Configuration must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const connection = await VPNService.updateConnection(req.user.id, req.params.connectionId, req.body);
      res.json(connection);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get connection configuration
router.get("/connections/:connectionId/config",
  auth,
  async (req, res) => {
    try {
      const config = await VPNService.getConnectionConfig(req.user.id, req.params.connectionId);
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get available servers
router.get("/servers",
  auth,
  async (req, res) => {
    try {
      const servers = await VPNService.getAvailableServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get server status
router.get("/servers/:serverId/status",
  auth,
  async (req, res) => {
    try {
      const status = await VPNService.getServerStatus(req.params.serverId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get connection statistics
router.get("/connections/:connectionId/stats",
  auth,
  async (req, res) => {
    try {
      const stats = await VPNService.getConnectionStats(req.user.id, req.params.connectionId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete VPN connection
router.delete("/connections/:connectionId",
  auth,
  async (req, res) => {
    try {
      await VPNService.deleteConnection(req.user.id, req.params.connectionId);
      res.json({ message: 'VPN connection deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get connection logs
router.get("/connections/:connectionId/logs",
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
      const logs = await VPNService.getConnectionLogs(req.user.id, req.params.connectionId, page, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get connection usage
router.get("/connections/:connectionId/usage",
  auth,
  async (req, res) => {
    try {
      const usage = await VPNService.getConnectionUsage(req.user.id, req.params.connectionId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
