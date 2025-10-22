// src/services/cloudinary.service.js

const { cloudinary, videoUploadOptions, imageUploadOptions } = require('../config/cloudinary');
const { InternalServerError } = require('../utils/apiError');
const logger = require('../utils/logger');
const streamifier = require('streamifier');

class CloudinaryService {
  
  /**
   * Subir video a Cloudinary
   */
  async uploadVideo(fileBuffer, options = {}) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            ...videoUploadOptions,
            ...options
          },
          (error, result) => {
            if (error) {
              logger.error('Error al subir video a Cloudinary:', error);
              reject(new InternalServerError('Error al subir video'));
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                duration: result.duration,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes
              });
            }
          }
        );
        
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });
    } catch (error) {
      logger.error('Error en uploadVideo:', error);
      throw new InternalServerError('Error al subir video');
    }
  }
  
  /**
   * Subir imagen a Cloudinary
   */
  async uploadImage(fileBuffer, options = {}) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            ...imageUploadOptions,
            ...options
          },
          (error, result) => {
            if (error) {
              logger.error('Error al subir imagen a Cloudinary:', error);
              reject(new InternalServerError('Error al subir imagen'));
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes
              });
            }
          }
        );
        
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });
    } catch (error) {
      logger.error('Error en uploadImage:', error);
      throw new InternalServerError('Error al subir imagen');
    }
  }
  
  /**
   * Eliminar archivo de Cloudinary
   */
  async deleteFile(publicId, resourceType = 'video') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      return result;
    } catch (error) {
      logger.error('Error al eliminar archivo de Cloudinary:', error);
      throw new InternalServerError('Error al eliminar archivo');
    }
  }
  
  /**
   * Obtener URL optimizada de video
   */
  getOptimizedVideoUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    });
  }
  
  /**
   * Obtener URL optimizada de imagen
   */
  getOptimizedImageUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    });
  }
}

module.exports = new CloudinaryService();