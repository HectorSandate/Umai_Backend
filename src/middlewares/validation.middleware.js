// src/middlewares/validation.middleware.js

const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/apiError');

/**
 * Middleware para manejar errores de validación
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    
    console.log('Errores de validación:', formattedErrors);
    
    return res.status(422).json({
      success: false,
      message: 'Errores de validación',
      errors: formattedErrors
    });
  }
  
  next();
}

module.exports = {
  handleValidation
};