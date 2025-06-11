const { Cart, CartItem, Service, Coupon } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError } = require("../utils/errors");

class CartService {
  static async getCart(userId) {
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [Service]
        }
      ]
    });

    if (!cart) {
      return await Cart.create({ userId });
    }

    return cart;
  }

  static async addItem(userId, serviceId, quantity, options = {}) {
    const cart = await this.getCart(userId);
    const service = await Service.findByPk(serviceId);

    if (!service) {
      throw new Error('Service not found');
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        serviceId
      }
    });

    if (cartItem) {
      // Update existing item
      cartItem.quantity += quantity;
      cartItem.options = { ...cartItem.options, ...options };
      await cartItem.save();
    } else {
      // Create new item
      cartItem = await CartItem.create({
        cartId: cart.id,
        serviceId,
        quantity,
        options
      });
    }

    return this.getCart(userId);
  }

  static async updateItem(userId, itemId, quantity, options = {}) {
    const cart = await this.getCart(userId);
    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cart.id
      }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    cartItem.quantity = quantity;
    cartItem.options = { ...cartItem.options, ...options };
    await cartItem.save();

    return this.getCart(userId);
  }

  static async removeItem(userId, itemId) {
    const cart = await this.getCart(userId);
    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cart.id
      }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    await cartItem.destroy();
    return this.getCart(userId);
  }

  static async clearCart(userId) {
    const cart = await this.getCart(userId);
    await CartItem.destroy({
      where: { cartId: cart.id }
    });
    await cart.update({ couponId: null });
  }

  static async applyCoupon(userId, couponCode) {
    const cart = await this.getCart(userId);
    const coupon = await Coupon.findOne({
      where: {
        code: couponCode,
        [Op.or]: [
          { expiresAt: { [Op.gt]: new Date() } },
          { expiresAt: null }
        ],
        isActive: true
      }
    });

    if (!coupon) {
      throw new Error('Invalid or expired coupon');
    }

    // Check if coupon is already applied
    if (cart.couponId === coupon.id) {
      throw new Error('Coupon already applied');
    }

    // Validate coupon against cart items
    const isValid = await this.validateCoupon(coupon, cart);
    if (!isValid) {
      throw new Error('Coupon cannot be applied to current cart items');
    }

    await cart.update({ couponId: coupon.id });
    return this.getCart(userId);
  }

  static async removeCoupon(userId) {
    const cart = await this.getCart(userId);
    await cart.update({ couponId: null });
    return this.getCart(userId);
  }

  static async getCartTotal(userId) {
    const cart = await this.getCart(userId);
    let total = 0;

    for (const item of cart.CartItems) {
      const service = item.Service;
      const itemTotal = service.price * item.quantity;
      total += itemTotal;
    }

    // Apply coupon discount if exists
    if (cart.couponId) {
      const coupon = await Coupon.findByPk(cart.couponId);
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          total = total * (1 - coupon.discountValue / 100);
        } else {
          total = Math.max(0, total - coupon.discountValue);
        }
      }
    }

    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  static async validateCoupon(coupon, cart) {
    // Check minimum purchase amount
    if (coupon.minimumPurchase) {
      const total = await this.getCartTotal(cart.userId);
      if (total < coupon.minimumPurchase) {
        return false;
      }
    }

    // Check if coupon is applicable to any cart items
    if (coupon.applicableServices && coupon.applicableServices.length > 0) {
      const hasApplicableService = cart.CartItems.some(item =>
        coupon.applicableServices.includes(item.serviceId)
      );
      if (!hasApplicableService) {
        return false;
      }
    }

    return true;
  }
}

module.exports = CartService;
