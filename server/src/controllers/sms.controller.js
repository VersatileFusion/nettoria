const { SMS, SMSTemplate, User } = require("../models");
const { Op } = require("sequelize");
const { validatePhoneNumber } = require("../utils/validators");
const { sendSMS: sendSMSService } = require("../services/sms.service");
const logger = require("../utils/logger");

/**
 * Send verification code to a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendVerificationCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `Your verification code is: ${code}`;

    await sendSMSService(phoneNumber, message);

    // Store the code in the database with expiration
    await VerificationCode.create({
      phoneNumber,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    res.json({ message: "Verification code sent successfully" });
  } catch (error) {
    logger.error("Error sending verification code:", error);
    res.status(500).json({ error: "Failed to send verification code" });
  }
};

/**
 * Verify a verification code entered by the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyCode = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    const verificationCode = await VerificationCode.findOne({
      where: {
        phoneNumber,
        code,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!verificationCode) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    // Delete the used code
    await verificationCode.destroy();

    res.json({ message: "Phone number verified successfully" });
  } catch (error) {
    logger.error("Error verifying code:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
};

/**
 * Send a notification SMS
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendNotification = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    await sendSMSService(phoneNumber, message);
    res.json({ message: "Notification sent successfully" });
  } catch (error) {
    logger.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};

/**
 * Get SMS service credit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCredit = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ credit: user.smsCredit });
  } catch (error) {
    logger.error("Error getting SMS credit:", error);
    res.status(500).json({ error: "Failed to get SMS credit" });
  }
};

// Template Management
exports.getTemplates = async (req, res) => {
  try {
    const templates = await SMSTemplate.findAll({
      where: { userId: req.user.id },
    });
    res.json({ templates });
  } catch (error) {
    logger.error("Error getting templates:", error);
    res.status(500).json({ error: "Failed to get templates" });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, content } = req.body;
    const template = await SMSTemplate.create({
      name,
      content,
      userId: req.user.id,
    });
    res.status(201).json({ template });
  } catch (error) {
    logger.error("Error creating template:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;

    const template = await SMSTemplate.findOne({
      where: { id, userId: req.user.id },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    await template.update({ name, content });
    res.json({ template });
  } catch (error) {
    logger.error("Error updating template:", error);
    res.status(500).json({ error: "Failed to update template" });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await SMSTemplate.findOne({
      where: { id, userId: req.user.id },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    await template.destroy();
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    logger.error("Error deleting template:", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
};

// SMS Sending
exports.sendSMS = async (req, res) => {
  try {
    const { templateId, recipients, message } = req.body;

    // Validate recipients
    const invalidRecipients = recipients.filter(
      (recipient) => !validatePhoneNumber(recipient)
    );
    if (invalidRecipients.length > 0) {
      return res.status(400).json({
        error: "Invalid phone numbers",
        invalidNumbers: invalidRecipients,
      });
    }

    // Get template if templateId is provided
    let finalMessage = message;
    if (templateId) {
      const template = await SMSTemplate.findOne({
        where: { id: templateId, userId: req.user.id },
      });
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      finalMessage = template.content;
    }

    // Send SMS to each recipient
    const results = await Promise.all(
      recipients.map(async (recipient) => {
        try {
          const sms = await sendSMSService(recipient, finalMessage);
          return {
            recipient,
            status: "sent",
            messageId: sms.messageId,
          };
        } catch (error) {
          return {
            recipient,
            status: "failed",
            error: error.message,
          };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    logger.error("Error sending SMS:", error);
    res.status(500).json({ error: "Failed to send SMS" });
  }
};

exports.sendBulkSMS = async (req, res) => {
  try {
    const { templateId, groupId, message } = req.body;

    // Get group members
    const group = await Group.findOne({
      where: { id: groupId, userId: req.user.id },
      include: [{ model: User, as: "members" }],
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Get template if templateId is provided
    let finalMessage = message;
    if (templateId) {
      const template = await SMSTemplate.findOne({
        where: { id: templateId, userId: req.user.id },
      });
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      finalMessage = template.content;
    }

    // Send SMS to each group member
    const results = await Promise.all(
      group.members.map(async (member) => {
        try {
          const sms = await sendSMSService(member.phoneNumber, finalMessage);
          return {
            recipient: member.phoneNumber,
            status: "sent",
            messageId: sms.messageId,
          };
        } catch (error) {
          return {
            recipient: member.phoneNumber,
            status: "failed",
            error: error.message,
          };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    logger.error("Error sending bulk SMS:", error);
    res.status(500).json({ error: "Failed to send bulk SMS" });
  }
};

// SMS History
exports.getSMSHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status && status !== "all") {
      where.status = status;
    }
    if (date) {
      where.createdAt = {
        [Op.between]: [
          new Date(date),
          new Date(new Date(date).setHours(23, 59, 59, 999)),
        ],
      };
    }

    const { count, rows: history } = await SMS.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      history,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    logger.error("Error getting SMS history:", error);
    res.status(500).json({ error: "Failed to get SMS history" });
  }
};
