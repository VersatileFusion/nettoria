const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require("../middleware/auth");
const VirtualServerService = require('../services/virtual-server.service');

// Get all VMs for user
router.get("/",
  authenticateToken,
  async (req, res) => {
    try {
      const vms = await VirtualServerService.getUserVMs(req.user.id);
      res.json(vms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get VM details
router.get("/:vmId",
  authenticateToken,
  async (req, res) => {
    try {
      const vm = await VirtualServerService.getVMDetails(req.user.id, req.params.vmId);
      res.json(vm);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Create new VM
router.post("/create",
  authenticateToken,
  [
    body('name').isString().notEmpty().withMessage('VM name is required'),
    body('templateId').isUUID().withMessage('Invalid template ID'),
    body('cpu').isInt({ min: 1, max: 32 }).withMessage('CPU cores must be between 1 and 32'),
    body('ram').isInt({ min: 1, max: 128 }).withMessage('RAM must be between 1 and 128 GB'),
    body('storage').isInt({ min: 10, max: 2000 }).withMessage('Storage must be between 10 and 2000 GB'),
    body('network').isString().notEmpty().withMessage('Network configuration is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const vm = await VirtualServerService.createVM(req.user.id, req.body);
      res.status(201).json(vm);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update VM configuration
router.put("/:vmId",
  authenticateToken,
  [
    body('cpu').optional().isInt({ min: 1, max: 32 }).withMessage('CPU cores must be between 1 and 32'),
    body('ram').optional().isInt({ min: 1, max: 128 }).withMessage('RAM must be between 1 and 128 GB'),
    body('storage').optional().isInt({ min: 10, max: 2000 }).withMessage('Storage must be between 10 and 2000 GB')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const vm = await VirtualServerService.updateVM(req.user.id, req.params.vmId, req.body);
      res.json(vm);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Control VM operations
router.post("/:vmId/control",
  authenticateToken,
  [
    body('action').isIn(['start', 'stop', 'restart', 'reset']).withMessage('Invalid action')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await VirtualServerService.controlVM(req.user.id, req.params.vmId, req.body.action);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get VM metrics
router.get("/:vmId/metrics",
  authenticateToken,
  async (req, res) => {
    try {
      const metrics = await VirtualServerService.getVMMetrics(req.user.id, req.params.vmId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get available templates
router.get("/templates",
  authenticateToken,
  async (req, res) => {
    try {
      const templates = await VirtualServerService.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get VM console access
router.get("/:vmId/console",
  authenticateToken,
  async (req, res) => {
    try {
      const consoleUrl = await VirtualServerService.getConsoleAccess(req.user.id, req.params.vmId);
      res.json({ consoleUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Backup VM
router.post("/:vmId/backup",
  authenticateToken,
  [
    body('name').optional().isString().withMessage('Backup name must be a string'),
    body('description').optional().isString().withMessage('Description must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const backup = await VirtualServerService.createBackup(req.user.id, req.params.vmId, req.body);
      res.json(backup);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get VM backups
router.get("/:vmId/backups",
  authenticateToken,
  async (req, res) => {
    try {
      const backups = await VirtualServerService.getBackups(req.user.id, req.params.vmId);
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Restore VM from backup
router.post("/:vmId/restore/:backupId",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await VirtualServerService.restoreFromBackup(
        req.user.id,
        req.params.vmId,
        req.params.backupId
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete VM
router.delete("/:vmId",
  authenticateToken,
  async (req, res) => {
    try {
      await VirtualServerService.deleteVM(req.user.id, req.params.vmId);
      res.json({ message: 'VM deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router; 