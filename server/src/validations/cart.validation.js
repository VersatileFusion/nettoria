const { body, param } = require("express-validator");

const cartValidation = {
  addItem: [
    body("serviceId").isInt().withMessage("Invalid service ID"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  removeItem: [param("itemId").isInt().withMessage("Invalid cart item ID")],
  updateQuantity: [
    param("itemId").isInt().withMessage("Invalid cart item ID"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
};

module.exports = cartValidation;
