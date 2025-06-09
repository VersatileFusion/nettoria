const CartService = require("../services/cart.service");
const { handleError } = require("../utils/errorHandler");

class CartController {
  static async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await CartService.getCart(userId);
      res.json({ success: true, data: cart });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { serviceId, quantity } = req.body;
      const cart = await CartService.addToCart(userId, serviceId, quantity);
      res.json({ success: true, data: cart });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const { quantity } = req.body;
      const cart = await CartService.updateCartItem(userId, itemId, quantity);
      res.json({ success: true, data: cart });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const cart = await CartService.removeFromCart(userId, itemId);
      res.json({ success: true, data: cart });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async clearCart(req, res) {
    try {
      const userId = req.user.id;
      await CartService.clearCart(userId);
      res.json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }

  static async getCartTotal(req, res) {
    try {
      const userId = req.user.id;
      const total = await CartService.getCartTotal(userId);
      res.json({ success: true, data: { total } });
    } catch (error) {
      handleError(res, error);
    }
  }
}

module.exports = CartController;
