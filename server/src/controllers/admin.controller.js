const User = require("../models/user.model");
const Order = require("../models/order.model");
const Ticket = require("../models/ticket.model");
const Service = require("../models/service.model");
const VirtualMachine = require("../models/vm.model");
const Wallet = require("../models/wallet.model");
const Transaction = require("../models/wallet.model");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * Admin Dashboard Statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Get total orders
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const completedOrders = await Order.count({ where: { status: 'completed' } });

    // Get total revenue
    const totalRevenue = await Transaction.sum('amount', {
      where: {
        type: 'deposit',
        status: 'completed'
      }
    });

    // Get total tickets
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({ where: { status: 'open' } });
    const resolvedTickets = await Ticket.count({ where: { status: 'resolved' } });

    // Get VM statistics
    const totalVMs = await VirtualMachine.count();
    const activeVMs = await VirtualMachine.count({ where: { status: 'running' } });

    // Get recent activities
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
    });

    const recentOrders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }]
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        revenue: {
          total: totalRevenue || 0
        },
        tickets: {
          total: totalTickets,
          open: openTickets,
          resolved: resolvedTickets
        },
        vms: {
          total: totalVMs,
          active: activeVMs
        },
        recent: {
          users: recentUsers,
          orders: recentOrders
        }
      }
    });
  } catch (error) {
    logger.error("Error getting dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت آمار داشبورد",
      error: error.message
    });
  }
};

/**
 * Get all users with admin privileges
 */
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const status = req.query.status;
    const search = req.query.search;

    const whereClause = {};

    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'twoFactorSecret'] }
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error("Error getting all users:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت لیست کاربران",
      error: error.message
    });
  }
};

/**
 * Get user by ID with admin privileges
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'twoFactorSecret'] },
      include: [
        {
          model: Order,
          as: 'orders',
          limit: 10,
          order: [['createdAt', 'DESC']]
        },
        {
          model: VirtualMachine,
          as: 'virtualMachines',
          limit: 10,
          order: [['createdAt', 'DESC']]
        },
        {
          model: Ticket,
          as: 'tickets',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "کاربر یافت نشد"
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error("Error getting user by ID:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اطلاعات کاربر",
      error: error.message
    });
  }
};

/**
 * Update user status (admin only)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "کاربر یافت نشد"
      });
    }

    // Update user status and role
    if (status) user.status = status;
    if (role) user.role = role;

    await user.save();

    res.json({
      success: true,
      message: "وضعیت کاربر با موفقیت به‌روزرسانی شد",
      data: { user }
    });
  } catch (error) {
    logger.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی وضعیت کاربر",
      error: error.message
    });
  }
};

/**
 * Get all orders with admin privileges
 */
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { orderNumber: { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Service, attributes: ['id', 'name', 'type'] }
      ]
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error("Error getting all orders:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت لیست سفارشات",
      error: error.message
    });
  }
};

/**
 * Get order by ID with admin privileges
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] },
        { model: Service, attributes: ['id', 'name', 'type', 'description'] }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "سفارش یافت نشد"
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    logger.error("Error getting order by ID:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اطلاعات سفارش",
      error: error.message
    });
  }
};

/**
 * Update order status (admin only)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "سفارش یافت نشد"
      });
    }

    order.status = status;
    if (notes) order.adminNotes = notes;

    await order.save();

    res.json({
      success: true,
      message: "وضعیت سفارش با موفقیت به‌روزرسانی شد",
      data: { order }
    });
  } catch (error) {
    logger.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی وضعیت سفارش",
      error: error.message
    });
  }
};

/**
 * Get all tickets with admin privileges
 */
exports.getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const priority = req.query.priority;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const offset = (page - 1) * limit;

    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error("Error getting all tickets:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت لیست تیکت‌ها",
      error: error.message
    });
  }
};

/**
 * Get ticket by ID with admin privileges
 */
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "تیکت یافت نشد"
      });
    }

    res.json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    logger.error("Error getting ticket by ID:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اطلاعات تیکت",
      error: error.message
    });
  }
};

/**
 * Reply to ticket as admin
 */
