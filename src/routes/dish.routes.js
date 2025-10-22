// src/routes/dish.routes.js

const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dish.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { 
  createDishValidator, 
  updateDishValidator 
} = require('../validators/dish.validator');
const validationMiddleware = require('../middlewares/validation.middleware');

// Rutas públicas
// GET /api/v1/dishes (requiere restaurantId en query)
router.get('/', dishController.list);

// GET /api/v1/dishes/category/:category
router.get('/category/:category', dishController.getByCategory);

// GET /api/v1/dishes/:id
router.get('/:id', dishController.getById);

// Rutas protegidas (requieren autenticación de restaurante)
// POST /api/v1/dishes
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  createDishValidator,
  validationMiddleware.handleValidation,
  dishController.create
);

// GET /api/v1/dishes/my/all
router.get(
  '/my/all',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  dishController.getMyDishes
);

// PUT /api/v1/dishes/:id
router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  updateDishValidator,
  validationMiddleware.handleValidation,
  dishController.update
);

// DELETE /api/v1/dishes/:id
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  dishController.delete
);

// PATCH /api/v1/dishes/:id/availability
router.patch(
  '/:id/availability',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  dishController.updateAvailability
);

module.exports = router;