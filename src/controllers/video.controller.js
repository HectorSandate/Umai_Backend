// src/controllers/video.controller.js

const videoService = require('../services/video.service');
const ApiResponse = require('../utils/apiResponse');

class VideoController {
  
  /**
   * POST /api/v1/videos
   * Crear video
   */
  async createVideo(req, res, next) {
    try {
      const userId = req.user.id;
      const file = req.file;
      
      if (!file) {
        return ApiResponse.error(res, 'El archivo de video es requerido', 400);
      }
      
      const video = await videoService.create(userId, file, req.body);
      
      return ApiResponse.created(res, video, 'Video creado exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/videos
   * Listar videos
   */
  async getAllVideos(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        category: req.query.category,
        restaurantId: req.query.restaurantId
      };
      
      const result = await videoService.list(options);
      
      return ApiResponse.successWithPagination(
        res,
        result.videos,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/videos/:id
   * Obtener video por ID
   */
  async getVideoById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const video = await videoService.getById(id, userId);
      
      return ApiResponse.success(res, video);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/videos/my/all
   * Obtener mis videos
   */
  async getMyVideos(req, res, next) {
    try {
      const userId = req.user.id;
      
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const videos = await videoService.getMyVideos(userId, options);
      
      return ApiResponse.success(res, videos);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/videos/restaurant/:restaurantId
   * Obtener videos de un restaurante
   */
  async getByRestaurant(req, res, next) {
    try {
      const { restaurantId } = req.params;
      
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const videos = await videoService.getByRestaurant(restaurantId, options);
      
      return ApiResponse.success(res, videos);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/v1/videos/:id
   * Actualizar video
   */
  async updateVideo(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const updated = await videoService.update(userId, id, req.body);
      
      return ApiResponse.success(res, updated, 'Video actualizado');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * DELETE /api/v1/videos/:id
   * Eliminar video
   */
  async deleteVideo(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await videoService.delete(userId, id);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/v1/videos/:id/view
   * Registrar visualización
   */
  async registerView(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await videoService.registerView(userId, id, req.body);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/v1/videos/:id/like
   * Dar like
   */
  async likeVideo(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await videoService.likeVideo(userId, id);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * DELETE /api/v1/videos/:id/like
   * Quitar like
   */
  async unlikeVideo(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await videoService.unlikeVideo(userId, id);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/v1/videos/:id/favorite
   * Agregar a favoritos
   */
  async addToFavorites(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await videoService.addToFavorites(userId, id);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * DELETE /api/v1/videos/:id/favorite
   * Quitar de favoritos
   */
  async removeFromFavorites(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await videoService.removeFromFavorites(userId, id);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/v1/videos/:id/click-order
   * Registrar click en enlace de delivery
   */
  async registerOrderClick(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { platform } = req.body;
      
      const result = await videoService.registerOrderClick(
        userId,
        id,
        platform,
        {
          location: req.body.location,
          device: req.body.device
        }
      );
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/videos/:id/stats
   * Obtener estadísticas del video
   */
  async getVideoStats(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const stats = await videoService.getVideoStats(userId, id);
      
      return ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VideoController();