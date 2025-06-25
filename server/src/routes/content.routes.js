const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");
const Content = require("../models/content");

// Validation middleware
const validateContent = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("type").trim().notEmpty().withMessage("Content type is required"),
  body("slug").trim().notEmpty().withMessage("Slug is required"),
];

// Get all content
router.get("/", async (req, res) => {
  try {
    const content = await Content.findAll({
      where: { isActive: true },
      order: [["updatedAt", "DESC"]],
    });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching content",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Get content by slug
router.get("/:slug", async (req, res) => {
  try {
    const content = await Content.findOne({
      where: {
        slug: req.params.slug,
        isActive: true,
      },
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Content not found",
          code: "NOT_FOUND",
        },
      });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching content",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Create content (admin only)
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  validateContent,
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

      const content = await Content.create({
        title: req.body.title,
        content: req.body.content,
        type: req.body.type,
        slug: req.body.slug,
        metaDescription: req.body.metaDescription,
        metaKeywords: req.body.metaKeywords,
        isActive: true,
      });

      res.status(201).json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Error creating content",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Update content (admin only)
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  validateContent,
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

      const content = await Content.findByPk(req.params.id);
      if (!content) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Content not found",
            code: "NOT_FOUND",
          },
        });
      }

      await content.update({
        title: req.body.title,
        content: req.body.content,
        type: req.body.type,
        slug: req.body.slug,
        metaDescription: req.body.metaDescription,
        metaKeywords: req.body.metaKeywords,
      });

      res.json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Error updating content",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Delete content (admin only)
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  async (req, res) => {
    try {
      const content = await Content.findByPk(req.params.id);
      if (!content) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Content not found",
            code: "NOT_FOUND",
          },
        });
      }

      await content.update({ isActive: false });
      res.json({ success: true, message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Error deleting content",
          code: "INTERNAL_ERROR",
        },
      });
    }
  }
);

// Example dynamic content endpoints for static pages
router.get('/about-us', (req, res) => {
  res.json({ content: 'This is the dynamic About Us content from the backend.' });
});

router.get('/layout', (req, res) => {
  res.json({ content: 'Dynamic layout content from backend.' });
});

router.get('/success-pass', (req, res) => {
  res.json({ content: 'Your password was successfully changed! (from backend)' });
});

router.get('/index', (req, res) => {
  res.json({ content: 'Welcome to Nettoria! (dynamic content from backend)' });
});

router.get('/contact-us', (req, res) => {
  res.json({ content: 'Contact us at info@nettoria.com or call 021-12345678. (Dynamic content from backend)' });
});

router.get('/faq', (req, res) => {
  res.json({ content: 'Frequently Asked Questions: (Dynamic content from backend)' });
});

router.get('/terms', (req, res) => {
  res.json({ content: 'Terms and Conditions: (Dynamic content from backend)' });
});

router.get('/privacy', (req, res) => {
  res.json({ content: 'Privacy Policy: (Dynamic content from backend)' });
});

router.get('/support', (req, res) => {
  res.json({ content: 'Support: For help, contact our 24/7 support team at support@nettoria.com or open a ticket in your dashboard. (Dynamic content from backend)' });
});

// Add more endpoints for other static pages as needed

module.exports = router;
