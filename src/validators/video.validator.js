// src/validators/video.validator.js

const { body, param, query } = require('express-validator');

const createVideoValidator = [
  // ========== CAMPOS NUEVOS REQUERIDOS ==========
  body('restaurantName')
    .notEmpty()
    .withMessage('El nombre del restaurante es requerido')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del restaurante debe tener entre 2 y 100 caracteres'),
  
  body('dishName')
    .notEmpty()
    .withMessage('El nombre del platillo es requerido')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre del platillo debe tener entre 2 y 100 caracteres'),
  
  body('price')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
  
  body('deliveryLinks')
    .notEmpty()
    .withMessage('Debe proporcionar al menos un link de delivery')
    .custom((value) => {
      // Si viene como string, parsearlo
      let links = value;
      if (typeof value === 'string') {
        try {
          links = JSON.parse(value);
        } catch {
          throw new Error('deliveryLinks debe ser un JSON válido');
        }
      }
      
      // Verificar que sea un objeto
      if (typeof links !== 'object' || Array.isArray(links)) {
        throw new Error('deliveryLinks debe ser un objeto');
      }
      
      // Verificar que tenga al menos una plataforma
      const platforms = Object.keys(links);
      if (platforms.length === 0) {
        throw new Error('Debe proporcionar al menos un link de delivery');
      }
      
      // Verificar que las URLs sean válidas
      // Aceptar ambas formas: las cortas (uber, didi, rappi) y las largas (uberEats, didiFood, rappi)
      const validPlatforms = ['uber', 'uberEats', 'didi', 'didiFood', 'rappi'];
      
      for (const platform of platforms) {
        if (!validPlatforms.includes(platform)) {
          throw new Error(`Plataforma inválida: ${platform}. Use: uber/uberEats, didi/didiFood o rappi`);
        }
        
        const url = links[platform];
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
          throw new Error(`URL inválida para ${platform}`);
        }
      }
      
      return true;
      
      return true;
    }),
  
  // ========== CAMPOS OPCIONALES ==========
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  
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