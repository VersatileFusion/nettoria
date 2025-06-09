const { validatePassword } = require("../utils/validators");

/**
 * Middleware to validate success password format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateSuccessPassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      error: "Password is required",
    });
  }

  const validationError = validatePassword(password);
  if (validationError) {
    return res.status(400).json({
      error: validationError,
    });
  }

  next();
};

/**
 * Middleware to validate success password reset code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateResetCode = (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      error: "Reset code is required",
    });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({
      error: "Invalid reset code format",
    });
  }

  next();
};

module.exports = {
  validateSuccessPassword,
  validateResetCode,
}; 