const { body, param } = require("express-validator");
const { validateRequest } = require("../middleware/validation");

const validateOneTimeLogin = [
  body("token")
    .isString()
    .isLength({ min: 64, max: 64 })
    .withMessage("Invalid token format"),
  validateRequest,
];

const validateOneTimeLoginToken = [
  param("token")
    .isString()
    .isLength({ min: 64, max: 64 })
    .withMessage("Invalid token format"),
  validateRequest,
];

module.exports = {
  validateOneTimeLogin,
  validateOneTimeLoginToken,
};
