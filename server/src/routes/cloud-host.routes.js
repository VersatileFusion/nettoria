const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");
const CloudHost = require("../models/cloud-host");

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
router.get("/", authMiddleware.authenticate, async (req, res) => {
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
router.get("/:id", authMiddleware.authenticate, async (req, res) => {
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
  authMiddleware.authenticate,
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
  authMiddleware.authenticate,
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
router.delete("/:id", authMiddleware.authenticate, async (req, res) => {
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
router.get("/:id/stats", authMiddleware.authenticate, async (req, res) => {
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

module.exports = router;
