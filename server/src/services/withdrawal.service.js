const { Withdrawal, PaymentMethod, User, Wallet } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');
const NotificationUtil = require('../utils/notification.util');

class WithdrawalService {
  static async getHistory(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows: withdrawals } = await Withdrawal.findAndCountAll({
      where: { userId },
      include: [PaymentMethod],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      withdrawals,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async requestWithdrawal(userId, amount, paymentMethodId, accountDetails) {
    // Get user's wallet
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Get payment method
    const paymentMethod = await PaymentMethod.findOne({
      where: {
        id: paymentMethodId,
        userId
      }
    });
    if (!paymentMethod) {
      throw new Error('Invalid payment method');
    }

    // Check withdrawal limits
    const limits = await this.getWithdrawalLimits(userId);
    if (amount < limits.minAmount || amount > limits.maxAmount) {
      throw new Error(`Amount must be between ${limits.minAmount} and ${limits.maxAmount}`);
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      paymentMethodId,
      accountDetails,
      status: 'pending',
      fee: this.calculateFee(amount, paymentMethod.type)
    });

    // Deduct amount from wallet
    await wallet.update({
      balance: wallet.balance - amount,
      pendingWithdrawals: wallet.pendingWithdrawals + amount
    });

    // Notify admin
    await this.notifyAdmin(withdrawal);

    return withdrawal;
  }

  static async getStatus(userId, withdrawalId) {
    const withdrawal = await Withdrawal.findOne({
      where: {
        id: withdrawalId,
        userId
      },
      include: [PaymentMethod]
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    return withdrawal;
  }

  static async cancelWithdrawal(userId, withdrawalId) {
    const withdrawal = await Withdrawal.findOne({
      where: {
        id: withdrawalId,
        userId,
        status: 'pending'
      }
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found or cannot be cancelled');
    }

    // Update withdrawal status
    await withdrawal.update({ status: 'cancelled' });

    // Return amount to wallet
    const wallet = await Wallet.findOne({ where: { userId } });
    await wallet.update({
      balance: wallet.balance + withdrawal.amount,
      pendingWithdrawals: wallet.pendingWithdrawals - withdrawal.amount
    });

    // Notify user
    await this.notifyUser(withdrawal, 'cancelled');

    return withdrawal;
  }

  static async getPaymentMethods(userId) {
    return await PaymentMethod.findAll({
      where: { userId },
      attributes: { exclude: ['details'] } // Exclude sensitive details
    });
  }

  static async addPaymentMethod(userId, type, details) {
    // Validate payment method details based on type
    this.validatePaymentMethodDetails(type, details);

    return await PaymentMethod.create({
      userId,
      type,
      details,
      isActive: true
    });
  }

  static async removePaymentMethod(userId, methodId) {
    const method = await PaymentMethod.findOne({
      where: {
        id: methodId,
        userId
      }
    });

    if (!method) {
      throw new Error('Payment method not found');
    }

    // Check if method is being used in pending withdrawals
    const pendingWithdrawals = await Withdrawal.count({
      where: {
        paymentMethodId: methodId,
        status: 'pending'
      }
    });

    if (pendingWithdrawals > 0) {
      throw new Error('Cannot remove payment method with pending withdrawals');
    }

    await method.destroy();
  }

  static async getWithdrawalLimits(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's verification level
    const verificationLevel = user.verificationLevel || 'basic';

    // Define limits based on verification level
    const limits = {
      basic: {
        minAmount: 10,
        maxAmount: 1000,
        dailyLimit: 2000,
        monthlyLimit: 5000
      },
      verified: {
        minAmount: 10,
        maxAmount: 5000,
        dailyLimit: 10000,
        monthlyLimit: 25000
      },
      premium: {
        minAmount: 10,
        maxAmount: 10000,
        dailyLimit: 20000,
        monthlyLimit: 50000
      }
    };

    return limits[verificationLevel];
  }

  static calculateFee(amount, paymentMethodType) {
    const feeRates = {
      bank: 0.02, // 2%
      crypto: 0.01, // 1%
      paypal: 0.03 // 3%
    };

    return amount * (feeRates[paymentMethodType] || 0.02);
  }

  static validatePaymentMethodDetails(type, details) {
    const validators = {
      bank: (details) => {
        if (!details.accountNumber || !details.bankName || !details.accountHolder) {
          throw new Error('Invalid bank account details');
        }
      },
      crypto: (details) => {
        if (!details.walletAddress || !details.network) {
          throw new Error('Invalid crypto wallet details');
        }
      },
      paypal: (details) => {
        if (!details.email) {
          throw new Error('Invalid PayPal email');
        }
      }
    };

    if (!validators[type]) {
      throw new Error('Invalid payment method type');
    }

    validators[type](details);
  }

  static async notifyAdmin(withdrawal) {
    // Create admin notification
    await NotificationUtil.sendNotification({
      type: 'withdrawal_request',
      title: 'New Withdrawal Request',
      message: `New withdrawal request for ${withdrawal.amount}`,
      data: { withdrawalId: withdrawal.id }
    });

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Withdrawal Request',
      html: `
        <h1>New Withdrawal Request</h1>
        <p>Amount: ${withdrawal.amount}</p>
        <p>User ID: ${withdrawal.userId}</p>
        <p>Payment Method: ${withdrawal.PaymentMethod.type}</p>
      `
    });
  }

  static async notifyUser(withdrawal, status) {
    const user = await User.findByPk(withdrawal.userId);
    if (!user) return;

    // Create user notification
    await NotificationUtil.sendNotification({
      userId: user.id,
      type: 'withdrawal_status',
      title: 'Withdrawal Status Update',
      message: `Your withdrawal request has been ${status}`,
      data: { withdrawalId: withdrawal.id }
    });

    // Send email to user
    await sendEmail({
      to: user.email,
      subject: 'Withdrawal Status Update',
      html: `
        <h1>Withdrawal Status Update</h1>
        <p>Your withdrawal request for ${withdrawal.amount} has been ${status}</p>
        <p>Payment Method: ${withdrawal.PaymentMethod.type}</p>
      `
    });
  }
}

module.exports = WithdrawalService;
