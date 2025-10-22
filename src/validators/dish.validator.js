// src/validators/dish.validator.js

const { body, param } = require('express-validator');

const createDishValidator = [
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('price')
    .notEmpty().withMessage('El precio es requerido')
    .isFloat({ min: 0 }).withMessage('El precio debe ser positivo'),
  
  body('category')
    .notEmpty().withMessage('La categoría es requerida')
    .isIn(['tacos', 'pizza', 'sushi', 'hamburguesas', 'ensaladas', 'postres', 'bebidas', 'otro'])
    .withMessage('Categoría inválida'),
  
  // Enlaces a plataformas de delivery
  body('uberEatsLink')
    .optional()
    .isURL().withMessage('El enlace de Uber Eats debe ser una URL válida'),
  
  body('didiLink')
    .optional()
    .isURL().withMessage('El enlace de DiDi Food debe ser una URL válida'),
  
  body('rappiLink')
    .optional()
    .isURL().withMessage('El enlace de Rappi debe ser una URL válida')
];

const updateDishValidator = [
  param('id')
    .isUUID().withMessage('ID de platillo inválido'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio debe ser positivo'),
  
  body('category')
    .optional()
    .isIn(['tacos', 'pizza', 'sushi', 'hamburguesas', 'ensaladas', 'postres', 'bebidas', 'otro'])
    .withMessage('Categoría inválida'),
  
  body('uberEatsLink')
    .optional()
    .isURL().withMessage('El enlace de Uber Eats debe ser una URL válida'),
  
  body('didiLink')
    .optional()
    .isURL().withMessage('El enlace de DiDi Food debe ser una URL válida'),
  
  body('rappiLink')
    .optional()
    .isURL().withMessage('El enlace de Rappi debe ser una URL válida')
];

module.exports = {
  createDishValidator,
  updateDishValidator
};