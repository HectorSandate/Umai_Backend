// src/app.js

require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================

// 1. SEGURIDAD - Helmet protege de vulnerabilidades comunes
app.use(helmet());

// 2. CORS - Permite peticiones desde el frontend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : '*', // En desarrollo, permite todos los orígenes
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 3. COMPRESIÓN - Comprime las respuestas para que sean más rápidas
app.use(compression());

// 4. PARSEAR BODY - Para leer JSON y form data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. LOGGING - Registra todas las peticiones
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Formato simple para desarrollo
} else {
  app.use(morgan('combined', { // Formato detallado para producción
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// ==========================================
// RUTAS
// ==========================================

// Health check - Para verificar que el servidor está vivo
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Ruta raíz - Info del servidor
app.get('/', (req, res) => {
  res.json({
    message: 'Plateo API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// Todas las rutas de la API
app.use('/api/v1', routes);

// Ruta 404 - Cuando no se encuentra el endpoint
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// ==========================================
// MANEJO DE ERRORES (DEBE IR AL FINAL)
// ==========================================
app.use(errorMiddleware);

module.exports = app;