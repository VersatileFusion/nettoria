const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/dashboard",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getDashboardStats
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
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
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user, support]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, email, or phone
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/users",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getAllUsers
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/users/:id",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getUserById
);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               role:
 *                 type: string
 *                 enum: [admin, user, support]
 *     responses:
 *       200:
 *         description: User status updated
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put("/users/:id/status",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.updateUserStatus
);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Admin]
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
 *         description: Number of orders per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in order number or user email
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/orders",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getAllOrders
);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order by ID (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/orders/:id",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getOrderById
);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update order status (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *               notes:
 *                 type: string
 *                 description: Admin notes
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put("/orders/:id/status",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.updateOrderStatus
);

/**
 * @swagger
 * /api/admin/tickets:
 *   get:
 *     summary: Get all tickets (admin only)
 *     tags: [Admin]
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
 *         description: Number of tickets per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, replied, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/tickets",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getAllTickets
);

/**
 * @swagger
 * /api/admin/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/tickets/:id",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getTicketById
);

/**
 * @swagger
 * /api/admin/tickets/{id}/reply:
 *   post:
 *     summary: Reply to ticket as admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Reply message
 *               isInternal:
 *                 type: boolean
 *                 description: Whether this is an internal note
 *     responses:
 *       200:
 *         description: Reply sent successfully
 *       404:
 *         description: Ticket not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/tickets/:id/reply",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.replyToTicket
);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get system analytics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Period in days
 *     responses:
 *       200:
 *         description: System analytics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/analytics",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getSystemAnalytics
);

/**
 * @swagger
 * /api/admin/notifications:
 *   post:
 *     summary: Send notification to users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               type:
 *                 type: string
 *                 enum: [info, warning, success, error]
 *                 description: Notification type
 *               targetUsers:
 *                 oneOf:
 *                   - type: string
 *                     enum: [all, premium]
 *                   - type: array
 *                     items:
 *                       type: integer
 *                 description: Target users (all, premium, or specific user IDs)
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/notifications",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.sendNotification
);

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Get system health status (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/health",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    adminController.getSystemHealth
);

/**
 * @swagger
 * /api/admin/vcenter/quotas:
 *   get:
 *     summary: Get vCenter quotas (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: vCenter quotas
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/vcenter/quotas",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    async (req, res) => {
        try {
            // This would integrate with your vCenter service
            const quotas = {
                cpu: {
                    total: 100,
                    used: 65,
                    available: 35
                },
                memory: {
                    total: 1024, // GB
                    used: 678,
                    available: 346
                },
                storage: {
                    total: 10000, // GB
                    used: 4500,
                    available: 5500
                },
                networks: {
                    total: 50,
                    used: 23,
                    available: 27
                }
            };

            res.json({
                success: true,
                data: quotas
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت سهمیه‌های vCenter",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/admin/vcenter/tasks:
 *   get:
 *     summary: Get vCenter tasks (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [running, completed, failed]
 *         description: Filter by task status
 *     responses:
 *       200:
 *         description: vCenter tasks
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/vcenter/tasks",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    async (req, res) => {
        try {
            const { status } = req.query;

            // Mock vCenter tasks data
            const tasks = [
                {
                    id: 1,
                    name: "Create VM",
                    status: "completed",
                    progress: 100,
                    startTime: new Date(Date.now() - 3600000),
                    endTime: new Date(Date.now() - 3500000),
                    user: "admin",
                    description: "Creating virtual machine vm-001"
                },
                {
                    id: 2,
                    name: "Power On VM",
                    status: "running",
                    progress: 75,
                    startTime: new Date(Date.now() - 1800000),
                    endTime: null,
                    user: "admin",
                    description: "Powering on virtual machine vm-002"
                },
                {
                    id: 3,
                    name: "Snapshot VM",
                    status: "failed",
                    progress: 45,
                    startTime: new Date(Date.now() - 900000),
                    endTime: new Date(Date.now() - 800000),
                    user: "admin",
                    description: "Creating snapshot for vm-003",
                    error: "Insufficient storage space"
                }
            ];

            let filteredTasks = tasks;
            if (status) {
                filteredTasks = tasks.filter(task => task.status === status);
            }

            res.json({
                success: true,
                data: filteredTasks
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت وظایف vCenter",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/admin/vcenter/vms/{vmId}/analytics:
 *   get:
 *     summary: Get VM analytics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vmId
 *         schema:
 *           type: string
 *         required: true
 *         description: VM ID
 *     responses:
 *       200:
 *         description: VM analytics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/vcenter/vms/:vmId/analytics",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    async (req, res) => {
        try {
            const { vmId } = req.params;

            // Mock VM analytics data
            const analytics = {
                vmId,
                period: "last_30_days",
                cpu: {
                    average: 45.2,
                    peak: 89.7,
                    utilization: [
                        { timestamp: "2024-01-01T00:00:00Z", value: 42.1 },
                        { timestamp: "2024-01-01T01:00:00Z", value: 38.9 },
                        { timestamp: "2024-01-01T02:00:00Z", value: 51.3 }
                    ]
                },
                memory: {
                    average: 67.8,
                    peak: 94.2,
                    utilization: [
                        { timestamp: "2024-01-01T00:00:00Z", value: 65.4 },
                        { timestamp: "2024-01-01T01:00:00Z", value: 69.1 },
                        { timestamp: "2024-01-01T02:00:00Z", value: 72.3 }
                    ]
                },
                network: {
                    bytesIn: 1024000000,
                    bytesOut: 512000000,
                    packetsIn: 1500000,
                    packetsOut: 750000
                },
                storage: {
                    readBytes: 2048000000,
                    writeBytes: 1024000000,
                    readOps: 50000,
                    writeOps: 25000
                }
            };

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت تحلیل VM",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/admin/vcenter/vms/{vmId}/forecast:
 *   get:
 *     summary: Get VM resource forecast (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vmId
 *         schema:
 *           type: string
 *         required: true
 *         description: VM ID
 *     responses:
 *       200:
 *         description: VM resource forecast
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/vcenter/vms/:vmId/forecast",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    async (req, res) => {
        try {
            const { vmId } = req.params;

            // Mock VM forecast data
            const forecast = {
                vmId,
                period: "next_7_days",
                predictions: {
                    cpu: {
                        trend: "increasing",
                        confidence: 0.85,
                        predictedPeak: 95.2,
                        recommendations: [
                            "Consider upgrading CPU allocation",
                            "Monitor application performance"
                        ]
                    },
                    memory: {
                        trend: "stable",
                        confidence: 0.78,
                        predictedPeak: 78.9,
                        recommendations: [
                            "Current allocation is adequate",
                            "Monitor for unusual spikes"
                        ]
                    },
                    storage: {
                        trend: "increasing",
                        confidence: 0.92,
                        predictedUsage: 85.6,
                        recommendations: [
                            "Plan for storage expansion",
                            "Consider data archiving"
                        ]
                    }
                },
                alerts: [
                    {
                        type: "warning",
                        message: "CPU usage predicted to exceed 90% within 3 days",
                        severity: "medium"
                    }
                ]
            };

            res.json({
                success: true,
                data: forecast
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در دریافت پیش‌بینی VM",
                error: error.message
            });
        }
    }
);

/**
 * @swagger
 * /api/admin/vcenter/vms/{vmId}/optimize:
 *   post:
 *     summary: Optimize VM resources (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vmId
 *         schema:
 *           type: string
 *         required: true
 *         description: VM ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               optimizationType:
 *                 type: string
 *                 enum: [cpu, memory, storage, all]
 *                 description: Type of optimization
 *               targetEfficiency:
 *                 type: number
 *                 description: Target efficiency percentage
 *     responses:
 *       200:
 *         description: VM optimization initiated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/vcenter/vms/:vmId/optimize",
    authMiddleware.protect,
    authMiddleware.isAdmin,
    async (req, res) => {
        try {
            const { vmId } = req.params;
            const { optimizationType, targetEfficiency } = req.body;

            // Mock optimization response
            const optimization = {
                vmId,
                optimizationType: optimizationType || 'all',
                targetEfficiency: targetEfficiency || 85,
                status: 'initiated',
                taskId: `opt-${Date.now()}`,
                estimatedDuration: '15 minutes',
                recommendations: [
                    'Reducing CPU allocation by 10%',
                    'Optimizing memory usage patterns',
                    'Consolidating storage operations'
                ]
            };

            res.json({
                success: true,
                message: "بهینه‌سازی VM آغاز شد",
                data: optimization
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "خطا در آغاز بهینه‌سازی VM",
                error: error.message
            });
        }
    }
);

module.exports = router; 