exports.replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isInternal } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "تیکت یافت نشد"
      });
    }

    // Add admin reply
    const reply = {
      message,
      isAdmin: true,
      isInternal: isInternal || false,
      adminId: req.user.id,
      timestamp: new Date()
    };

    if (!ticket.replies) ticket.replies = [];
    ticket.replies.push(reply);

    // Update ticket status
    ticket.status = 'replied';
    ticket.lastReplyAt = new Date();

    await ticket.save();

    res.json({
      success: true,
      message: "پاسخ با موفقیت ارسال شد",
      data: { ticket }
    });
  } catch (error) {
    logger.error("Error replying to ticket:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ارسال پاسخ",
      error: error.message
    });
  }
};

/**
 * Get system analytics
 */
exports.getSystemAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User registration analytics
    const userRegistrations = await User.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        [User.sequelize.fn('DATE', User.sequelize.col('createdAt')), 'date'],
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: [User.sequelize.fn('DATE', User.sequelize.col('createdAt'))],
      order: [[User.sequelize.fn('DATE', User.sequelize.col('createdAt')), 'ASC']]
    });

    // Order analytics
    const orderAnalytics = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        [Order.sequelize.fn('DATE', Order.sequelize.col('createdAt')), 'date'],
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('amount')), 'revenue']
      ],
      group: [Order.sequelize.fn('DATE', Order.sequelize.col('createdAt'))],
      order: [[Order.sequelize.fn('DATE', Order.sequelize.col('createdAt')), 'ASC']]
    });

    // Service type distribution
    const serviceDistribution = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: Service,
          attributes: ['type'],
          group: ['Service.type']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        userRegistrations,
        orderAnalytics,
        serviceDistribution
      }
    });
  } catch (error) {
    logger.error("Error getting system analytics:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت آمار سیستم",
      error: error.message
    });
  }
};

/**
 * Send notification to users
 */
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type, targetUsers } = req.body;

    // Validate input
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "عنوان و پیام الزامی است"
      });
    }

    // Get target users
    let users = [];
    if (targetUsers === 'all') {
      users = await User.findAll({ where: { status: 'active' } });
    } else if (targetUsers === 'premium') {
      users = await User.findAll({
        where: {
          status: 'active',
          role: 'premium'
        }
      });
    } else if (Array.isArray(targetUsers)) {
      users = await User.findAll({
        where: {
          id: targetUsers,
          status: 'active'
        }
      });
    }

    // Send notifications (implement your notification service here)
    const notificationResults = await Promise.allSettled(
      users.map(user => {
        // This is a placeholder - implement your actual notification logic
        return Promise.resolve({
          userId: user.id,
          status: 'sent',
          timestamp: new Date()
        });
      })
    );

    const successCount = notificationResults.filter(result => result.status === 'fulfilled').length;
    const failureCount = notificationResults.length - successCount;

    res.json({
      success: true,
      message: `اعلان با موفقیت ارسال شد. موفق: ${successCount}, ناموفق: ${failureCount}`,
      data: {
        totalUsers: users.length,
        successCount,
        failureCount
      }
    });
  } catch (error) {
    logger.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ارسال اعلان",
      error: error.message
    });
  }
};

/**
 * Get system health status
 */
exports.getSystemHealth = async (req, res) => {
  try {
    // Check database connection
    let dbStatus = 'healthy';
    try {
      await User.sequelize.authenticate();
    } catch (error) {
      dbStatus = 'unhealthy';
    }

    // Check disk space (placeholder)
    const diskSpace = {
      total: 1000000000000, // 1TB
      used: 500000000000,   // 500GB
      free: 500000000000    // 500GB
    };

    // Check memory usage (placeholder)
    const memoryUsage = {
      total: 16000000000,   // 16GB
      used: 8000000000,     // 8GB
      free: 8000000000      // 8GB
    };

    // Check active connections (placeholder)
    const activeConnections = Math.floor(Math.random() * 100) + 50;

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date(),
        services: {
          database: dbStatus,
          api: 'healthy',
          vcenter: 'healthy'
        },
        resources: {
          diskSpace,
          memoryUsage,
          activeConnections
        }
      }
    });
  } catch (error) {
    logger.error("Error getting system health:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت وضعیت سیستم",
      error: error.message
    });
  }
}; 