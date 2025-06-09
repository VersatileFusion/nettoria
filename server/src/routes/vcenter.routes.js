const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const vCenterService = require("../services/vCenter.service");

console.log("Initializing VCenter Routes...");

/**
 * @swagger
 * tags:
 *   name: VCenter
 *   description: vCenter virtual machine management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VirtualMachine:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: vm-1234
 *         name:
 *           type: string
 *           example: customer-vm-01
 *         status:
 *           type: string
 *           enum: [poweredOn, poweredOff, suspended]
 *           example: poweredOn
 *         cpuCount:
 *           type: integer
 *           example: 2
 *         memoryGB:
 *           type: integer
 *           example: 4
 *         diskGB:
 *           type: integer
 *           example: 100
 *         ipAddress:
 *           type: string
 *           example: 192.168.1.100
 *         osType:
 *           type: string
 *           example: Windows Server 2022
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00Z
 *         userId:
 *           type: integer
 *           example: 1
 *         orderId:
 *           type: integer
 *           example: 123
 *         hostSystem:
 *           type: string
 *           example: esxi-host-01
 *         datastore:
 *           type: string
 *           example: datastore-01
 */

/**
 * @swagger
 * /api/vcenter/vms:
 *   get:
 *     summary: Get list of virtual machines
 *     tags: [VCenter]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a list of virtual machines belonging to the authenticated user
 *     responses:
 *       200:
 *         description: List of virtual machines
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     vms:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/VirtualMachine'
 *       401:
 *         description: Not authenticated
 */
