// src/controllers/auth.controller.js

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  
  /**
   * POST /api/v1/auth/register
   * Registrar nuevo usuario de nuevo 
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      
      return x.created(res, result, 'Usuario registrado exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/v1/auth/login
   * Iniciar sesión
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login(email, password);
      
      return ApiResponse.success(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/v1/auth/logout
   * Cerrar sesión
   */
  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      
      const result = await authService.logout(userId);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/v1/auth/refresh
   * Refrescar token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      const result = await authService.refreshToken(refreshToken);
      
      return ApiResponse.success(res, result, 'Token actualizado');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/auth/me
   * Obtener usuario actual
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      
      const user = await authService.getCurrentUser(userId);
      
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/v1/auth/change-password
   * Cambiar contraseña
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      
      const result = await authService.changePassword(userId, oldPassword, newPassword);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();