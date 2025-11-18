// src/repositories/restaurant.repository.js

const database = require('../config/database');
const prisma = database.getClient();
const logger = require('../utils/logger');

class RestaurantRepository {
  
  /**
   * Crear restaurante
   */
  async create(data) {
    return await prisma.restaurant.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      }
    });
  }
  
  /**
   * Buscar restaurante por ID
   */
  async findById(id) {
    return await prisma.restaurant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      }
    });
  }
  
  /**
   * Buscar restaurante por userId
   */
  async findByUserId(userId) {
    return await prisma.restaurant.findUnique({
      where: { userId }
    });
  }
  
  /**
   * ====== NUEVO MÉTODO ======
   * Buscar restaurante por nombre (case-insensitive)
   */
  async findByName(name) {
    try {
      return await prisma.restaurant.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      });
    } catch (error) {
      logger.error('Error en findByName:', error);
      return null;
    }
  }
  
  /**
   * Listar todos los restaurantes (con paginación)
   */
  async findAll(options = {}) {
    const {
      skip = 0,
      take = 20,
      where = {},
      orderBy = { createdAt: 'desc' }
    } = options;
    
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.restaurant.count({ where })
    ]);
    
    return { restaurants, total };
  }
  
  /**
   * Actualizar restaurante
   */
  async update(id, data) {
    return await prisma.restaurant.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
  }
  
  /**
   * Eliminar restaurante
   */
  async delete(id) {
    return await prisma.restaurant.delete({
      where: { id }
    });
  }
  
  /**
   * Buscar restaurantes cercanos
   */
  async findNearby(lat, lng, radiusKm = 10) {
    // Nota: Para búsqueda geográfica precisa necesitarías PostGIS
    // Esta es una implementación simplificada
    const restaurants = await prisma.restaurant.findMany({
      where: {
        isActive: true,
        location: { not: null }
      }
    });
    
    // Filtrar por distancia en JavaScript
    // En producción, usa PostGIS o una solución más eficiente
    return restaurants.filter(restaurant => {
      if (!restaurant.location?.lat || !restaurant.location?.lng) return false;
      
      const distance = this.calculateDistance(
        lat, lng,
        restaurant.location.lat,
        restaurant.location.lng
      );
      
      return distance <= radiusKm;
    });
  }
  
  /**
   * Actualizar estadísticas del restaurante
   */
  async updateStats(id, stats) {
    return await prisma.restaurant.update({
      where: { id },
      data: stats
    });
  }
  
  /**
   * Incrementar contador de videos subidos este mes
   */
  async incrementVideosThisMonth(id) {
    return await prisma.restaurant.update({
      where: { id },
      data: {
        videosUploadedThisMonth: { increment: 1 },
        totalVideos: { increment: 1 }
      }
    });
  }
  
  /**
   * Resetear contador mensual de videos
   */
  async resetMonthlyVideoCount(id) {
    return await prisma.restaurant.update({
      where: { id },
      data: { videosUploadedThisMonth: 0 }
    });
  }
  
  /**
   * Actualizar suscripción
   */
  async updateSubscription(id, tier, endsAt) {
    const limits = {
      FREE: { maxVideos: 10, canSponsor: false },
      BASIC: { maxVideos: 50, canSponsor: false },
      PREMIUM: { maxVideos: 999999, canSponsor: true }
    };
    
    return await prisma.restaurant.update({
      where: { id },
      data: {
        subscriptionTier: tier,
        subscriptionStartAt: new Date(),
        subscriptionEndsAt: endsAt,
        maxVideosPerMonth: limits[tier].maxVideos,
        canSponsorVideos: limits[tier].canSponsor
      }
    });
  }
  
  /**
   * Calcular distancia entre dos puntos (Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = new RestaurantRepository();