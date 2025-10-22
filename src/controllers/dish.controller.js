// src/controllers/dish.controller.js

const dishService = require('../services/dish.service');
const ApiResponse = require('../utils/apiResponse');

class DishController {
  
  /**
   * POST /api/v1/dishes
   * Crear platillo
   */
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      
      const dish = await dishService.create(userId, req.body);
      
      return ApiResponse.created(res, dish, 'Platillo creado exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/dishes/:id
   * Obtener platillo por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const dish = await dishService.getById(id);
      
      return ApiResponse.success(res, dish);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/dishes
   * Listar platillos (con filtros)
   */
  async list(req, res, next) {
    try {
      const { restaurantId, category, page, limit } = req.query;
      
      if (!restaurantId) {
        return ApiResponse.error(res, 'Se requiere restaurantId', 400);
      }
      
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        category
      };
      
      const result = await dishService.getByRestaurant(restaurantId, options);
      
      return ApiResponse.successWithPagination(
        res,
        result.dishes,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/dishes/my/all
   * Listar mis platillos
   */
  async getMyDishes(req, res, next) {
    try {
      const userId = req.user.id;
      
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        category: req.query.category
      };
      
      const result = await dishService.getMyDishes(userId, options);
      
      return ApiResponse.successWithPagination(
        res,
        result.dishes,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/v1/dishes/:id
   * Actualizar platillo
   */
  async update(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const updated = await dishService.update(userId, id, req.body);
      
      return ApiResponse.success(res, updated, 'Platillo actualizado');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * DELETE /api/v1/dishes/:id
   * Eliminar platillo
   */
  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await dishService.delete(userId, id);
      
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PATCH /api/v1/dishes/:id/availability
   * Actualizar disponibilidad
   */
  async updateAvailability(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { isAvailable } = req.body;
      
      const updated = await dishService.updateAvailability(userId, id, isAvailable);
      
      return ApiResponse.success(res, updated, 'Disponibilidad actualizada');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/dishes/category/:category
   * Buscar por categoría
   */
  async getByCategory(req, res, next) {
    try {
      const { category } = req.params;
      
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const dishes = await dishService.getByCategory(category, options);
      
      return ApiResponse.success(res, dishes);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DishController();