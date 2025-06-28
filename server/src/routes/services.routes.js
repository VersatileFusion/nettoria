const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all available services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [vps, hosting, domain, vpn, sms]
 *         description: Filter by service type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by service status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in service name or description
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
 *         description: Number of services per page
 *     responses:
 *       200:
 *         description: List of services
 */
router.get("/", serviceController.getAllServices);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 */
router.get("/:id", serviceController.getServiceById);

/**
 * @swagger
 * /api/services/configure:
 *   post:
 *     summary: Configure service before order
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - configuration
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 description: ID of the service to configure
 *               configuration:
 *                 type: object
 *                 description: Service-specific configuration
 *     responses:
 *       200:
 *         description: Service configuration with calculated price
 *       400:
 *         description: Invalid configuration
 *       404:
 *         description: Service not found
 */
router.post("/configure",
    [
        body('serviceId').isInt().withMessage('Service ID must be a valid integer'),
        body('configuration').isObject().withMessage('Configuration must be an object')
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
    serviceController.configureService
);

/**
 * @swagger
 * /api/services/plans:
 *   get:
 *     summary: Get predefined service plans
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [vps, hosting, domain, vpn, sms]
 *         description: Filter by service type
 *     responses:
 *       200:
 *         description: Service plans grouped by type
 */
router.get("/plans", serviceController.getServicePlans);

/**
 * @swagger
 * /api/services/stats:
 *   get:
 *     summary: Get service statistics (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/stats",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    serviceController.getServiceStats
);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create new service (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Service name
 *               type:
 *                 type: string
 *                 enum: [vps, hosting, domain, vpn, sms]
 *                 description: Service type
 *               description:
 *                 type: string
 *                 description: Service description
 *               price:
 *                 type: number
 *                 description: Service price
 *               features:
 *                 type: object
 *                 description: Service features
 *               specifications:
 *                 type: object
 *                 description: Service specifications
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *                 description: Service status
 *     responses:
 *       201:
 *         description: Service created successfully
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
        body('name').notEmpty().withMessage('Service name is required'),
        body('type').isIn(['vps', 'hosting', 'domain', 'vpn', 'sms']).withMessage('Invalid service type'),
        body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
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
    serviceController.createService
);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Update service (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Service name
 *               type:
 *                 type: string
 *                 enum: [vps, hosting, domain, vpn, sms]
 *                 description: Service type
 *               description:
 *                 type: string
 *                 description: Service description
 *               price:
 *                 type: number
 *                 description: Service price
 *               features:
 *                 type: object
 *                 description: Service features
 *               specifications:
 *                 type: object
 *                 description: Service specifications
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Service status
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Service not found
 */
router.put("/:id",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    serviceController.updateService
);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete service (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Service not found
 */
router.delete("/:id",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    serviceController.deleteService
);

/**
 * @swagger
 * /api/services/vps/operating-systems:
 *   get:
 *     summary: Get available operating systems for VPS
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of available operating systems
 */
router.get("/vps/operating-systems", (req, res) => {
    const operatingSystems = {
        linux: [
            { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', category: 'linux' },
            { id: 'ubuntu-20.04', name: 'Ubuntu 20.04 LTS', category: 'linux' },
            { id: 'centos-9', name: 'CentOS 9', category: 'linux' },
            { id: 'debian-11', name: 'Debian 11', category: 'linux' },
            { id: 'fedora-38', name: 'Fedora 38', category: 'linux' }
        ],
        windows: [
            { id: 'windows-2022', name: 'Windows Server 2022', category: 'windows' },
            { id: 'windows-2019', name: 'Windows Server 2019', category: 'windows' },
            { id: 'windows-11', name: 'Windows 11', category: 'windows' },
            { id: 'windows-10', name: 'Windows 10', category: 'windows' }
        ]
    };

    res.json({
        success: true,
        data: operatingSystems
    });
});

/**
 * @swagger
 * /api/services/vps/datacenters:
 *   get:
 *     summary: Get available datacenters for VPS
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of available datacenters
 */
router.get("/vps/datacenters", (req, res) => {
    const datacenters = [
        { id: 'iran-tehran', name: 'Tehran, Iran', country: 'Iran', city: 'Tehran' },
        { id: 'iran-isfahan', name: 'Isfahan, Iran', country: 'Iran', city: 'Isfahan' },
        { id: 'iran-mashhad', name: 'Mashhad, Iran', country: 'Iran', city: 'Mashhad' },
        { id: 'germany-frankfurt', name: 'Frankfurt, Germany', country: 'Germany', city: 'Frankfurt' },
        { id: 'netherlands-amsterdam', name: 'Amsterdam, Netherlands', country: 'Netherlands', city: 'Amsterdam' },
        { id: 'usa-newyork', name: 'New York, USA', country: 'USA', city: 'New York' }
    ];

    res.json({
        success: true,
        data: datacenters
    });
});

/**
 * @swagger
 * /api/services/vpn/locations:
 *   get:
 *     summary: Get available VPN locations
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of available VPN locations
 */
router.get("/vpn/locations", (req, res) => {
    const vpnLocations = [
        { id: 'iran', name: 'Iran', country: 'Iran', servers: 5 },
        { id: 'germany', name: 'Germany', country: 'Germany', servers: 3 },
        { id: 'netherlands', name: 'Netherlands', country: 'Netherlands', servers: 2 },
        { id: 'usa', name: 'United States', country: 'USA', servers: 4 },
        { id: 'uk', name: 'United Kingdom', country: 'UK', servers: 2 },
        { id: 'japan', name: 'Japan', country: 'Japan', servers: 1 }
    ];

    res.json({
        success: true,
        data: vpnLocations
    });
});

/**
 * @swagger
 * /api/services/domain/tlds:
 *   get:
 *     summary: Get available domain TLDs
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of available domain TLDs
 */
router.get("/domain/tlds", (req, res) => {
    const tlds = [
        { tld: '.ir', name: 'Iran', price: 150000, currency: 'IRR' },
        { tld: '.com', name: 'Commercial', price: 500000, currency: 'IRR' },
        { tld: '.net', name: 'Network', price: 550000, currency: 'IRR' },
        { tld: '.org', name: 'Organization', price: 600000, currency: 'IRR' },
        { tld: '.info', name: 'Information', price: 450000, currency: 'IRR' },
        { tld: '.co', name: 'Colombia', price: 400000, currency: 'IRR' },
        { tld: '.io', name: 'British Indian Ocean Territory', price: 800000, currency: 'IRR' }
    ];

    res.json({
        success: true,
        data: tlds
    });
});

/**
 * @swagger
 * /api/services/domain/check:
 *   post:
 *     summary: Check domain availability
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *             properties:
 *               domain:
 *                 type: string
 *                 description: Domain name to check
 *     responses:
 *       200:
 *         description: Domain availability status
 */
router.post("/domain/check",
    [
        body('domain').notEmpty().withMessage('Domain name is required')
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
    (req, res) => {
        const { domain } = req.body;

        // Mock domain availability check
        const isAvailable = Math.random() > 0.3; // 70% chance of being available

        res.json({
            success: true,
            data: {
                domain,
                available: isAvailable,
                price: isAvailable ? 500000 : null,
                currency: isAvailable ? 'IRR' : null
            }
        });
    }
);

module.exports = router; 