router.get("/vms", authMiddleware.protect, (req, res) => {
    console.log("Fetching user VMs");

    // For demo purposes, we'll just return sample VMs
    res.status(200).json({
        status: "success",
        data: {
            vms: [
                {
                    id: "vm-1234",
                    name: "customer-vm-01",
                    status: "poweredOn",
                    cpuCount: 2,
                    memoryGB: 4,
                    diskGB: 100,
                    ipAddress: "192.168.1.100",
                    osType: "Windows Server 2022",
                    createdAt: new Date(
                        Date.now() - 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    userId: req.user.id,
                    orderId: 123,
                    hostSystem: "esxi-host-01",
                    datastore: "datastore-01",
                },
                {
                    id: "vm-5678",
                    name: "customer-vm-02",
                    status: "poweredOff",
                    cpuCount: 4,
                    memoryGB: 8,
                    diskGB: 200,
                    ipAddress: "192.168.1.101",
                    osType: "Ubuntu 22.04 LTS",
                    createdAt: new Date(
                        Date.now() - 15 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    userId: req.user.id,
                    orderId: 124,
                    hostSystem: "esxi-host-02",
                    datastore: "datastore-02",
                },
            ],
        },
    });
});

/**
 * @swagger
 * /api/vcenter/vms/{id}:
 *   get:
 *     summary: Get virtual machine details
 *     tags: [VCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: VM ID
 *     responses:
 *       200:
 *         description: Detailed VM information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     vm:
 *                       $ref: '#/components/schemas/VirtualMachine'
 *       404:
 *         description: VM not found
 *       401:
 *         description: Not authenticated
 */
router.get("/vms/:id", authMiddleware.protect, (req, res) => {
    console.log(`Fetching VM with ID: ${req.params.id}`);

    // Mock VM data based on the ID
    const vmId = req.params.id;

    if (vmId === "vm-1234") {
        res.status(200).json({
            status: "success",
            data: {
                vm: {
                    id: "vm-1234",
                    name: "customer-vm-01",
                    status: "poweredOn",
                    cpuCount: 2,
                    memoryGB: 4,
                    diskGB: 100,
                    ipAddress: "192.168.1.100",
                    osType: "Windows Server 2022",
                    createdAt: new Date(
                        Date.now() - 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    userId: req.user.id,
                    orderId: 123,
                    hostSystem: "esxi-host-01",
                    datastore: "datastore-01",
                    networkAdapters: [
                        {
                            name: "Network adapter 1",
                            type: "VMXNET3",
                            connected: true,
                            macAddress: "00:50:56:9a:00:01",
                            network: "VM Network",
                        },
                    ],
                    disks: [
                        {
                            label: "Hard disk 1",
                            capacityGB: 100,
                            format: "thin",
                            path: "[datastore-01] customer-vm-01/customer-vm-01.vmdk",
                        },
                    ],
                },
            },
        });
    } else if (vmId === "vm-5678") {
        res.status(200).json({
            status: "success",
            data: {
                vm: {
                    id: "vm-5678",
                    name: "customer-vm-02",
                    status: "poweredOff",
                    cpuCount: 4,
                    memoryGB: 8,
                    diskGB: 200,
                    ipAddress: "192.168.1.101",
                    osType: "Ubuntu 22.04 LTS",
                    createdAt: new Date(
                        Date.now() - 15 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    userId: req.user.id,
                    orderId: 124,
                    hostSystem: "esxi-host-02",
                    datastore: "datastore-02",
                    networkAdapters: [
                        {
                            name: "Network adapter 1",
                            type: "VMXNET3",
                            connected: false,
                            macAddress: "00:50:56:9a:00:02",
                            network: "VM Network",
                        },
                    ],
                    disks: [
                        {
                            label: "Hard disk 1",
                            capacityGB: 200,
                            format: "thin",
                            path: "[datastore-02] customer-vm-02/customer-vm-02.vmdk",
                        },
                    ],
                },
            },
        });
    } else {
        res.status(404).json({
            status: "error",
            message: "VM not found",
        });
    }
});

/**
 * @swagger
 * /api/vcenter/vms/{id}/power:
 *   post:
 *     summary: Change power state of a VM
 *     tags: [VCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [on, off, reset, suspend]
 *                 example: on
 *                 description: Power action to perform
 *     responses:
 *       200:
 *         description: Power operation initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Power on operation initiated
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                       example: task-1234
 *       400:
 *         description: Invalid request
 *       404:
 *         description: VM not found
 *       401:
 *         description: Not authenticated
 */
router.post("/vms/:id/power", authMiddleware.protect, (req, res) => {
    console.log(`Changing power state for VM ${req.params.id}`, req.body);

    const validActions = ["on", "off", "reset", "suspend"];
    const action = req.body.action;

    if (!validActions.includes(action)) {
        return res.status(400).json({
            status: "error",
            message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        });
    }

    // Map action to a status message
    const actionMessages = {
        on: "Power on operation initiated",
        off: "Power off operation initiated",
        reset: "Reset operation initiated",
        suspend: "Suspend operation initiated",
    };

    // For demo purposes, just return success
    res.status(200).json({
        status: "success",
        message: actionMessages[action],
        data: {
            taskId: `task-${Date.now()}`,
            vmId: req.params.id,
            action: action,
        },
    });
});

/**
 * @swagger
 * /api/vcenter/vms/{id}/snapshot:
 *   post:
 *     summary: Create a snapshot of a VM
 *     tags: [VCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Before Windows Update
 *                 description: Name of the snapshot
 *               description:
 *                 type: string
 *                 example: Snapshot taken before installing Windows updates
 *                 description: Description of the snapshot
 *               memory:
 *                 type: boolean
 *                 example: false
 *                 description: Whether to include memory in the snapshot
 *               quiesce:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to quiesce the guest file system
 *     responses:
 *       200:
 *         description: Snapshot creation initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Snapshot creation initiated
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                       example: task-5678
 *                     snapshotId:
 *                       type: string
 *                       example: snapshot-1234
 *       400:
 *         description: Invalid request
 *       404:
 *         description: VM not found
 *       401:
 *         description: Not authenticated
 */
router.post("/vms/:id/snapshot", authMiddleware.protect, (req, res) => {
    console.log(`Creating snapshot for VM ${req.params.id}`, req.body);

    // Validate request
    if (!req.body.name) {
        return res.status(400).json({
            status: "error",
            message: "Snapshot name is required",
        });
    }

    // For demo purposes, just return success
    res.status(200).json({
        status: "success",
        message: "Snapshot creation initiated",
        data: {
            taskId: `task-${Date.now()}`,
            snapshotId: `snapshot-${Date.now()}`,
            vmId: req.params.id,
            name: req.body.name,
            description: req.body.description || "",
            createdAt: new Date().toISOString(),
        },
    });
});

/**
 * @swagger
 * /api/vcenter/vms/{id}/console:
 *   get:
 *     summary: Get console URL for a VM
 *     tags: [VCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: VM ID
 *     responses:
 *       200:
 *         description: Console URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     consoleUrl:
 *                       type: string
 *                       example: https://vcenter.example.com/console/12345
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T13:00:00Z
 *       404:
 *         description: VM not found
 *       401:
 *         description: Not authenticated
 */
router.get("/vms/:id/console", authMiddleware.protect, (req, res) => {
    console.log(`Generating console URL for VM ${req.params.id}`);

    // For demo purposes, just return a mock URL
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    res.status(200).json({
        status: "success",
        data: {
            consoleUrl: `https://vcenter.example.com/console/${req.params.id
                }?token=mockToken${Date.now()}`,
            expiresAt: expiresAt.toISOString(),
            type: "vmrc",
            vmId: req.params.id,
        },
    });
});

/**
 * @swagger
 * /api/vcenter/tasks:
 *   get:
 *     tags: [vCenter]
 *     summary: Get recent vCenter tasks
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of tasks to return
 *       - in: query
 *         name: vmId
 *         schema:
 *           type: string
 *         description: Filter tasks by VM ID
 *     responses:
 *       200:
 *         description: List of recent tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   operation:
 *                     type: string
 *                   target:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [running, completed, failed]
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                   userId:
 *                     type: string
 */
router.get('/tasks', async (req, res) => {
    try {
        const { limit = 10, vmId } = req.query;
        const tasks = await vCenterService.getRecentTasks(limit, vmId);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست وظایف' });
    }
});

/**
 * @swagger
 * /api/vcenter/vms/{vmId}/metrics:
 *   get:
 *     tags: [vCenter]
 *     summary: Get VM metrics
 *     parameters:
 *       - in: path
 *         name: vmId
 *         required: true
 *         schema:
 *           type: string
 *         description: VM ID
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d]
 *           default: 1h
 *         description: Time duration for metrics
 *     responses:
 *       200:
 *         description: VM metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cpu:
 *                   type: object
 *                   properties:
 *                     usage:
 *                       type: number
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           value:
 *                             type: number
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                     total:
 *                       type: number
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           value:
 *                             type: number
 *                 disk:
 *                   type: object
 *                   properties:
 *                     read:
 *                       type: number
 *                     write:
 *                       type: number
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           read:
 *                             type: number
 *                           write:
 *                             type: number
 *                 network:
 *                   type: object
 *                   properties:
 *                     rx:
 *                       type: number
 *                     tx:
 *                       type: number
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           rx:
 *                             type: number
 *                           tx:
 *                             type: number
 */
router.get('/vms/:vmId/metrics', async (req, res) => {
    try {
        const { vmId } = req.params;
        const { duration = '1h' } = req.query;
        const metrics = await vCenterService.getVMMetrics(vmId, duration);
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching VM metrics:', error);
        res.status(500).json({ error: 'خطا در دریافت اطلاعات عملکرد سرور' });
    }
});

/**
 * @swagger
 * /api/vcenter/quotas:
 *   get:
 *     tags: [vCenter]
 *     summary: Get VM resource quotas and limits
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resource quotas and limits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cpu:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     used:
 *                       type: integer
 *                 memory:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     used:
 *                       type: integer
 *                 storage:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     used:
 *                       type: integer
 *                 network:
 *                   type: object
 *                   properties:
 *                     bandwidth:
 *                       type: integer
 *                     used:
 *                       type: integer
 */
router.get('/quotas', authMiddleware.protect, async (req, res) => {
    try {
        const quotas = await vCenterService.getResourceQuotas(req.user.id);
        res.json(quotas);
    } catch (error) {
        console.error('Error fetching resource quotas:', error);
        res.status(500).json({ error: 'خطا در دریافت سهمیه‌های منابع' });
    }
});

/**
 * @swagger
 * /api/vcenter/vms/{vmId}/backup:
 *   post:
 *     tags: [vCenter]
 *     summary: Create VM backup
 *     parameters:
 *       - in: path
 *         name: vmId
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               retention:
 *                 type: integer
 *                 description: Number of days to retain the backup
 *     responses:
 *       200:
 *         description: Backup creation initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                 backupId:
 *                   type: string
 */
router.post('/vms/:vmId/backup', authMiddleware.protect, async (req, res) => {
    try {
        const { vmId } = req.params;
        const backupData = req.body;
        const result = await vCenterService.createVMBackup(vmId, backupData);
        res.json(result);
    } catch (error) {
        console.error('Error creating VM backup:', error);
        res.status(500).json({ error: 'خطا در ایجاد پشتیبان' });
    }
});

/**
 * @swagger
 * /api/vcenter/vms/{vmId}/scale:
 *   post:
 *     tags: [vCenter]
 *     summary: Scale VM resources
 *     parameters:
 *       - in: path
 *         name: vmId
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
 *               cpuCount:
 *                 type: integer
 *               memoryGB:
 *                 type: integer
 *               diskGB:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resource scaling initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post('/vms/:vmId/scale', authMiddleware.protect, async (req, res) => {
    try {
        const { vmId } = req.params;
        const scaleData = req.body;
        const result = await vCenterService.scaleVMResources(vmId, scaleData);
        res.json(result);
    } catch (error) {
        console.error('Error scaling VM resources:', error);
        res.status(500).json({ error: 'خطا در تغییر منابع سرور' });
    }
});

/**
 * @swagger
 * /api/vcenter/alerts:
 *   get:
 *     tags: [vCenter]
 *     summary: Get monitoring alerts
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, resolved]
 *         description: Filter alerts by status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [critical, warning, info]
 *         description: Filter alerts by severity
 *     responses:
 *       200:
 *         description: List of monitoring alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   vmId:
 *                     type: string
 *                   type:
 *                     type: string
 *                   severity:
 *                     type: string
 *                   message:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   resolvedAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/alerts', authMiddleware.protect, async (req, res) => {
    try {
        const { status, severity } = req.query;
        const alerts = await vCenterService.getMonitoringAlerts(req.user.id, { status, severity });
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching monitoring alerts:', error);
        res.status(500).json({ error: 'خطا در دریافت هشدارها' });
    }
});

/**
 * @swagger
 * /api/vcenter/alerts/{alertId}/resolve:
 *   post:
 *     tags: [vCenter]
 *     summary: Resolve a monitoring alert
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 */
router.post('/alerts/:alertId/resolve', authMiddleware.protect, async (req, res) => {
    try {
        const { alertId } = req.params;
        await vCenterService.resolveAlert(alertId);
        res.json({ message: 'هشدار با موفقیت برطرف شد' });
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({ error: 'خطا در برطرف کردن هشدار' });
    }
});

/**
 * @swagger
 * /api/vcenter/vms/{vmId}/analytics:
 *   get:
 *     summary: Get VM performance analytics
 *     parameters:
 *       - in: path
 *         name: vmId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: VM performance analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cpu:
 *                   type: object
 *                   properties:
 *                     utilization:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           value:
 *                             type: number
 *                 memory:
 *                   type: object
 *                   properties:
 *                     utilization:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           value:
 *                             type: number
 */
router.get('/vms/:vmId/analytics', authMiddleware.protect, async (req, res) => {
    try {
        const { vmId } = req.params;
        const { period = 'day' } = req.query;
        
        const analytics = await vCenterService.getVMAnalytics(vmId, period);
        res.json(analytics);
    } catch (error) {
        console.error('Error fetching VM analytics:', error);
        res.status(500).json({ error: 'خطا در دریافت تحلیل‌های عملکرد' });
    }
});

/**
 * @swagger
 * /api/vcenter/vms/{vmId}/forecast:
 *   get:
 *     summary: Get VM resource usage forecast
 *     parameters:
 *       - in: path
 *         name: vmId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: horizon
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d]
 *           default: 24h
 *     responses:
 *       200:
 *         description: VM resource usage forecast
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cpu:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       predicted:
 *                         type: number
 *                       confidence:
 *                         type: number
 *                 memory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       predicted:
 *                         type: number
 *                       confidence:
 *                         type: number
 */
router.get('/vms/:vmId/forecast', authMiddleware.protect, async (req, res) => {
    try {
        const { vmId } = req.params;
        const { horizon = '24h' } = req.query;
        
        const forecast = await vCenterService.getVMForecast(vmId, horizon);
        res.json(forecast);
    } catch (error) {
        console.error('Error fetching VM forecast:', error);
        res.status(500).json({ error: 'خطا در دریافت پیش‌بینی مصرف منابع' });
    }
});

/**
 * @swagger
 * /api/vcenter/vms/{vmId}/optimize:
 *   post:
 *     summary: Optimize VM resource allocation
 *     parameters:
 *       - in: path
 *         name: vmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: VM optimization task started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post('/vms/:vmId/optimize', authMiddleware.protect, async (req, res) => {
    try {
        const { vmId } = req.params;
        const taskId = await vCenterService.optimizeVM(vmId);
        res.json({ taskId, message: 'بهینه‌سازی منابع سرور آغاز شد' });
    } catch (error) {
        console.error('Error optimizing VM:', error);
        res.status(500).json({ error: 'خطا در بهینه‌سازی منابع سرور' });
    }
});

/**
 * @swagger
 * /api/vcenter/vms/{vmId}/recommendations:
 *   get:
 *     summary: Get VM resource optimization recommendations
 *     parameters:
 *       - in: path
 *         name: vmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: VM resource optimization recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [cpu, memory, storage, network]
 *                       current:
 *                         type: number
 *                       recommended:
 *                         type: number
 *                       reason:
 *                         type: string
 */
router.get('/vms/:vmId/recommendations', authMiddleware.protect, async (req, res) => {
    try {
        const { vmId } = req.params;
        const recommendations = await vCenterService.getVMRecommendations(vmId);
        res.json({ recommendations });
    } catch (error) {
        console.error('Error fetching VM recommendations:', error);
        res.status(500).json({ error: 'خطا در دریافت توصیه‌های بهینه‌سازی' });
    }
});

// For demonstration only - mock endpoint
router.get("/demo", (req, res) => {
    res.json({
        message: "VCenter API is working (mock mode)",
        vms: [
            { id: "vm-1234", name: "customer-vm-01", status: "poweredOn" },
            { id: "vm-5678", name: "customer-vm-02", status: "poweredOff" },
        ],
    });
});

console.log("VCenter Routes initialized successfully");

module.exports = router;
