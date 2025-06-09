const paymentService = require("../services/payment.service");
const { Order, User } = require("../models");
const logger = require("../utils/logger");

/**
 * Handle payment request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Get order details
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if order is already paid
    if (order.paymentStatus === "COMPLETED") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already paid" });
    }

    // Get user details for payment
    const user = await User.findByPk(userId);

    // Create payment request
    const paymentResult = await paymentService.createPaymentRequest({
      amount: order.totalAmount,
      description: `Payment for order #${order.id}`,
      email: user.email || "",
      mobile: user.phone || "",
      orderId: order.id,
      userId: user.id,
    });

    if (!paymentResult.success) {
      return res
        .status(400)
        .json({ success: false, message: paymentResult.error });
    }

    res.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      authority: paymentResult.authority,
    });
  } catch (error) {
    logger.error("Error creating payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create payment" });
  }
};

/**
 * Verify payment callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { Authority, Status } = req.query;
    const { orderId, userId } = req.query;

    // Get order details
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Verify payment
    const verifyResult = await paymentService.verifyPayment({
      authority: Authority,
      status: Status,
      amount: order.totalAmount,
      orderId: order.id,
    });

    if (verifyResult.success) {
      // Return success JSON response instead of redirecting
      return res.json({
        success: true,
        refId: verifyResult.refId,
        orderId: orderId,
        message: "Payment was successful",
      });
    } else {
      // Return failure JSON response instead of redirecting
      return res.status(400).json({
        success: false,
        orderId: orderId,
        message: verifyResult.error,
      });
    }
  } catch (error) {
    logger.error("Error verifying payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify payment" });
  }
};
