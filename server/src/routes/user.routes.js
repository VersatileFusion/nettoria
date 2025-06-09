const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const userController = require('../controllers/user.controller');

console.log("Initializing User Routes...");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [admin, user, support]
 *           example: user
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           example: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T12:00:00Z
 *       required:
 *         - name
 *         - email
 *         - role
 *         - status
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authMiddleware.protect, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */
router.put('/profile', authMiddleware.protect, userController.updateProfile);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */
router.put('/password', authMiddleware.protect, userController.changePassword);

/**
 * @swagger
 * /api/users/security:
 *   get:
 *     summary: Get user security settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/security', authMiddleware.protect, userController.getSecuritySettings);

/**
 * @swagger
 * /api/users/security:
 *   put:
 *     summary: Update user security settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               twoFactorEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Security settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/security', authMiddleware.protect, userController.updateSecuritySettings);

/**
 * @swagger
 * /api/users/two-factor:
 *   put:
 *     summary: Toggle two-factor authentication
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Two-factor authentication status updated
 *       401:
 *         description: Unauthorized
 */
router.put('/two-factor', authMiddleware.protect, userController.toggleTwoFactor);

/**
 * @swagger
 * /api/users/verify-2fa:
 *   post:
 *     summary: Verify two-factor authentication setup
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Two-factor authentication verified
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid code
 */
router.post('/verify-2fa', authMiddleware.protect, userController.verifyTwoFactor);

/**
 * @swagger
 * /api/users/notifications:
 *   get:
 *     summary: Get user notification settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications', authMiddleware.protect, userController.getNotificationSettings);

/**
 * @swagger
 * /api/users/notifications:
 *   put:
 *     summary: Update user notification settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notify_email:
 *                 type: boolean
 *               notify_sms:
 *                 type: boolean
 *               notify_service:
 *                 type: boolean
 *               notify_payment:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/notifications', authMiddleware.protect, userController.updateNotificationSettings);

/**
 * @swagger
 * /api/users/login-history:
 *   get:
 *     summary: Get user login history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/login-history', authMiddleware.protect, userController.getLoginHistory);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of users (admin only)
 *     tags: [Users]
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
 *         description: Filter users by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter users by status
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  (req, res) => {
    console.log("Admin fetching user list");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const status = req.query.status;

    // In a real application, you would query the database with filters
    // For this demo, we'll just return sample users
    const users = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        status: "active",
        createdAt: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "admin",
        status: "active",
        createdAt: new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "support",
        status: "inactive",
        createdAt: new Date(
          Date.now() - 45 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Apply filters if provided
    let filteredUsers = [...users];
    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }
    if (status) {
      filteredUsers = filteredUsers.filter((user) => user.status === status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.status(200).json({
      status: "success",
      results: paginatedUsers.length,
      data: {
        users: paginatedUsers,
      },
    });
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  (req, res) => {
    console.log(`Admin fetching user with ID: ${req.params.id}`);

    const userId = parseInt(req.params.id);

    // Mock user data based on the ID
    if (userId === 1) {
      res.status(200).json({
        status: "success",
        data: {
          user: {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "user",
            status: "active",
            createdAt: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            updatedAt: new Date(
              Date.now() - 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        },
      });
    } else if (userId === 2) {
      res.status(200).json({
        status: "success",
        data: {
          user: {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "admin",
            status: "active",
            createdAt: new Date(
              Date.now() - 60 * 24 * 60 * 60 * 1000
            ).toISOString(),
            updatedAt: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        },
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user status (admin only)
 *     tags: [Users]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 example: inactive
 *     responses:
 *       200:
 *         description: Status updated successfully
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
 *                   example: User status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.patch(
  "/:id/status",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  (req, res) => {
    console.log(
      `Admin updating status for user ID: ${req.params.id}`,
      req.body
    );

    const userId = parseInt(req.params.id);
    const { status } = req.body;

    // Validate input
    const validStatuses = ["active", "inactive", "suspended"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // For demo purposes, we'll just return success
    res.status(200).json({
      status: "success",
      message: "User status updated successfully",
      data: {
        user: {
          id: userId,
          name: userId === 1 ? "John Doe" : "Jane Smith",
          email: userId === 1 ? "john@example.com" : "jane@example.com",
          role: userId === 1 ? "user" : "admin",
          status: status,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }
);

// For demonstration only - mock endpoint
router.get("/demo", (req, res) => {
  res.json({
    message: "User API is working (mock mode)",
    demoUsers: [
      { id: 1, name: "Demo User", email: "demo@example.com", role: "user" },
      { id: 2, name: "Demo Admin", email: "admin@example.com", role: "admin" },
    ],
  });
});

console.log("User Routes initialized successfully");

module.exports = router;
