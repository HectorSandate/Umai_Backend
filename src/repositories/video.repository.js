// src/repositories/video.repository.js

const database = require('../config/database');
const prisma = database.getClient();

class VideoRepository {
  
  /**
   * Crear video
   */
  async create(data) {
    return await prisma.video.create({
      data,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        dish: {
          select: {
            id: true,
            name: true,
            price: true,
            uberEatsLink: true,
            didiLink: true,
            rappiLink: true
          }
        }
      }
    });
  }
  
  /**
   * Buscar video por ID
   */
  async findById(id) {
    return await prisma.video.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            rating: true,
            address: true,
            phone: true
          }
        },
        dish: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            uberEatsLink: true,
            didiLink: true,
            rappiLink: true
          }
        }
      }
    });
  }
  
  /**
   * Listar videos con filtros y paginación
   */
  async findAll(options = {}) {
    const {
      skip = 0,
      take = 20,
      category = null,
      restaurantId = null,
      isActive = true,
      orderBy = { createdAt: 'desc' }
    } = options;
    
    const where = {
      isActive,
      isPublic: true,
      ...(category && { category }),
      ...(restaurantId && { restaurantId })
    };
    
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              rating: true
            }
          },
          dish: {
            select: {
              id: true,
              name: true,
              price: true
            }
          }
        }
      }),
      prisma.video.count({ where })
    ]);
    
    return { videos, total };
  }
  
  /**
   * Buscar videos de un restaurante
   */
  async findByRestaurant(restaurantId, options = {}) {
    const {
      skip = 0,
      take = 20,
      isActive = true
    } = options;
    
    return await prisma.video.findMany({
      skip,
      take,
      where: {
        restaurantId,
        isActive,
        isPublic: true
      },
      include: {
        dish: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  /**
   * Actualizar video
   */
  async update(id, data) {
    return await prisma.video.update({
      where: { id },
      data,
      include: {
        restaurant: true,
        dish: true
      }
    });
  }
  
  /**
   * Eliminar video
   */
  async delete(id) {
    return await prisma.video.delete({
      where: { id }
    });
  }
  
  /**
   * Incrementar contador de vistas
   */
  async incrementViews(id) {
    return await prisma.video.update({
      where: { id },
      data: {
        viewsCount: { increment: 1 }
      }
    });
  }
  
  /**
   * Incrementar contador de likes
   */
  async incrementLikes(id) {
    return await prisma.video.update({
      where: { id },
      data: {
        likesCount: { increment: 1 }
      }
    });
  }
  
  /**
   * Decrementar contador de likes
   */
  async decrementLikes(id) {
    return await prisma.video.update({
      where: { id },
      data: {
        likesCount: { decrement: 1 }
      }
    });
  }
  
  /**
   * Incrementar contador de favoritos
   */
  async incrementFavorites(id) {
    return await prisma.video.update({
      where: { id },
      data: {
        favoritesCount: { increment: 1 }
      }
    });
  }
  
  /**
   * Decrementar contador de favoritos
   */
  async decrementFavorites(id) {
    return await prisma.video.update({
      where: { id },
      data: {
        favoritesCount: { decrement: 1 }
      }
    });
  }
  
  /**
   * Incrementar contador de clicks a delivery
   */
  async incrementOrderClicks(id) {
    return await prisma.video.update({
      where: { id },
      data: {
        clicksToOrder: { increment: 1 }
      }
    });
  }
  
  /**
   * Registrar visualización de video
   */
  async createView(userId, videoId, data = {}) {
    return await prisma.videoView.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      },
      update: {
        watchTime: data.watchTime || 0,
        completed: data.completed || false
      },
      create: {
        userId,
        videoId,
        watchTime: data.watchTime || 0,
        completed: data.completed || false,
        platform: data.platform,
        location: data.location
      }
    });
  }
  
  /**
   * Dar like a video
   */
  async createLike(userId, videoId) {
    return await prisma.like.create({
      data: {
        userId,
        videoId
      }
    });
  }
  
  /**
   * Quitar like
   */
  async deleteLike(userId, videoId) {
    return await prisma.like.delete({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    });
  }
  
  /**
   * Verificar si el usuario le dio like
   */
  async hasLiked(userId, videoId) {
    const like = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    });
    
    return !!like;
  }
  
  /**
   * Agregar a favoritos
   */
  async createFavorite(userId, videoId) {
    return await prisma.favorite.create({
      data: {
        userId,
        videoId
      }
    });
  }
  
  /**
   * Quitar de favoritos
   */
  async deleteFavorite(userId, videoId) {
    return await prisma.favorite.delete({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    });
  }
  
  /**
   * Verificar si está en favoritos
   */
  async hasFavorited(userId, videoId) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    });
    
    return !!favorite;
  }
  
  /**
   * Registrar click en enlace de delivery
   */
  async createOrderClick(data) {
    return await prisma.orderClick.create({
      data
    });
  }
  
  /**
   * Actualizar scores del video
   */
  async updateScores(id, scores) {
    return await prisma.video.update({
      where: { id },
      data: scores
    });
  }
  
  /**
   * Obtener videos para el algoritmo de recomendación
   */
  async findForRecommendation(userId, limit = 20) {
    // Obtener IDs de videos ya vistos recientemente (aumentar a 100 para más diversidad)
    const recentViews = await prisma.videoView.findMany({
      where: { userId },
      select: { videoId: true },
      orderBy: { createdAt: 'desc' },
      take: 100 // Aumentado de 30 a 100 para evitar más repeticiones
    });
    
    const viewedVideoIds = recentViews.map(v => v.videoId);
    
    // Obtener videos candidatos con orden aleatorio parcial para diversidad
    // Traer más videos para tener más opciones de diversificación
    return await prisma.video.findMany({
      where: {
        isActive: true,
        isPublic: true,
        id: {
          notIn: viewedVideoIds.length > 0 ? viewedVideoIds : []
        }
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            location: true,
            rating: true,
            subscriptionTier: true
          }
        },
        dish: {
          select: {
            id: true,
            name: true,
            price: true,
            category: true
          }
        }
      },
      orderBy: [
        { popularityScore: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit * 10 // Traer más para poder filtrar y diversificar después
    });
  }
}

module.exports = new VideoRepository();
