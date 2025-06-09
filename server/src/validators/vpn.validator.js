const { body } = require("express-validator");

const vpnValidators = {
  create: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 32 })
      .withMessage("Username must be between 3 and 32 characters")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage("Username can only contain letters, numbers, underscores, and hyphens"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    body("plan")
      .optional()
      .isIn(["basic", "premium", "enterprise"])
      .withMessage("Invalid subscription plan"),
  ],

  update: [
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    body("plan")
      .optional()
      .isIn(["basic", "premium", "enterprise"])
      .withMessage("Invalid subscription plan"),
    body("autoRenew")
      .optional()
      .isBoolean()
      .withMessage("Auto-renew must be a boolean value"),
  ],

  connect: [
    body("serverId")
      .trim()
      .notEmpty()
      .withMessage("Server ID is required")
      .matches(/^[a-zA-Z0-9-]+$/)
      .withMessage("Invalid server ID format"),
  ],

  updateUsage: [
    body("upload")
      .isFloat({ min: 0 })
      .withMessage("Upload value must be a non-negative number"),
    body("download")
      .isFloat({ min: 0 })
      .withMessage("Download value must be a non-negative number"),
  ],
};

module.exports = vpnValidators; 