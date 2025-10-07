const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth } = require("../middleware/auth");
const { validateCartItem } = require("../validations/cart.validation");
const CartController = require("../controllers/cart.controller");
const CartService = require("../services/cart.service");

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    const cart = await CartService.getCart(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
router.post(
  "/add",
  auth,
  [
    body("serviceId").isUUID().withMessage("Invalid service ID"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("options").optional().isObject().withMessage("Options must be an object")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { serviceId, quantity, options } = req.body;
      const cart = await CartService.addItem(req.user.id, serviceId, quantity, options);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update cart item quantity
router.put(
  "/update/:itemId",
  auth,
  [
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("options").optional().isObject().withMessage("Options must be an object")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { itemId } = req.params;
      const { quantity, options } = req.body;
      const cart = await CartService.updateItem(req.user.id, itemId, quantity, options);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Remove item from cart
router.delete(
  "/remove/:itemId",
  auth,
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const cart = await CartService.removeItem(req.user.id, itemId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Clear cart
router.delete("/clear", auth, async (req, res) => {
  try {
    await CartService.clearCart(req.user.id);
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply coupon
router.post(
  "/apply-coupon",
  auth,
  [
    body("couponCode").isString().notEmpty().withMessage("Coupon code is required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { couponCode } = req.body;
      const cart = await CartService.applyCoupon(req.user.id, couponCode);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Remove coupon
router.delete("/remove-coupon", auth, async (req, res) => {
  try {
    const cart = await CartService.removeCoupon(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart total
router.get("/total", auth, async (req, res) => {
  try {
    const total = await CartService.getCartTotal(req.user.id);
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
