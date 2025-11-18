// src/validators/auth.validator.js

const { body } = require('express-validator');

/**
 * Validación para registro de usuario
 */
const registerValidator = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('role')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['CUSTOMER', 'RESTAURANT', 'DELIVERY']).withMessage('Rol inválido'),
  
  body('phone')
    .optional()
    .isMobilePhone('es-MX').withMessage('Número de teléfono inválido'),
  
  // ========== VALIDACIONES PARA RESTAURANTES ==========
  // Solo se aplican si role = 'RESTAURANT'
  
  body('restaurantData')
    .if(body('role').equals('RESTAURANT'))
    .notEmpty()
    .withMessage('Los datos del restaurante son requeridos para registro de restaurante'),
  
  body('restaurantData.name')
    .if(body('role').equals('RESTAURANT'))
    .notEmpty()
    .withMessage('El nombre del restaurante es requerido')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del restaurante debe tener entre 2 y 100 caracteres'),
  
  body('restaurantData.description')
    .if(body('role').equals('RESTAURANT'))
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  
  body('restaurantData.address')
    .if(body('role').equals('RESTAURANT'))
    .notEmpty()
    .withMessage('La dirección del restaurante es requerida')
    .trim(),
  
  body('restaurantData.phoneNumber')
    .if(body('role').equals('RESTAURANT'))
    .optional()
    .trim()
];

/**
 * Validación para login
 */
const loginValidator = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

module.exports = {
  registerValidator,
  loginValidator
};