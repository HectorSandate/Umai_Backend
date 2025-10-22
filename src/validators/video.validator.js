// src/validators/video.validator.js

const { body, param, query } = require('express-validator');

const createVideoValidator = [
  body('dishId')
    .notEmpty()
    .withMessage('El ID del platillo es requerido')
    .isUUID()
    .withMessage('El ID del platillo debe ser un UUID válido'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('category')
    .optional()
    .isIn(['TACOS', 'PIZZA', 'SUSHI', 'HAMBURGUESAS', 'ENSALADAS', 'POSTRES', 'BEBIDAS', 'OTRO'])
    .withMessage('Categoría inválida'),
  
  body('tags')
    .optional()
    .custom((value) => {
      // Si viene como string, intentar parsearlo
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Los tags deben ser un array válido')
];

const updateVideoValidator = [
  param('id')
    .isUUID()
    .withMessage('ID de video inválido'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un booleano')
];

const getVideoByIdValidator = [
  param('id')
    .isUUID()
    .withMessage('ID de video inválido')
];

const listVideosValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  query('category')
    .optional()
    .isIn(['TACOS', 'PIZZA', 'SUSHI', 'HAMBURGUESAS', 'ENSALADAS', 'POSTRES', 'BEBIDAS', 'OTRO'])
    .withMessage('Categoría inválida')
];

const registerOrderClickValidator = [
  param('id')
    .isUUID()
    .withMessage('ID de video inválido'),
  
  body('platform')
    .notEmpty()
    .withMessage('La plataforma es requerida')
    .isIn(['uber', 'didi', 'rappi'])
    .withMessage('Plataforma inválida')
];

module.exports = {
  createVideoValidator,
  updateVideoValidator,
  getVideoByIdValidator,
  listVideosValidator,
  registerOrderClickValidator
};