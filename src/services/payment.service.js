const ZarinpalCheckout = require('zarinpal-checkout');
const config = require('../config');
const logger = require('../utils/logger');
const { Order } = require('../models');

// Initialize Zarinpal
const zarinpal = ZarinpalCheckout.create(
  config.ZARINPAL_MERCHANT_ID,
  config.IS_PRODUCTION === 'true'
);

class PaymentService {
  /**
   * Create a payment request
   * @param {Object} data - Payment data
   * @param {number} data.amount - Payment amount in Tomans
   * @param {string} data.description - Payment description
   * @param {string} data.email - Customer email
   * @param {string} data.mobile - Customer mobile number
   * @param {string} data.orderId - Order ID
   * @param {string} data.userId - User ID
   * @returns {Promise<Object>} Payment request result
   */
  async createPaymentRequest(data) {
    try {
      const { amount, description, email, mobile, orderId, userId } = data;
      
      // Convert to Rials (ZarinPal works with Rials)
      const amountInRials = amount * 10;
      
      const callbackUrl = `${config.BASE_URL}/api/payments/verify?orderId=${orderId}&userId=${userId}`;
      
      const response = await zarinpal.PaymentRequest({
        Amount: amountInRials,
        CallbackURL: callbackUrl,
        Description: description,
        Email: email,
        Mobile: mobile,
      });
      
      if (response.status === 100) {
        // Update order with payment info
        await Order.update(
          { 
            paymentStatus: 'PENDING',
            paymentAuthority: response.authority
          },
          { where: { id: orderId } }
        );
        
        return {
          success: true,
          paymentUrl: `${config.IS_PRODUCTION === 'true' ? 'https://www.zarinpal.com/pg/StartPay/' : 'https://sandbox.zarinpal.com/pg/StartPay/'}${response.authority}`,
          authority: response.authority
        };
      }
      
      logger.error(`ZarinPal payment request failed with status: ${response.status}`);
      return {
        success: false,
        error: `Payment request failed with status: ${response.status}`
      };
    } catch (error) {
      logger.error('Error creating payment request:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment request'
      };
    }
  }

  /**
   * Verify a payment
   * @param {Object} data - Verification data
   * @param {string} data.authority - Payment authority
   * @param {string} data.status - Payment status
   * @param {number} data.amount - Payment amount in Tomans
   * @param {string} data.orderId - Order ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(data) {
    try {
      const { authority, status, amount, orderId } = data;
      
      if (status !== 'OK') {
        await Order.update(
          { paymentStatus: 'FAILED' },
          { where: { id: orderId } }
        );
        
        return {
          success: false,
          error: 'Payment was canceled by user'
        };
      }
      
      // Convert to Rials
      const amountInRials = amount * 10;
      
      const response = await zarinpal.PaymentVerification({
        Amount: amountInRials,
        Authority: authority,
      });
      
      if (response.status === 100 || response.status === 101) {
        // Update order status
        await Order.update(
          { 
            paymentStatus: 'COMPLETED',
            paymentRefId: response.RefID
          },
          { where: { id: orderId } }
        );
        
        return {
          success: true,
          refId: response.RefID,
          message: 'Payment was successful'
        };
      }
      
      // Payment failed
      await Order.update(
        { paymentStatus: 'FAILED' },
        { where: { id: orderId } }
      );
      
      logger.error(`ZarinPal payment verification failed with status: ${response.status}`);
      return {
        success: false,
        error: `Payment verification failed with status: ${response.status}`
      };
    } catch (error) {
      logger.error('Error verifying payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify payment'
      };
    }
  }
}

module.exports = new PaymentService(); 