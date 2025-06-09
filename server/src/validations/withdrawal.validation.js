const { body, param } = require("express-validator");

const withdrawalValidation = {
  create: [
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("bankAccount").notEmpty().withMessage("Bank account is required"),
    body("bankName").notEmpty().withMessage("Bank name is required"),
  ],
  update: [
    param("withdrawalId").isInt().withMessage("Invalid withdrawal ID"),
    body("status").isIn(["approved", "rejected"]).withMessage("Invalid status"),
    body("rejectionReason")
      .optional()
      .isString()
      .withMessage("Rejection reason must be a string"),
  ],
};

module.exports = withdrawalValidation;
