const express = require("express");
const router = express.Router();
const domainController = require("../controllers/domain.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { domainValidation } = require("../validations/domain.validation");
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult, param } = require("express-validator");
const DomainService = require('../services/domain.service');
const { validateRequest } = require('../middleware/validation');

/**
 * @swagger
 * /api/domains:
 *   get:
 *     summary: Get all domains for authenticated user
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of domains per page
 *     responses:
 *       200:
 *         description: List of domains
 */
router.get("/", authMiddleware.protect, async (req, res) => {
  try {
    const domains = await DomainService.getUserDomains(req.user.id);
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/{id}:
 *   get:
 *     summary: Get domain by ID
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     responses:
 *       200:
 *         description: Domain details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Domain not found
 */
router.get("/:domainId", authenticate, [
  param('domainId').isUUID()
], validateRequest, async (req, res) => {
  try {
    const domain = await DomainService.getDomainDetails(req.user.id, req.params.domainId);
    res.json(domain);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/check:
 *   post:
 *     summary: Check domain availability
 *     tags: [Domains]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: example.com
 *     responses:
 *       200:
 *         description: Domain availability check result
 */
router.post("/check/:domainName", async (req, res) => {
  try {
    const availability = await DomainService.checkDomainAvailability(req.params.domainName);
    res.json(availability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/register:
 *   post:
 *     summary: Register a new domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: example.com
 *               period:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Domain registered successfully
 */
router.post("/register", authenticate, [
  body('name').isString().notEmpty(),
  body('registrar').isString().notEmpty(),
  body('registrationPeriod').isInt({ min: 1, max: 10 }),
  body('autoRenew').isBoolean(),
  body('nameservers').isArray().optional(),
  body('contacts').isObject().optional()
], validateRequest, async (req, res) => {
  try {
    const domain = await DomainService.registerDomain(req.user.id, req.body);
    res.status(201).json(domain);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/{id}/renew:
 *   post:
 *     summary: Renew domain registration
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - period
 *             properties:
 *               period:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Domain renewed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Domain not found
 */
router.post("/:domainId/renew", authenticate, [
  param('domainId').isUUID(),
  body('period').isInt({ min: 1, max: 10 })
], validateRequest, async (req, res) => {
  try {
    const domain = await DomainService.renewDomain(req.user.id, req.params.domainId, req.body.period);
    res.json(domain);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/transfer:
 *   post:
 *     summary: Transfer a domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: example.com
 *               authCode:
 *                 type: string
 *                 example: "ABC123"
 *     responses:
 *       201:
 *         description: Domain transfer initiated successfully
 */
router.post("/:domainId/transfer", authenticate, [
  param('domainId').isUUID(),
  body('newRegistrar').isString().notEmpty(),
  body('authCode').isString().notEmpty()
], validateRequest, async (req, res) => {
  try {
    const domain = await DomainService.transferDomain(req.user.id, req.params.domainId, req.body);
    res.json(domain);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/{id}/dns:
 *   get:
 *     summary: Get domain DNS records
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Domain DNS records
 */
router.get("/:domainId/dns", authenticate, [
  param('domainId').isUUID()
], validateRequest, async (req, res) => {
  try {
    const records = await DomainService.getDNSRecords(req.user.id, req.params.domainId);
    res.json(records);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/{id}/dns:
 *   post:
 *     summary: Add DNS record
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [A, AAAA, CNAME, MX, TXT]
 *               name:
 *                 type: string
 *               value:
 *                 type: string
 *               ttl:
 *                 type: integer
 *     responses:
 *       201:
 *         description: DNS record added successfully
 */
router.post("/:domainId/dns", authenticate, [
  param('domainId').isUUID(),
  body('type').isIn(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS']),
  body('name').isString().notEmpty(),
  body('value').isString().notEmpty(),
  body('ttl').isInt({ min: 60 }).optional(),
  body('priority').isInt().optional()
], validateRequest, async (req, res) => {
  try {
    const record = await DomainService.addDNSRecord(req.user.id, req.params.domainId, req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/{id}/dns/{recordId}:
 *   delete:
 *     summary: Delete DNS record
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain ID
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: DNS record ID
 *     responses:
 *       200:
 *         description: DNS record deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Domain or DNS record not found
 */
router.delete("/:domainId/dns/:recordId", authenticate, [
  param('domainId').isUUID(),
  param('recordId').isUUID()
], validateRequest, async (req, res) => {
  try {
    await DomainService.deleteDNSRecord(req.user.id, req.params.domainId, req.params.recordId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/suggestions/:keyword:
 *   get:
 *     summary: Get domain suggestions
 *     tags: [Domains]
 *     parameters:
 *       - in: path
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of domain suggestions
 */
router.get("/suggestions/:keyword", async (req, res) => {
  try {
    const suggestions = await DomainService.getDomainSuggestions(req.params.keyword);
    res.json(suggestions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/domains/pricing/:tld:
 *   get:
 *     summary: Get domain pricing
 *     tags: [Domains]
 *     parameters:
 *       - in: path
 *         name: tld
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Domain pricing
 */
router.get("/pricing/:tld", async (req, res) => {
  try {
    const pricing = await DomainService.getDomainPricing(req.params.tld);
    res.json(pricing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
