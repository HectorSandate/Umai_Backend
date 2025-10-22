// src/middlewares/error.middleware.js

const { ApiError } = require('../utils/apiError');

/**
 * Middleware de manejo de errores
 */
function errorMiddleware(err, req, res, next) {
  console.error('Error capturado:', err);

  // Si es un ApiError personalizado
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Error de validación de Prisma
  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en la base de datos',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Error de Prisma - registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Recurso no encontrado'
    });
  }

  // Error de Prisma - violación de constraint único
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'El recurso ya existe',
      ...(process.env.NODE_ENV === 'development' && { 
        field: err.meta?.target 
      })
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error de Multer (archivos)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Error al subir archivo: ${err.message}`
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
}

module.exports = errorMiddleware;