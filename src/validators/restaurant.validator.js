// src/validators/restaurant.validator.js

const { body, param } = require('express-validator');

/**
 * Validación para crear restaurante
 */
const createRestaurantValidator = [
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('address')
    .notEmpty().withMessage('La dirección es requerida')
    .trim(),
  
  body('phone')
    .notEmpty().withMessage('El teléfono es requerido')
    .isMobilePhone('es-MX').withMessage('Número de teléfono inválido'),
  
  body('location')
    .optional()
    .isObject().withMessage('La ubicación debe ser un objeto'),
  
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  
  body('categories')
    .optional()
    .isArray().withMessage('Las categorías deben ser un array')
];

/**
 * Validación para actualizar restaurante
 */
const updateRestaurantValidator = [
  param('id')
    .isUUID().withMessage('ID de restaurante inválido'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('address')
    .optional()
    .trim(),
  
  body('phone')
    .optional()
    .isMobilePhone('es-MX').withMessage('Número de teléfono inválido'),
  
  body('subscriptionTier')
    .optional()
    .isIn(['FREE', 'BASIC', 'PREMIUM']).withMessage('Tier de suscripción inválido')
];

module.exports = {
  createRestaurantValidator,
  updateRestaurantValidator
};