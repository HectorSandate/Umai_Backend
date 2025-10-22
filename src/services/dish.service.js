// src/services/dish.service.js

const dishRepository = require('../repositories/dish.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const { NotFoundError, ForbiddenError } = require('../utils/apiError');

class DishService {
  
  /**
   * Crear platillo
   */
  async create(userId, data) {
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurante no encontrado');
    }
    
    const dish = await dishRepository.create({
      restaurantId: restaurant.id,
      ...data
    });
    
    return dish;
  }
  
  /**
   * Obtener platillo por ID
   */
  async getById(id) {
    const dish = await dishRepository.findById(id);
    
    if (!dish) {
      throw new NotFoundError('Platillo no encontrado');
    }
    
    return dish;
  }
  
  /**
   * Listar platillos del restaurante
   */
  async getByRestaurant(restaurantId, options = {}) {
    const { page = 1, limit = 20, category, isAvailable } = options;
    
    const skip = (page - 1) * limit;
    
    const { dishes, total } = await dishRepository.findByRestaurant(
      restaurantId,
      {
        skip,
        take: limit,
        category,
        isAvailable
      }
    );
    
    return {
      dishes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Listar mis platillos (restaurante autenticado)
   */
  async getMyDishes(userId, options = {}) {
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurante no encontrado');
    }
    
    return await this.getByRestaurant(restaurant.id, options);
  }
  
  /**
   * Actualizar platillo
   */
  async update(userId, dishId, data) {
    const dish = await dishRepository.findById(dishId);
    
    if (!dish) {
      throw new NotFoundError('Platillo no encontrado');
    }
    
    // Verificar que el platillo pertenece al restaurante del usuario
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant || dish.restaurantId !== restaurant.id) {
      throw new ForbiddenError('No tienes permiso para editar este platillo');
    }
    
    const updated = await dishRepository.update(dishId, data);
    
    return updated;
  }
  
  /**
   * Eliminar platillo
   */
  async delete(userId, dishId) {
    const dish = await dishRepository.findById(dishId);
    
    if (!dish) {
      throw new NotFoundError('Platillo no encontrado');
    }
    
    // Verificar que el platillo pertenece al restaurante del usuario
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant || dish.restaurantId !== restaurant.id) {
      throw new ForbiddenError('No tienes permiso para eliminar este platillo');
    }
    
    await dishRepository.delete(dishId);
    
    return { message: 'Platillo eliminado exitosamente' };
  }
  
  /**
   * Actualizar disponibilidad
   */
  async updateAvailability(userId, dishId, isAvailable) {
    const dish = await dishRepository.findById(dishId);
    
    if (!dish) {
      throw new NotFoundError('Platillo no encontrado');
    }
    
    // Verificar permisos
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant || dish.restaurantId !== restaurant.id) {
      throw new ForbiddenError('No tienes permiso para modificar este platillo');
    }
    
    const updated = await dishRepository.updateAvailability(dishId, isAvailable);
    
    return updated;
  }
  
  /**
   * Buscar platillos por categoría
   */
  async getByCategory(category, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    const skip = (page - 1) * limit;
    
    const dishes = await dishRepository.findByCategory(category, {
      skip,
      take: limit
    });
    
    return dishes;
  }
}

module.exports = new DishService();