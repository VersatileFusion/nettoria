const express = require("express");
const router = express.Router();
const contentController = require("../controllers/content.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");

/**
 * @swagger
 * /api/content/{type}:
 *   get:
 *     summary: Get content by type
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: Content type (terms, privacy, about-us, etc.)
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *       404:
 *         description: Content not found
 */
router.get("/:type", contentController.getContentByType);

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Get all content (admin only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all content
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  contentController.getAllContent
);

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create or update content (admin only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - content
 *             properties:
 *               type:
 *                 type: string
 *                 description: Content type
 *               title:
 *                 type: string
 *                 description: Content title
 *               content:
 *                 type: string
 *                 description: Content body
 *     responses:
 *       201:
 *         description: Content created successfully
 *       200:
 *         description: Content updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  [
    body('type').notEmpty().withMessage('Content type is required'),
    body('title').notEmpty().withMessage('Content title is required'),
    body('content').notEmpty().withMessage('Content body is required')
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
  contentController.createOrUpdateContent
);

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete content (admin only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Content not found
 */
router.delete("/:id",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  contentController.deleteContent
);

/**
 * @swagger
 * /api/content/terms:
 *   get:
 *     summary: Get terms and conditions
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Terms and conditions
 */
router.get("/terms", contentController.getTerms);

/**
 * @swagger
 * /api/content/privacy:
 *   get:
 *     summary: Get privacy policy
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Privacy policy
 */
router.get("/privacy", contentController.getPrivacy);

/**
 * @swagger
 * /api/content/about-us:
 *   get:
 *     summary: Get about us page content
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: About us content
 */
router.get("/about-us", contentController.getAboutUs);

/**
 * @swagger
 * /api/content/contact-us:
 *   get:
 *     summary: Get contact us page content
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Contact us content
 */
router.get("/contact-us", contentController.getContactUs);

/**
 * @swagger
 * /api/content/faq:
 *   get:
 *     summary: Get FAQ page content
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: FAQ content
 */
router.get("/faq", contentController.getFAQ);

/**
 * @swagger
 * /api/content/success-password:
 *   get:
 *     summary: Get success password page content
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Success password page content
 */
router.get("/success-password", contentController.getSuccessPassword);

/**
 * @swagger
 * /api/content/layout:
 *   get:
 *     summary: Get layout content (header, footer, etc.)
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Layout content
 */
router.get("/layout", contentController.getLayout);

/**
 * @swagger
 * /api/content/index:
 *   get:
 *     summary: Get index page content
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Index page content
 */
router.get("/index", contentController.getIndex);

module.exports = router;
