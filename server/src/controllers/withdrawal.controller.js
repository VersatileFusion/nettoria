const WithdrawalService = require("../services/withdrawal.service");
const { handleError } = require("../utils/errorHandler");

class WithdrawalController {
  static async getWithdrawalHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const history = await WithdrawalService.getWithdrawalHistory(
        userId,
        page,
        limit
      );
      res.json({ success: true, data: history });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async requestWithdrawal(req, res) {
    try {
      const userId = req.user.id;
      const { amount, paymentMethod, accountDetails } = req.body;
      const withdrawal = await WithdrawalService.requestWithdrawal(
        userId,
        amount,
        paymentMethod,
        accountDetails
      );
      res.json({ success: true, data: withdrawal });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getWithdrawalStatus(req, res) {
    try {
      const userId = req.user.id;
      const { withdrawalId } = req.params;
      const status = await WithdrawalService.getWithdrawalStatus(
        userId,
        withdrawalId
      );
      res.json({ success: true, data: status });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async cancelWithdrawal(req, res) {
    try {
      const userId = req.user.id;
      const { withdrawalId } = req.params;
      const result = await WithdrawalService.cancelWithdrawal(
        userId,
        withdrawalId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  }
}

module.exports = WithdrawalController;
