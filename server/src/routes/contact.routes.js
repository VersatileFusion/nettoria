const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact form submitted successfully
 *       400:
 *         description: Invalid input data
 */
router.post("/", contactController.submitContactForm);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact messages (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of messages per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, read, replied]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of contact messages
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  contactController.getMessages
);

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get contact message by ID (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Contact message details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  contactController.getMessageById
);

/**
 * @swagger
 * /api/contact/{id}/reply:
 *   post:
 *     summary: Reply to a contact message (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reply
 *             properties:
 *               reply:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply sent successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
router.post(
  "/:id/reply",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  contactController.replyToMessage
);

/**
 * @swagger
 * /api/contact/{id}/status:
 *   patch:
 *     summary: Update message status (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Message ID
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
 *                 enum: [new, read, replied]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
router.patch(
  "/:id/status",
  authMiddleware.protect,
  authMiddleware.isAdmin,
  contactController.updateMessageStatus
);

// Validation middleware
const validateContact = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

// Submit contact form
router.post("/", validateContact, async (req, res) => {
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

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `Contact Form: ${req.body.subject}`,
      html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${req.body.name}</p>
                <p><strong>Email:</strong> ${req.body.email}</p>
                <p><strong>Subject:</strong> ${req.body.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${req.body.message}</p>
            `,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: req.body.email,
      subject: "Thank you for contacting us",
      html: `
                <h2>Thank you for contacting us</h2>
                <p>Dear ${req.body.name},</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p>Best regards,<br>Nettoria Team</p>
            `,
    });

    res.json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error submitting contact form",
        code: "INTERNAL_ERROR",
      },
    });
  }
});

module.exports = router;
