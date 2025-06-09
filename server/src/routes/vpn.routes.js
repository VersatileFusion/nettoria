const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");
const vpnController = require("../controllers/vpn.controller");
const vpnValidators = require("../validators/vpn.validator");
const { validateRequest } = require("../middleware/validate-request");
const { requireAuth } = require("../middleware/require-auth");

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

module.exports = router;
