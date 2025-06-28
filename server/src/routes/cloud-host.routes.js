const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");
const CloudHost = require("../models/cloud-host");
const CloudHostService = require('../services/cloud-host.service');
const { validateRequest } = require('../middleware/validation');
const { param } = require('express-validator');

// Validation middleware
const validateCloudHost = [
  body("name").trim().notEmpty().withMessage("Host name is required"),
  body("plan").trim().notEmpty().withMessage("Plan is required"),
  body("cpu")
    .isInt({ min: 1 })
    .withMessage("CPU cores must be a positive number"),
  body("ram").isInt({ min: 1 }).withMessage("RAM must be a positive number"),
  body("storage")
    .isInt({ min: 1 })
    .withMessage("Storage must be a positive number"),
  body("bandwidth")
    .isInt({ min: 1 })
    .withMessage("Bandwidth must be a positive number"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
];

// Get all cloud hosts
router.get("/", authMiddleware.protect, async (req, res) => {
  try {
    const cloudHosts = await CloudHost.findAll({
      where: { userId: req.user.id },
    });
    res.json({ success: true, data: cloudHosts });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching cloud hosts",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Get cloud host by ID
router.get("/:id", authMiddleware.protect, async (req, res) => {
  try {
    const cloudHost = await CloudHost.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!cloudHost) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Cloud host not found",
          code: "NOT_FOUND",
        },
      });
    }

    res.json({ success: true, data: cloudHost });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching cloud host",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Create new cloud host
router.post(
  "/",
  authMiddleware.protect,
  validateCloudHost,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Validation error",
            code: "INVALID_INPUT",
            details: errors.array(),
          },
        });
      }

      const cloudHost = await CloudHost.create({
        ...req.body,
        userId: req.user.id,
        status: "active",
      });

      res.status(201).json({ success: true, data: cloudHost });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Error creating cloud host",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Update cloud host
router.put(
  "/:id",
  authMiddleware.protect,
  validateCloudHost,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Validation error",
            code: "INVALID_INPUT",
            details: errors.array(),
          },
        });
      }

      const cloudHost = await CloudHost.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!cloudHost) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Cloud host not found",
            code: "NOT_FOUND",
          },
        });
      }

      await cloudHost.update(req.body);
      res.json({ success: true, data: cloudHost });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Error updating cloud host",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Delete cloud host
