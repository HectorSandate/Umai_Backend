// src/controllers/restaurant.controller.js

const restaurantService = require('../services/restaurant.service');
const ApiResponse = require('../utils/apiResponse');

class RestaurantController {
  
  /**
   * GET /api/v1/restaurants
   * Listar restaurantes
   */
  async list(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search,
        category: req.query.category
      };
      
      const result = await restaurantService.list(options);
      
      return ApiResponse.successWithPagination(
        res,
        result.restaurants,
        result.pagination,
        'Restaurantes obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/restaurants/:id
   * Obtener restaurante por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const restaurant = await restaurantService.getById(id);
      
      return ApiResponse.success(res, restaurant);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/restaurants/my/profile
   * Obtener mi restaurante
   */
  async getMyRestaurant(req, res, next) {
    try {
      const userId = req.user.id;
      
      const restaurant = await restaurantService.getMyRestaurant(userId);
      
      return ApiResponse.success(res, restaurant);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/v1/restaurants/my/profile
   * Actualizar mi restaurante
   */
  async update(req, res, next) {
    try {
      const userId = req.user.id;
      
      const updated = await restaurantService.update(userId, req.body);
      
      return ApiResponse.success(res, updated, 'Restaurante actualizado');
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/restaurants/nearby
   * Buscar restaurantes cercanos
   */
  async findNearby(req, res, next) {
    try {
      const { lat, lng, radius } = req.query;
      
      if (!lat || !lng) {
        return ApiResponse.error(res, 'Se requieren coordenadas (lat, lng)', 400);
      }
      
      const restaurants = await restaurantService.findNearby(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius) || 10
      );
      
      return ApiResponse.success(res, restaurants);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/v1/restaurants/my/stats
   * Obtener estadísticas de mi restaurante
   */
  async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      
      const stats = await restaurantService.getStats(userId);
      
      return ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/v1/restaurants/my/subscription
   * Actualizar suscripción
   */
  async updateSubscription(req, res, next) {
    try {
      const userId = req.user.id;
      const { tier, durationMonths } = req.body;
      
      const updated = await restaurantService.updateSubscription(
        userId,
        tier,
        durationMonths
      );
      
      return ApiResponse.success(res, updated, 'Suscripción actualizada');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RestaurantController();