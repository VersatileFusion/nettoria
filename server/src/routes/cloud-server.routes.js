const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { body, validationResult } = require("express-validator");

/**
 * @swagger
 * /api/cloud-server:
 *   get:
 *     summary: Get all cloud servers
 *     tags: [Cloud Server]
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
 *         description: Number of servers per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [running, stopped, suspended, creating, deleting]
 *         description: Filter by server status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           enum: [iran, europe, usa]
 *         description: Filter by datacenter location
 *     responses:
 *       200:
 *         description: List of cloud servers
 *       401:
 *         description: Unauthorized
 */
router.get("/",
    authMiddleware.protect,
    async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const location = req.query.location;

            // Mock cloud servers data
            const mockServers = [
                {
                    id: 1,
                    name: "cloud-server-001",
                    status: "running",
                    location: "iran",
                    specs: {
                        cpu: 2,
                        ram: 4096,
                        storage: 50,
                        bandwidth: "Unlimited"
                    },
                    ip: "192.168.1.100",
                    createdAt: new Date(),
                    monthlyPrice: 18830
                },
                {
                    id: 2,
                    name: "cloud-server-002",
                    status: "stopped",
                    location: "europe",
                    specs: {
                        cpu: 4,
                        ram: 8192,
                        storage: 100,
                        bandwidth: "Unlimited"
                    },
                    ip: "10.0.0.50",
                    createdAt: new Date(),
                    monthlyPrice: 35600
                }
            ];

            let filteredServers = mockServers;
            if (status) {
                filteredServers = filteredServers.filter(server => server.status === status);
            }
            if (location) {
                filteredServers = filteredServers.filter(server => server.location === location);
            }

            const total = filteredServers.length;
            const offset = (page - 1) * limit;
            const servers = filteredServers.slice(offset, offset + limit);

            res.json({
                success: true,
                data: {
                    servers,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت لیست سرورهای ابری",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/cloud-server/{id}:
 *   get:
 *     summary: Get cloud server by ID
 *     tags: [Cloud Server]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Server ID
 *     responses:
 *       200:
 *         description: Cloud server details
 *       404:
 *         description: Server not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id",
    authMiddleware.protect,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Mock server data
            const server = {
                id: parseInt(id),
                name: `cloud-server-${id}`,
                status: "running",
                location: "iran",
                specs: {
                    cpu: 2,
                    ram: 4096,
                    storage: 50,
                    bandwidth: "Unlimited"
                },
                ip: "192.168.1.100",
                createdAt: new Date(),
                monthlyPrice: 18830,
                metrics: {
                    cpuUsage: 45,
                    memoryUsage: 67,
                    diskUsage: 23,
                    networkIn: 1024,
                    networkOut: 512
                }
            };

            res.json({
                success: true,
                data: { server }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت اطلاعات سرور",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/cloud-server:
 *   post:
 *     summary: Create new cloud server
 *     tags: [Cloud Server]
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
 *               - location
 *               - specs
 *             properties:
 *               name:
 *                 type: string
 *                 description: Server name
 *               location:
 *                 type: string
 *                 enum: [iran, europe, usa]
 *                 description: Datacenter location
 *               specs:
 *                 type: object
 *                 properties:
 *                   cpu:
 *                     type: integer
 *                     description: Number of CPU cores
 *                   ram:
 *                     type: integer
 *                     description: RAM in MB
 *                   storage:
 *                     type: integer
 *                     description: Storage in GB
 *                   os:
 *                     type: string
 *                     description: Operating system
 *     responses:
 *       201:
 *         description: Cloud server created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/",
    authMiddleware.protect,
    [
        body('name').notEmpty().withMessage('Server name is required'),
        body('location').isIn(['iran', 'europe', 'usa']).withMessage('Invalid location'),
        body('specs.cpu').isInt({ min: 1, max: 32 }).withMessage('CPU cores must be between 1 and 32'),
        body('specs.ram').isInt({ min: 1024, max: 65536 }).withMessage('RAM must be between 1024 and 65536 MB'),
        body('specs.storage').isInt({ min: 10, max: 2000 }).withMessage('Storage must be between 10 and 2000 GB')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: errors.array()
                });
            }

            const { name, location, specs } = req.body;
            const userId = req.user.id;

            // Calculate price based on specs
            const basePrice = 5000; // Base price per month
            const cpuPrice = specs.cpu * 2000;
            const ramPrice = specs.ram * 0.5;
            const storagePrice = specs.storage * 100;
            const locationMultiplier = location === 'iran' ? 1 : location === 'europe' ? 1.5 : 2;

            const monthlyPrice = (basePrice + cpuPrice + ramPrice + storagePrice) * locationMultiplier;

            // Mock server creation
            const server = {
                id: Date.now(),
                name,
                status: "creating",
                location,
                specs,
                ip: null,
                createdAt: new Date(),
                monthlyPrice: Math.round(monthlyPrice),
                userId
            };

            res.status(201).json({
                success: true,
                message: "سرور ابری با موفقیت ایجاد شد",
                data: { server }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در ایجاد سرور ابری",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/cloud-server/{id}/control:
 *   post:
 *     summary: Control cloud server (start, stop, restart)
 *     tags: [Cloud Server]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Server ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [start, stop, restart, suspend]
 *                 description: Control action
 *     responses:
 *       200:
 *         description: Server control action executed
 *       400:
 *         description: Invalid action
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Server not found
 */
router.post("/:id/control",
    authMiddleware.protect,
    [
        body('action').isIn(['start', 'stop', 'restart', 'suspend']).withMessage('Invalid action')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { action } = req.body;

            // Mock server control
            const server = {
                id: parseInt(id),
                status: action === 'start' ? 'running' : action === 'stop' ? 'stopped' : 'suspended'
            };

            res.json({
                success: true,
                message: `سرور با موفقیت ${action === 'start' ? 'شروع' : action === 'stop' ? 'متوقف' : 'معلق'} شد`,
                data: { server }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در کنترل سرور",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/cloud-server/{id}/metrics:
 *   get:
 *     summary: Get cloud server metrics
 *     tags: [Cloud Server]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Server ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d]
 *           default: 1h
 *         description: Metrics period
 *     responses:
 *       200:
 *         description: Server metrics
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Server not found
 */
router.get("/:id/metrics",
    authMiddleware.protect,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { period = '1h' } = req.query;

            // Mock metrics data
            const metrics = {
                cpu: {
                    current: 45,
                    average: 42,
                    peak: 89,
                    history: [
                        { timestamp: new Date(Date.now() - 3600000), value: 42 },
                        { timestamp: new Date(Date.now() - 1800000), value: 45 },
                        { timestamp: new Date(), value: 48 }
                    ]
                },
                memory: {
                    current: 67,
                    average: 65,
                    peak: 94,
                    history: [
                        { timestamp: new Date(Date.now() - 3600000), value: 65 },
                        { timestamp: new Date(Date.now() - 1800000), value: 67 },
                        { timestamp: new Date(), value: 69 }
                    ]
                },
                disk: {
                    current: 23,
                    average: 22,
                    peak: 45,
                    history: [
                        { timestamp: new Date(Date.now() - 3600000), value: 22 },
                        { timestamp: new Date(Date.now() - 1800000), value: 23 },
                        { timestamp: new Date(), value: 24 }
                    ]
                },
                network: {
                    bytesIn: 1024000000,
                    bytesOut: 512000000,
                    packetsIn: 1500000,
                    packetsOut: 750000
                }
            };

            res.json({
                success: true,
                data: { metrics }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت متریک‌های سرور",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/cloud-server/{id}/backup:
 *   post:
 *     summary: Create server backup
 *     tags: [Cloud Server]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Server ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Backup name
 *               description:
 *                 type: string
 *                 description: Backup description
 *     responses:
 *       200:
 *         description: Backup created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Server not found
 */
router.post("/:id/backup",
    authMiddleware.protect,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            // Mock backup creation
            const backup = {
                id: Date.now(),
                serverId: parseInt(id),
                name: name || `backup-${Date.now()}`,
                description: description || '',
                status: 'creating',
                size: 0,
                createdAt: new Date()
            };

            res.json({
                success: true,
                message: "بک‌آپ با موفقیت ایجاد شد",
                data: { backup }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در ایجاد بک‌آپ",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/cloud-server/{id}/backups:
 *   get:
 *     summary: Get server backups
 *     tags: [Cloud Server]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Server ID
 *     responses:
 *       200:
 *         description: List of server backups
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Server not found
 */
router.get("/:id/backups",
    authMiddleware.protect,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Mock backups data
            const backups = [
                {
                    id: 1,
                    serverId: parseInt(id),
                    name: "backup-001",
                    description: "Daily backup",
                    status: 'completed',
                    size: 2048000000, // 2GB
                    createdAt: new Date(Date.now() - 86400000)
                },
                {
                    id: 2,
                    serverId: parseInt(id),
                    name: "backup-002",
                    description: "Weekly backup",
                    status: 'completed',
                    size: 3072000000, // 3GB
                    createdAt: new Date(Date.now() - 604800000)
                }
            ];

            res.json({
                success: true,
                data: { backups }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت بک‌آپ‌ها",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/cloud-server/{id}:
 *   delete:
 *     summary: Delete cloud server
 *     tags: [Cloud Server]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Server ID
 *     responses:
 *       200:
 *         description: Server deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Server not found
 */
router.delete("/:id",
    authMiddleware.protect,
    async (req, res) => {
        try {
            const { id } = req.params;

            res.json({
                success: true,
                message: "سرور ابری با موفقیت حذف شد"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در حذف سرور ابری",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/cloud-server/pricing:
 *   get:
 *     summary: Get cloud server pricing
 *     tags: [Cloud Server]
 *     responses:
 *       200:
 *         description: Cloud server pricing information
 */
router.get("/pricing",
    async (req, res) => {
        try {
            const pricing = {
                locations: {
                    iran: {
                        name: "ایران",
                        multiplier: 1.0,
                        basePrice: 5000
                    },
                    europe: {
                        name: "اروپا",
                        multiplier: 1.5,
                        basePrice: 7500
                    },
                    usa: {
                        name: "آمریکا",
                        multiplier: 2.0,
                        basePrice: 10000
                    }
                },
                specs: {
                    cpu: {
                        pricePerCore: 2000,
                        unit: "Core"
                    },
                    ram: {
                        pricePerGB: 500,
                        unit: "GB"
                    },
                    storage: {
                        pricePerGB: 100,
                        unit: "GB"
                    }
                },
                billingCycles: {
                    hourly: { multiplier: 1 / 730, discount: 0 },
                    daily: { multiplier: 1 / 30, discount: 0 },
                    monthly: { multiplier: 1, discount: 0 },
                    quarterly: { multiplier: 3, discount: 0.05 },
                    yearly: { multiplier: 12, discount: 0.15 }
                }
            };

            res.json({
                success: true,
                data: { pricing }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت قیمت‌گذاری",
                error: error.message
            });
        }
    }
);

module.exports = router; 