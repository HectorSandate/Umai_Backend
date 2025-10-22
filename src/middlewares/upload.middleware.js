// src/middlewares/upload.middleware.js

const multer = require('multer');
const path = require('path');
const config = require('../config/env');
const { ValidationError } = require('../utils/apiError');

/**
 * Configuración de almacenamiento en memoria
 */
const storage = multer.memoryStorage();

/**
 * Filtro para videos
 */
const videoFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Solo se permiten archivos de video (mp4, mov, avi, mkv)'), false);
  }
};

/**
 * Filtro para imágenes
 */
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Solo se permiten archivos de imagen (jpg, png, webp, gif)'), false);
  }
};

/**
 * Upload de videos
 */
const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: config.files.maxVideoSizeMB * 1024 * 1024 // Convertir MB a bytes
  }
});

/**
 * Upload de imágenes
 */
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: config.files.maxImageSizeMB * 1024 * 1024 // Convertir MB a bytes
  }
});

/**
 * Manejo de errores de Multer
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande',
        maxSize: err.field === 'video' 
          ? `${config.files.maxVideoSizeMB}MB` 
          : `${config.files.maxImageSizeMB}MB`,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Error al subir archivo',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  next(err);
};

module.exports = {
  uploadVideo,
  uploadImage,
  handleMulterError,
  // Alias para compatibilidad
  single: (fieldName) => uploadVideo.single(fieldName),
  array: (fieldName, maxCount) => uploadVideo.array(fieldName, maxCount)
};
