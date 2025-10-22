// src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validationMiddleware = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

// POST /api/v1/auth/register
router.post(
  '/register',
  authLimiter,
  registerValidator,
  validationMiddleware.handleValidation,
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authLimiter,
  loginValidator,
  validationMiddleware.handleValidation,
  authController.login
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  authMiddleware.verifyToken,
  authController.logout
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  authController.refreshToken
);

// GET /api/v1/auth/me
router.get(
  '/me',
  authMiddleware.verifyToken,
  authController.getCurrentUser
);

// PUT /api/v1/auth/change-password
router.put(
  '/change-password',
  authMiddleware.verifyToken,
  authController.changePassword
);

module.exports = router;