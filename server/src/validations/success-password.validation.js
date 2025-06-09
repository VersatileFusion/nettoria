const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validation");

const validateSuccessPassword = [
  body("password")
    .isString()
    .isLength({ min: 6, max: 20 })
    .withMessage("Password must be between 6 and 20 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  validateRequest,
];

module.exports = {
  validateSuccessPassword,
};