router.delete("/:id", authMiddleware.protect, async (req, res) => {
  try {
    const cloudHost = await CloudHost.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!cloudHost) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Cloud host not found",
          code: "NOT_FOUND",
        },
      });
    }

    await cloudHost.destroy();
    res.json({ success: true, message: "Cloud host deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error deleting cloud host",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Get cloud host usage statistics
router.get("/:id/stats", authMiddleware.protect, async (req, res) => {
  try {
    const cloudHost = await CloudHost.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!cloudHost) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Cloud host not found",
          code: "NOT_FOUND",
        },
      });
    }

    // Get usage statistics (implement your logic here)
    const stats = {
      cpuUsage: cloudHost.cpuUsage,
      ramUsage: cloudHost.ramUsage,
      storageUsage: cloudHost.storageUsage,
      bandwidthUsage: cloudHost.bandwidthUsage,
      uptime: cloudHost.uptime,
      lastRestart: cloudHost.lastRestart,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching cloud host statistics",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Get all cloud servers for user
router.get('/', authMiddleware.protect, async (req, res) => {
  try {
    const servers = await CloudHostService.getUserServers(req.user.id);
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get server details
router.get('/:serverId', authMiddleware.protect, [
  param('serverId').isUUID()
], validateRequest, async (req, res) => {
  try {
    const server = await CloudHostService.getServerDetails(req.user.id, req.params.serverId);
    res.json(server);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Create new server
router.post('/create', authMiddleware.protect, [
  body('name').isString().notEmpty(),
  body('region').isString().notEmpty(),
  body('plan').isString().notEmpty(),
  body('image').isString().notEmpty(),
  body('sshKeys').isArray().optional(),
  body('tags').isArray().optional(),
  body('backups').isBoolean().optional(),
  body('monitoring').isBoolean().optional()
], validateRequest, async (req, res) => {
  try {
    const server = await CloudHostService.createServer(req.user.id, req.body);
    res.status(201).json(server);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update server
router.put('/:serverId', authMiddleware.protect, [
  param('serverId').isUUID(),
  body('name').isString().optional(),
  body('tags').isArray().optional(),
  body('backups').isBoolean().optional(),
  body('monitoring').isBoolean().optional()
], validateRequest, async (req, res) => {
  try {
    const server = await CloudHostService.updateServer(req.user.id, req.params.serverId, req.body);
    res.json(server);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Control server
router.post('/:serverId/control', authMiddleware.protect, [
  param('serverId').isUUID(),
  body('action').isIn(['start', 'stop', 'restart', 'reboot'])
], validateRequest, async (req, res) => {
  try {
    const result = await CloudHostService.controlServer(req.user.id, req.params.serverId, req.body.action);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get server metrics
router.get('/:serverId/metrics', authMiddleware.protect, [
  param('serverId').isUUID()
], validateRequest, async (req, res) => {
  try {
    const metrics = await CloudHostService.getServerMetrics(req.user.id, req.params.serverId);
    res.json(metrics);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get available regions
router.get('/regions', async (req, res) => {
  try {
    const regions = await CloudHostService.getAvailableRegions();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await CloudHostService.getAvailablePlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available images
router.get('/images', async (req, res) => {
  try {
    const images = await CloudHostService.getAvailableImages();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create backup
router.post('/:serverId/backup', authMiddleware.protect, [
  param('serverId').isUUID(),
  body('name').isString().optional(),
  body('description').isString().optional()
], validateRequest, async (req, res) => {
  try {
    const backup = await CloudHostService.createBackup(req.user.id, req.params.serverId, req.body);
    res.status(201).json(backup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get backups
router.get('/:serverId/backups', authMiddleware.protect, [
  param('serverId').isUUID()
], validateRequest, async (req, res) => {
  try {
    const backups = await CloudHostService.getBackups(req.user.id, req.params.serverId);
    res.json(backups);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Restore from backup
router.post('/:serverId/restore/:backupId', authMiddleware.protect, [
  param('serverId').isUUID(),
  param('backupId').isUUID()
], validateRequest, async (req, res) => {
  try {
    const result = await CloudHostService.restoreFromBackup(req.user.id, req.params.serverId, req.params.backupId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete server
router.delete('/:serverId', authMiddleware.protect, [
  param('serverId').isUUID()
], validateRequest, async (req, res) => {
  try {
    await CloudHostService.deleteServer(req.user.id, req.params.serverId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get server console
router.get('/:serverId/console', authMiddleware.protect, [
  param('serverId').isUUID()
], validateRequest, async (req, res) => {
  try {
    const console = await CloudHostService.getServerConsole(req.user.id, req.params.serverId);
    res.json(console);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get server firewall rules
router.get('/:serverId/firewall', authMiddleware.protect, [
  param('serverId').isUUID()
], validateRequest, async (req, res) => {
  try {
    const rules = await CloudHostService.getFirewallRules(req.user.id, req.params.serverId);
    res.json(rules);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Add firewall rule
router.post('/:serverId/firewall', authMiddleware.protect, [
  param('serverId').isUUID(),
  body('type').isIn(['inbound', 'outbound']),
  body('protocol').isIn(['tcp', 'udp', 'icmp']),
  body('port').isString(),
  body('source').isString(),
  body('description').isString().optional()
], validateRequest, async (req, res) => {
  try {
    const rule = await CloudHostService.addFirewallRule(req.user.id, req.params.serverId, req.body);
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete firewall rule
router.delete('/:serverId/firewall/:ruleId', authMiddleware.protect, [
  param('serverId').isUUID(),
  param('ruleId').isUUID()
], validateRequest, async (req, res) => {
  try {
    await CloudHostService.deleteFirewallRule(req.user.id, req.params.serverId, req.params.ruleId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
