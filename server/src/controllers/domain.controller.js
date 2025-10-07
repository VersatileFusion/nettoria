const { Domain, DNSRecord } = require("../models");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const domainService = require("../services/domain.service");
const emailService = require("../utils/email");
const { validateDomain } = require("../utils/domain.validator");

const domainController = {
  /**
   * Get all domains for authenticated user
   */
  getDomains: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const where = { userId: req.user.id };

      const domains = await Domain.findAndCountAll({
        where,
        include: [
          {
            model: DNSRecord,
            attributes: ["id", "type", "name", "value"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: {
          domains: domains.rows,
          total: domains.count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(domains.count / limit),
        },
      });
    } catch (error) {
      logger.error("Error in getDomains:", error);
      next(error);
    }
  },

  /**
   * Get domain by ID
   */
  getDomainById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const domain = await Domain.findOne({
        where: {
          id,
          userId: req.user.id,
        },
        include: [
          {
            model: DNSRecord,
            attributes: ["id", "type", "name", "value", "ttl"],
          },
        ],
      });

      if (!domain) {
        return next(new ApiError("Domain not found", 404));
      }

      res.json({
        success: true,
        data: domain,
      });
    } catch (error) {
      logger.error("Error in getDomainById:", error);
      next(error);
    }
  },

  /**
   * Check domain availability
   */
  checkAvailability: async (req, res, next) => {
    try {
      const { name } = req.body;

      // Validate domain name format
      if (!validateDomain(name)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid domain name format",
        });
      }

      // TODO: Implement actual domain availability check with registrar API
      const isAvailable = true;
      const price = 1000000; // Example price in IRR

      res.status(200).json({
        status: "success",
        data: {
          name,
          isAvailable,
          price,
        },
      });
    } catch (error) {
      logger.error("Error in checkAvailability:", error);
      next(error);
    }
  },

  /**
   * Register a new domain
   */
  registerDomain: async (req, res, next) => {
    try {
      const { name, period } = req.body;

      // Validate domain name format
      if (!validateDomain(name)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid domain name format",
        });
      }

      // Check if domain already exists
      const existingDomain = await Domain.findOne({ name });
      if (existingDomain) {
        return res.status(400).json({
          status: "error",
          message: "Domain already registered",
        });
      }

      // Create new domain
      const domain = await Domain.create({
        name,
        period,
        userId: req.user.id,
        status: "pending",
      });

      // TODO: Implement actual domain registration with registrar API

      res.status(201).json({
        status: "success",
        data: {
          domain,
        },
      });
    } catch (error) {
      logger.error("Error in registerDomain:", error);
      next(error);
    }
  },

  /**
   * Renew domain registration
   */
  renewDomain: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { period } = req.body;

      const domain = await Domain.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!domain) {
        return next(new ApiError("Domain not found", 404));
      }

      // Renew domain with registrar
      const renewalResult = await domainService.renewDomain(
        domain.name,
        period
      );

      // Update domain record
      domain.expiryDate = renewalResult.expiryDate;
      await domain.save();

      // Send confirmation email
      await emailService.sendEmail({
        to: domain.registrantInfo.email,
        subject: "Domain Renewal Confirmation",
        template: "domain-renewal",
        data: {
          name: domain.registrantInfo.name,
          domain: domain.name,
          expiryDate: renewalResult.expiryDate,
        },
      });

      res.json({
        success: true,
        data: domain,
      });
    } catch (error) {
      logger.error("Error in renewDomain:", error);
      next(error);
    }
  },

  /**
   * Transfer domain to another registrar
   */
  transferDomain: async (req, res, next) => {
    try {
      const { name, authCode } = req.body;

      // Validate domain name format
      if (!validateDomain(name)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid domain name format",
        });
      }

      // Check if domain exists
      const existingDomain = await Domain.findOne({ name });
      if (existingDomain) {
        return res.status(400).json({
          status: "error",
          message: "Domain already registered",
        });
      }

      // Create new domain with transfer status
      const domain = await Domain.create({
        name,
        userId: req.user.id,
        status: "transfer_pending",
        transferCode: authCode,
      });

      // TODO: Implement actual domain transfer with registrar API

      res.status(201).json({
        status: "success",
        data: {
          domain,
        },
      });
    } catch (error) {
      logger.error("Error in transferDomain:", error);
      next(error);
    }
  },

  /**
   * Get domain DNS records
   */
  getDNSRecords: async (req, res, next) => {
    try {
      const { id } = req.params;

      const domain = await Domain.findOne({
        where: {
          id,
          userId: req.user.id,
        },
        include: [
          {
            model: DNSRecord,
            attributes: ["id", "type", "name", "value", "ttl"],
          },
        ],
      });

      if (!domain) {
        return next(new ApiError("Domain not found", 404));
      }

      res.json({
        success: true,
        data: domain.DNSRecords,
      });
    } catch (error) {
      logger.error("Error in getDNSRecords:", error);
      next(error);
    }
  },

  /**
   * Add DNS record
   */
  addDNSRecord: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { type, name, value, ttl } = req.body;

      const domain = await Domain.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!domain) {
        return next(new ApiError("Domain not found", 404));
      }

      // TODO: Implement actual DNS record addition with registrar API
      const record = {
        id: "dns-" + Date.now(),
        type,
        name,
        value,
        ttl,
        createdAt: new Date(),
      };

      res.status(201).json({
        success: true,
        data: {
          record,
        },
      });
    } catch (error) {
      logger.error("Error in addDNSRecord:", error);
      next(error);
    }
  },

  /**
   * Delete DNS record
   */
  deleteDNSRecord: async (req, res, next) => {
    try {
      const { id, recordId } = req.params;

      const domain = await Domain.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!domain) {
        return next(new ApiError("Domain not found", 404));
      }

      const dnsRecord = await DNSRecord.findOne({
        where: {
          id: recordId,
          domainId: domain.id,
        },
      });

      if (!dnsRecord) {
        return next(new ApiError("DNS record not found", 404));
      }

      // Delete DNS record through registrar
      await domainService.deleteDNSRecord(domain.name, dnsRecord);

      // Delete DNS record from database
      await dnsRecord.destroy();

      res.json({
        success: true,
        message: "DNS record deleted successfully",
      });
    } catch (error) {
      logger.error("Error in deleteDNSRecord:", error);
      next(error);
    }
  },
};

module.exports = domainController;
