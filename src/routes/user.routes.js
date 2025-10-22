// src/routes/user.routes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// GET /api/v1/users/profile
router.get('/profile', userController.getProfile);

// PUT /api/v1/users/profile
router.put('/profile', userController.updateProfile);

// PUT /api/v1/users/preferences
router.put('/preferences', userController.updatePreferences);

// GET /api/v1/users/history
router.get('/history', userController.getViewHistory);

// GET /api/v1/users/likes
router.get('/likes', userController.getLikedVideos);

// GET /api/v1/users/favorites
router.get('/favorites', userController.getFavorites);

// DELETE /api/v1/users/account
router.delete('/account', userController.deleteAccount);

module.exports = router;