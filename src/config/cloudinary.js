// src/config/cloudinary.js

const cloudinary = require('cloudinary').v2;
const config = require('./env');
const logger = require('../utils/logger');

/**
 * Configurar Cloudinary
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

/**
 * Verificar configuración de Cloudinary
 */
async function verifyCloudinaryConfig() {
  try {
    await cloudinary.api.ping();
    logger.info('Conexión a Cloudinary establecida');
    return true;
  } catch (error) {
    logger.error('Error al conectar con Cloudinary:', error);
    return false;
  }
}

/**
 * Opciones por defecto para videos
 */
const videoUploadOptions = {
  resource_type: 'video',
  folder: 'plateo/videos',
  chunk_size: 6000000, // 6MB chunks
  eager: [
    { 
      width: 720, 
      crop: 'scale',
      quality: 'auto:good',
      format: 'mp4'
    }
  ],
  eager_async: true,
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' }
  ]
};

/**
 * Opciones por defecto para imágenes
 */
const imageUploadOptions = {
  resource_type: 'image',
  folder: 'plateo/images',
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' }
  ]
};

module.exports = {
  cloudinary,
  verifyCloudinaryConfig,
  videoUploadOptions,
  imageUploadOptions
};