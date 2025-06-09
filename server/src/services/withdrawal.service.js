const Withdrawal = require("../models/withdrawal.model");
const User = require("../models/user.model");
const { NotFoundError, ValidationError } = require("../utils/errors");

class WithdrawalService {
  static async getWithdrawalHistory(userId, page, limit) {
    const skip = (page - 1) * limit;
    const withdrawals = await Withdrawal.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Withdrawal.countDocuments({ userId });

    return {
      withdrawals,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async requestWithdrawal(
    userId,
    amount,
    paymentMethod,
    accountDetails
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.balance < amount) {
      throw new ValidationError("Insufficient balance");
    }

    const withdrawal = new Withdrawal({
      userId,
      amount,
      paymentMethod,
      accountDetails,
      status: "pending",
    });

    // Deduct amount from user's balance
    user.balance -= amount;
    await user.save();
    await withdrawal.save();

    return withdrawal;
  }

  static async getWithdrawalStatus(userId, withdrawalId) {
    const withdrawal = await Withdrawal.findOne({ _id: withdrawalId, userId });
    if (!withdrawal) {
      throw new NotFoundError("Withdrawal request not found");
    }

    return withdrawal;
  }

  static async cancelWithdrawal(userId, withdrawalId) {
    const withdrawal = await Withdrawal.findOne({ _id: withdrawalId, userId });
    if (!withdrawal) {
      throw new NotFoundError("Withdrawal request not found");
    }

    if (withdrawal.status !== "pending") {
      throw new ValidationError("Cannot cancel non-pending withdrawal");
    }

    // Refund amount to user's balance
    const user = await User.findById(userId);
    user.balance += withdrawal.amount;
    await user.save();

    withdrawal.status = "cancelled";
    await withdrawal.save();

    return withdrawal;
  }
}

module.exports = WithdrawalService;
