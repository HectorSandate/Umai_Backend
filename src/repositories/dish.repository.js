// src/repositories/dish.repository.js

const database = require('../config/database');
const prisma = database.getClient();
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/apiError');

class DishRepository {
  
  /**
   * ====== MÉTODO PRINCIPAL PARA CREAR PLATILLO ======
   */
  async create(data) {
    try {
      return await prisma.dish.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          restaurantId: data.restaurantId,
          category: data.category || 'OTRO',
          uberEatsLink: data.uberEatsLink || null,
          didiLink: data.didiLink || null,
          rappiLink: data.rappiLink || null,
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error al crear platillo:', error);
      throw error;
    }
  }
  
  /**
   * Buscar platillo por ID
   */
  async findById(id) {
    return await prisma.dish.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        }
      }
    });
  }
  
  /**
   * Buscar platillos de un restaurante
   */
  async findByRestaurant(restaurantId, options = {}) {
    const { skip = 0, take = 50, isAvailable = true } = options;
    
    return await prisma.dish.findMany({
      where: {
        restaurantId,
        isAvailable
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }
  
  /**
   * Actualizar platillo
   */
  async update(id, data) {
    return await prisma.dish.update({
      where: { id },
      data
    });
  }
  
  /**
   * Eliminar platillo
   */
  async delete(id) {
    return await prisma.dish.delete({
      where: { id }
    });
  }
  
  /**
   * Incrementar contador de vistas
   */
  async incrementViews(id) {
    return await prisma.dish.update({
      where: { id },
      data: {
        viewsCount: { increment: 1 }
      }
    });
  }
  
  /**
   * Incrementar contador de pedidos
   */
  async incrementOrders(id) {
    return await prisma.dish.update({
      where: { id },
      data: {
        ordersCount: { increment: 1 }
      }
    });
  }
  
  /**
   * Obtener platillos populares
   */
  async findPopular(limit = 20) {
    return await prisma.dish.findMany({
      where: {
        isAvailable: true
      },
      take: limit,
      orderBy: [
        { ordersCount: 'desc' },
        { viewsCount: 'desc' }
      ],
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            rating: true
          }
        }
      }
    });
  }
}

module.exports = new DishRepository();