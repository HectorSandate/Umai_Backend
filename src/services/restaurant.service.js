// src/services/restaurant.service.js

const restaurantRepository = require('../repositories/restaurant.repository');
const { NotFoundError, ForbiddenError } = require('../utils/apiError');

class RestaurantService {
  
  /**
   * Obtener restaurante por ID
   */
  async getById(id) {
    const restaurant = await restaurantRepository.findById(id);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurante no encontrado');
    }
    
    return restaurant;
  }
  
  /**
   * Obtener restaurante del usuario autenticado
   */
  async getMyRestaurant(userId) {
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant) {
      throw new NotFoundError('No tienes un restaurante registrado');
    }
    
    return restaurant;
  }
  
  /**
   * Listar restaurantes con filtros
   */
  async list(options = {}) {
    const { page = 1, limit = 20, search, category } = options;
    
    const skip = (page - 1) * limit;
    
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && {
        categories: {
          has: category
        }
      })
    };
    
    const { restaurants, total } = await restaurantRepository.findAll({
      skip,
      take: limit,
      where,
      orderBy: { rating: 'desc' }
    });
    
    return {
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Actualizar restaurante
   */
  async update(userId, data) {
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurante no encontrado');
    }
    
    const {
      name,
      description,
      address,
      phone,
      location,
      categories,
      schedule,
      logoUrl,
      coverUrl
    } = data;
    
    const updated = await restaurantRepository.update(restaurant.id, {
      ...(name && { name }),
      ...(description && { description }),
      ...(address && { address }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(categories && { categories }),
      ...(schedule && { schedule }),
      ...(logoUrl && { logoUrl }),
      ...(coverUrl && { coverUrl })
    });
    
    return updated;
  }
  
  /**
   * Buscar restaurantes cercanos
   */
  async findNearby(lat, lng, radiusKm = 10) {
    const restaurants = await restaurantRepository.findNearby(lat, lng, radiusKm);
    
    // Ordenar por distancia (ya calculada en el repository)
    return restaurants.sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Verificar si puede subir más videos este mes
   */
  async canUploadVideo(userId) {
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurante no encontrado');
    }
    
    if (restaurant.videosUploadedThisMonth >= restaurant.maxVideosPerMonth) {
      throw new ForbiddenError(
        `Has alcanzado el límite de ${restaurant.maxVideosPerMonth} videos por mes. Mejora tu suscripción para subir más.`
      );
    }
    
    return true;
  }
  
  /**
   * Actualizar suscripción
   */
  async updateSubscription(userId, tier, durationMonths = 1) {
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurante no encontrado');
    }
    
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + durationMonths);
    
    const updated = await restaurantRepository.updateSubscription(
      restaurant.id,
      tier,
      endsAt
    );
    
    return updated;
  }
  
  /**
   * Obtener estadísticas del restaurante
   */
  async getStats(userId) {
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurante no encontrado');
    }
    
    return {
      totalVideos: restaurant.totalVideos,
      totalViews: restaurant.totalViews,
      rating: restaurant.rating,
      totalReviews: restaurant.totalReviews,
      videosUploadedThisMonth: restaurant.videosUploadedThisMonth,
      maxVideosPerMonth: restaurant.maxVideosPerMonth,
      subscriptionTier: restaurant.subscriptionTier,
      subscriptionEndsAt: restaurant.subscriptionEndsAt
    };
  }
}

module.exports = new RestaurantService();