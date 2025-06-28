const Order = require("../models/order.model");
const User = require("../models/user.model");
const Service = require("../models/service.model");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

/**
 * Create a new order
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      serviceId,
      quantity = 1,
      billingCycle = 'monthly',
      customConfig = {},
      notes
    } = req.body;

    const userId = req.user.id;

    // Validate service exists
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "سرویس یافت نشد"
      });
    }

    // Calculate total amount
    const basePrice = service.price;
    const cycleMultiplier = {
      'hourly': 1 / 24,
      'daily': 1,
      'weekly': 7,
      'monthly': 30,
      'quarterly': 90,
      'yearly': 365
    };

    const totalAmount = basePrice * quantity * cycleMultiplier[billingCycle];

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      userId,
      serviceId,
      quantity,
      billingCycle,
      totalAmount,
      customConfig,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: "سفارش با موفقیت ایجاد شد",
      data: { order }
    });
  } catch (error) {
    logger.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ایجاد سفارش",
      error: error.message
    });
  }
};

/**
 * Get user orders
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const whereClause = { userId };
    if (status) whereClause.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Service, attributes: ['id', 'name', 'type', 'description'] }
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
    logger.error("Error getting user orders:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت سفارشات",
      error: error.message
    });
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findByPk(id, {
      include: [
        { model: Service, attributes: ['id', 'name', 'type', 'description', 'price'] },
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "سفارش یافت نشد"
      });
    }

    // Check if user owns this order or is admin
    if (order.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "شما دسترسی به این سفارش را ندارید"
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
 * Update order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "سفارش یافت نشد"
      });
    }

    // Check if user owns this order or is admin
    if (order.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "شما دسترسی به این سفارش را ندارید"
      });
    }

    // Update order
    order.status = status;
    if (notes) order.notes = notes;
    order.updatedAt = new Date();

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
 * Cancel order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "سفارش یافت نشد"
      });
    }

    // Check if user owns this order or is admin
    if (order.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "شما دسترسی به این سفارش را ندارید"
      });
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled' || order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "این سفارش قابل لغو نیست"
      });
    }

    // Cancel order
    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    order.updatedAt = new Date();

    await order.save();

    res.json({
      success: true,
      message: "سفارش با موفقیت لغو شد",
      data: { order }
    });
  } catch (error) {
    logger.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "خطا در لغو سفارش",
      error: error.message
    });
  }
};

/**
 * Pay for order
 */
exports.payOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentDetails } = req.body;
    const userId = req.user.id;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "سفارش یافت نشد"
      });
    }

    // Check if user owns this order
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "شما دسترسی به این سفارش را ندارید"
      });
    }

    // Check if order is pending payment
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "این سفارش در انتظار پرداخت نیست"
      });
    }

    // Process payment (implement your payment gateway integration here)
    // For now, we'll simulate a successful payment
    const paymentResult = {
      success: true,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: order.totalAmount,
      method: paymentMethod
    };

    if (paymentResult.success) {
      // Update order payment status
      order.paymentStatus = 'paid';
      order.paymentMethod = paymentMethod;
      order.paymentDetails = paymentDetails;
      order.paidAt = new Date();
      order.status = 'processing';
      order.updatedAt = new Date();

      await order.save();

      res.json({
        success: true,
        message: "پرداخت با موفقیت انجام شد",
        data: {
          order,
          payment: paymentResult
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "خطا در پرداخت",
        error: "Payment processing failed"
      });
    }
  } catch (error) {
    logger.error("Error paying for order:", error);
    res.status(500).json({
      success: false,
      message: "خطا در پرداخت سفارش",
      error: error.message
    });
  }
};

/**
 * Apply discount code to order
 */
exports.applyDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountCode } = req.body;
    const userId = req.user.id;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "سفارش یافت نشد"
      });
    }

    // Check if user owns this order
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "شما دسترسی به این سفارش را ندارید"
      });
    }

    // Check if order is pending payment
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "کد تخفیف فقط برای سفارشات در انتظار پرداخت قابل استفاده است"
      });
    }

    // Validate discount code (implement your discount logic here)
    const discount = {
      code: discountCode,
      percentage: 10, // 10% discount
      valid: true
    };

    if (!discount.valid) {
      return res.status(400).json({
        success: false,
        message: "کد تخفیف نامعتبر است"
      });
    }

    // Apply discount
    const discountAmount = (order.totalAmount * discount.percentage) / 100;
    const finalAmount = order.totalAmount - discountAmount;

    order.discountCode = discountCode;
    order.discountAmount = discountAmount;
    order.finalAmount = finalAmount;
    order.updatedAt = new Date();

    await order.save();

    res.json({
      success: true,
      message: "کد تخفیف با موفقیت اعمال شد",
      data: {
        order,
        discount: {
          code: discountCode,
          percentage: discount.percentage,
          amount: discountAmount,
          finalAmount
        }
      }
    });
  } catch (error) {
    logger.error("Error applying discount:", error);
    res.status(500).json({
      success: false,
      message: "خطا در اعمال کد تخفیف",
      error: error.message
    });
  }
};

/**
 * Get order statistics
 */
exports.getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Order.findAll({
      where: { userId },
      attributes: [
        'status',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('totalAmount')), 'totalAmount']
      ],
      group: ['status']
    });

    const totalOrders = await Order.count({ where: { userId } });
    const totalSpent = await Order.sum('totalAmount', {
      where: {
        userId,
        paymentStatus: 'paid'
      }
    });

    res.json({
      success: true,
      data: {
        stats,
        summary: {
          totalOrders,
          totalSpent: totalSpent || 0
        }
      }
    });
  } catch (error) {
    logger.error("Error getting order stats:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت آمار سفارشات",
      error: error.message
    });
  }
}; 