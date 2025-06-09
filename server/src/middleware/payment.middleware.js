const { ApiError } = require('./error.middleware');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Payment gateway configuration
const paymentConfig = {
    zarinpal: {
        merchantId: process.env.ZARINPAL_MERCHANT_ID,
        callbackUrl: `${process.env.API_URL}/api/payments/verify`,
        sandbox: process.env.NODE_ENV !== 'production'
    }
};

// Payment middleware
const paymentMiddleware = {
    // Initialize payment
    initializePayment: async (req, res, next) => {
        try {
            const { orderId, method } = req.body;

            if (!orderId || !method) {
                throw new ApiError('اطلاعات پرداخت ناقص است', 400);
            }

            // Get order details
            const order = await req.app.locals.db.Order.findById(orderId);
            if (!order) {
                throw new ApiError('سفارش یافت نشد', 404);
            }

            // Check if order is already paid
            if (order.status === 'paid') {
                throw new ApiError('این سفارش قبلا پرداخت شده است', 400);
            }

            // Generate payment token
            const paymentToken = crypto.randomBytes(32).toString('hex');

            // Create payment record
            const payment = await req.app.locals.db.Payment.create({
                orderId,
                amount: order.total,
                method,
                token: paymentToken,
                status: 'pending'
            });

            // Store payment info in request
            req.payment = payment;
            req.order = order;

            next();
        } catch (error) {
            next(error);
        }
    },

    // Verify payment
    verifyPayment: async (req, res, next) => {
        try {
            const { token, status, authority } = req.query;

            if (!token || !status || !authority) {
                throw new ApiError('اطلاعات تایید پرداخت ناقص است', 400);
            }

            // Get payment record
            const payment = await req.app.locals.db.Payment.findOne({ token });
            if (!payment) {
                throw new ApiError('پرداخت یافت نشد', 404);
            }

            // Check payment status
            if (payment.status !== 'pending') {
                throw new ApiError('این پرداخت قبلا تایید شده است', 400);
            }

            // Store payment info in request
            req.payment = payment;
            req.paymentVerification = { status, authority };

            next();
        } catch (error) {
            next(error);
        }
    },

    // Process payment
    processPayment: async (req, res, next) => {
        try {
            const { payment, order, paymentVerification } = req;

            // Verify payment with gateway
            const verificationResult = await verifyWithGateway(
                payment.method,
                payment.amount,
                paymentVerification
            );

            if (!verificationResult.success) {
                // Update payment status
                payment.status = 'failed';
                payment.gatewayResponse = verificationResult;
                await payment.save();

                throw new ApiError('پرداخت ناموفق بود', 400);
            }

            // Update payment status
            payment.status = 'completed';
            payment.gatewayResponse = verificationResult;
            payment.completedAt = new Date();
            await payment.save();

            // Update order status
            order.status = 'paid';
            order.paymentId = payment._id;
            await order.save();

            // Store verification result in request
            req.verificationResult = verificationResult;

            next();
        } catch (error) {
            next(error);
        }
    }
};

// Verify payment with gateway
const verifyWithGateway = async (method, amount, verification) => {
    try {
        switch (method) {
            case 'zarinpal':
                return await verifyZarinpalPayment(amount, verification);
            case 'wallet':
                return await verifyWalletPayment(amount, verification);
            case 'bank':
                return await verifyBankPayment(amount, verification);
            default:
                throw new ApiError('روش پرداخت نامعتبر است', 400);
        }
    } catch (error) {
        logger.error('Payment verification failed:', error);
        throw new ApiError('خطا در تایید پرداخت', 500);
    }
};

// Verify Zarinpal payment
const verifyZarinpalPayment = async (amount, verification) => {
    // Implement Zarinpal payment verification
    // This is a placeholder for the actual implementation
    return {
        success: true,
        refId: '123456789',
        message: 'پرداخت با موفقیت انجام شد'
    };
};

// Verify wallet payment
const verifyWalletPayment = async (amount, verification) => {
    // Implement wallet payment verification
    // This is a placeholder for the actual implementation
    return {
        success: true,
        refId: '987654321',
        message: 'پرداخت با موفقیت انجام شد'
    };
};

// Verify bank payment
const verifyBankPayment = async (amount, verification) => {
    // Implement bank payment verification
    // This is a placeholder for the actual implementation
    return {
        success: true,
        refId: '456789123',
        message: 'پرداخت با موفقیت انجام شد'
    };
};

module.exports = {
    paymentMiddleware,
    paymentConfig
}; 