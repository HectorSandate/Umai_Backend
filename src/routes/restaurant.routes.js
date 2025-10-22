// src/routes/restaurant.routes.js

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { 
  createRestaurantValidator, 
  updateRestaurantValidator 
} = require('../validators/restaurant.validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Rutas públicas
// GET /api/v1/restaurants
router.get('/', restaurantController.list);

// GET /api/v1/restaurants/nearby
router.get('/nearby', restaurantController.findNearby);

// GET /api/v1/restaurants/:id
router.get('/:id', restaurantController.getById);

// Rutas protegidas (requieren autenticación de restaurante)
// GET /api/v1/restaurants/my/profile
router.get(
  '/my/profile',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  restaurantController.getMyRestaurant
);

// PUT /api/v1/restaurants/my/profile
router.put(
  '/my/profile',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  updateRestaurantValidator,
  validationMiddleware.handleValidation,
  restaurantController.update
);

// GET /api/v1/restaurants/my/stats
router.get(
  '/my/stats',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  restaurantController.getStats
);

// PUT /api/v1/restaurants/my/subscription
router.put(
  '/my/subscription',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  restaurantController.updateSubscription
);

module.exports = router;