const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const OneTimeLoginService = require('../services/one-time-login.service');

// Generate one-time login token
router.post('/generate',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const result = await OneTimeLoginService.generateToken(email);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Validate one-time login token
router.post('/validate',
  [
    body('token').isString().notEmpty().withMessage('Token is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.body;
      const result = await OneTimeLoginService.validateToken(token);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Check token status
router.get('/status/:token',
  async (req, res) => {
    try {
      const { token } = req.params;
      const status = await OneTimeLoginService.checkTokenStatus(token);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
