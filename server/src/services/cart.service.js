const Cart = require("../models/cart.model");
const Service = require("../models/service.model");
const { NotFoundError, ValidationError } = require("../utils/errors");

class CartService {
  static async getCart(userId) {
    const cart = await Cart.findOne({ userId }).populate("items.serviceId");
    if (!cart) {
      return { items: [], total: 0 };
    }
    return cart;
  }

  static async addToCart(userId, serviceId, quantity) {
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new NotFoundError("Service not found");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.serviceId.toString() === serviceId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ serviceId, quantity });
    }

    await cart.save();
    return this.getCart(userId);
  }

  static async updateCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new NotFoundError("Item not found in cart");
    }

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    return this.getCart(userId);
  }

  static async removeFromCart(userId, itemId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    cart.items.pull(itemId);
    await cart.save();
    return this.getCart(userId);
  }

  static async clearCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
  }

  static async getCartTotal(userId) {
    const cart = await this.getCart(userId);
    return cart.items.reduce((total, item) => {
      return total + item.serviceId.price * item.quantity;
    }, 0);
  }
}

module.exports = CartService;
