const express = require("express");
const router = express.Router();
const {
  validateOneTimeLogin,
} = require("../validations/one-time-login.validation");
const OneTimeLoginController = require("../controllers/one-time-login.controller");

// Generate one-time login link
router.post("/generate", OneTimeLoginController.generateOneTimeLogin);

// Validate and use one-time login
router.post(
  "/validate",
  validateOneTimeLogin,
  OneTimeLoginController.validateOneTimeLogin
);

// Check one-time login status
router.get("/status/:token", OneTimeLoginController.checkOneTimeLoginStatus);

module.exports = router;
