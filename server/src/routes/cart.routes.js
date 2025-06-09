const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { validateCartItem } = require("../validations/cart.validation");
const CartController = require("../controllers/cart.controller");

// Get user's cart
router.get("/", authenticateToken, CartController.getCart);

// Add item to cart
router.post(
  "/add",
  authenticateToken,
  validateCartItem,
  CartController.addToCart
);

// Update cart item quantity
router.put(
  "/update/:itemId",
  authenticateToken,
  validateCartItem,
  CartController.updateCartItem
);

// Remove item from cart
router.delete(
  "/remove/:itemId",
  authenticateToken,
  CartController.removeFromCart
);

// Clear cart
router.delete("/clear", authenticateToken, CartController.clearCart);

// Get cart total
router.get("/total", authenticateToken, CartController.getCartTotal);

module.exports = router;
