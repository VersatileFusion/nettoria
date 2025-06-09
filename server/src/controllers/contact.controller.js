const { Contact } = require("../models");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const emailService = require("../services/email.service");

const contactController = {
  /**
   * Submit a contact form
   */
  submitContactForm: async (req, res, next) => {
    try {
      const { name, email, subject, message, phone } = req.body;

      // Create contact message
      const contactMessage = await Contact.create({
        name,
        email,
        subject,
        message,
        phone,
        status: "new",
      });

      // Send notification email to admin
      await emailService.sendContactNotification({
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Form Submission: ${subject}`,
        template: "contact-notification",
        data: {
          name,
          email,
          subject,
          message,
          phone,
        },
      });

      // Send confirmation email to user
      await emailService.sendEmail({
        to: email,
        subject: "Thank you for contacting us",
        template: "contact-confirmation",
        data: {
          name,
          subject,
        },
      });

      res.status(201).json({
        success: true,
        message: "Contact form submitted successfully",
      });
    } catch (error) {
      logger.error("Error in submitContactForm:", error);
      next(error);
    }
  },

  /**
   * Get all contact messages (admin only)
   */
  getMessages: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      const messages = await Contact.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: {
          messages: messages.rows,
          total: messages.count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(messages.count / limit),
        },
      });
    } catch (error) {
      logger.error("Error in getMessages:", error);
      next(error);
    }
  },

  /**
   * Get contact message by ID (admin only)
   */
  getMessageById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const message = await Contact.findByPk(id);
      if (!message) {
        return next(new ApiError("Contact message not found", 404));
      }

      res.json({
        success: true,
        data: message,
      });
    } catch (error) {
      logger.error("Error in getMessageById:", error);
      next(error);
    }
  },

  /**
   * Reply to a contact message (admin only)
   */
  replyToMessage: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      const message = await Contact.findByPk(id);
      if (!message) {
        return next(new ApiError("Contact message not found", 404));
      }

      // Update message with reply
      message.reply = reply;
      message.status = "replied";
      message.repliedAt = new Date();
      message.repliedBy = req.user.id;
      await message.save();

      // Send reply email to user
      await emailService.sendEmail({
        to: message.email,
        subject: `Re: ${message.subject}`,
        template: "contact-reply",
        data: {
          name: message.name,
          subject: message.subject,
          reply,
        },
      });

      res.json({
        success: true,
        message: "Reply sent successfully",
      });
    } catch (error) {
      logger.error("Error in replyToMessage:", error);
      next(error);
    }
  },

  /**
   * Update message status (admin only)
   */
  updateMessageStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const message = await Contact.findByPk(id);
      if (!message) {
        return next(new ApiError("Contact message not found", 404));
      }

      message.status = status;
      await message.save();

      res.json({
        success: true,
        message: "Status updated successfully",
      });
    } catch (error) {
      logger.error("Error in updateMessageStatus:", error);
      next(error);
    }
  },
};

module.exports = contactController;
