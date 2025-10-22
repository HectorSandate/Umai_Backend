// src/controllers/user.controller.js

const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');

class UserController {
  
  /**
   * GET /api/v1/users/profile
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      
      const profile = await userService.getProfile(userId);
      
      return ApiResponse.success(res, profile);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/v1/users/profile
   * Actualizar perfil
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      
      const updatedProfile = await userService.updateProfile(userId, req.body);
      
      return ApiResponse.success(res, updatedProfile, 'Perfil actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/v1/users/preferences
   * Actualizar preferencias
   */
  async updatePreferences(req, res, next) {
    try {
      const userId = req.user.id;
      
      const updatedUser = await userService.updatePreferences(userId, req.body);
      
      return ApiResponse.success(res, updatedUser, 'Preferencias actualizadas');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/users/history
   * Obtener historial de videos vistos
   */
  async getViewHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;
      
      const history = await userService.getViewHistory(userId, limit);
      
      return ApiResponse.success(res, history);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/users/likes
   * Obtener videos con like
   */
  async getLikedVideos(req, res, next) {
    try {
      const userId = req.user.id;
      
      const videos = await userService.getLikedVideos(userId);
      
      return ApiResponse.success(res, videos);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/users/favorites
   * Obtener favoritos
   */
  async getFavorites(req, res, next) {
    try {
      const userId = req.user.id;
      
      const favorites = await userService.getFavorites(userId);
      
      return ApiResponse.success(res, favorites);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * DELETE /api/v1/users/account
   * Eliminar cuenta
   */
  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;
      
      const result = await userService.deleteAccount(userId);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();