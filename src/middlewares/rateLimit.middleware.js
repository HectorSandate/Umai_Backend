// src/middlewares/rateLimit.middleware.js

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * Rate limiter general para todas las rutas
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Demasiadas peticiones, por favor intenta más tarde',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false // Disable `X-RateLimit-*` headers
});

/**
 * Rate limiter estricto para autenticación
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de login, por favor intenta más tarde',
    timestamp: new Date().toISOString()
  },
  skipSuccessfulRequests: true // No contar requests exitosas
});

/**
 * Rate limiter para subida de archivos
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads por hora
  message: {
    success: false,
    message: 'Límite de subida de archivos alcanzado, intenta más tarde',
    timestamp: new Date().toISOString()
  }
});

/**
 * Rate limiter para feed (más permisivo)
 */
const feedLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  message: {
    success: false,
    message: 'Demasiadas peticiones al feed, por favor espera un momento',
    timestamp: new Date().toISOString()
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  feedLimiter
};