// src/repositories/dish.repository.js

const database = require('../config/database');
const prisma = database.getClient();

class DishRepository {
  
  /**
   * Crear platillo
   */
  async create(data) {
    return await prisma.dish.create({
      data,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
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
            phone: true,
            address: true
          }
        },
        videos: {
          where: { isActive: true },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }
  
  /**
   * Listar platillos de un restaurante
   */
  async findByRestaurant(restaurantId, options = {}) {
    const {
      skip = 0,
      take = 20,
      category = null,
      isAvailable = true
    } = options;
    
    const where = {
      restaurantId,
      ...(category && { category }),
      ...(isAvailable !== null && { isAvailable })
    };
    
    const [dishes, total] = await Promise.all([
      prisma.dish.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.dish.count({ where })
    ]);
    
    return { dishes, total };
  }
  
  /**
   * Actualizar platillo
   */
  async update(id, data) {
    return await prisma.dish.update({
      where: { id },
      data,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      }
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
   * Buscar platillos por categoría
   */
  async findByCategory(category, options = {}) {
    const {
      skip = 0,
      take = 20,
      isAvailable = true
    } = options;
    
    return await prisma.dish.findMany({
      skip,
      take,
      where: {
        category,
        isAvailable
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  /**
   * Actualizar disponibilidad
   */
  async updateAvailability(id, isAvailable) {
    return await prisma.dish.update({
      where: { id },
      data: { isAvailable }
    });
  }
  
  /**
   * Incrementar contador de pedidos
   */
  async incrementOrders(id) {
    return await prisma.dish.update({
      where: { id },
      data: {
        totalOrders: { increment: 1 }
      }
    });
  }
  
  /**
   * Incrementar contador de vistas
   */
  async incrementViews(id) {
    return await prisma.dish.update({
      where: { id },
      data: {
        totalViews: { increment: 1 }
      }
    });
  }
}

module.exports = new DishRepository();