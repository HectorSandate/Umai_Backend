// src/services/video.service.js

const videoRepository = require('../repositories/video.repository');
const dishRepository = require('../repositories/dish.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const cloudinaryService = require('./cloudinary.service');
const restaurantService = require('./restaurant.service');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/apiError');
const logger = require('../utils/logger');

class VideoService {
  
  /**
   * ========== MÉTODO ACTUALIZADO: Crear video con restaurante y platillo ==========
   */
  async create(userId, file, data) {
    try {
      // Verificar que el usuario puede subir más videos
      await restaurantService.canUploadVideo(userId);
      
      // 1. PARSEAR DATOS QUE VIENEN COMO STRING
      let tags = data.tags || [];
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (error) {
          logger.warn('Error al parsear tags, usando array vacío');
          tags = [];
        }
      }
      
      let deliveryLinks = data.deliveryLinks;
      if (typeof deliveryLinks === 'string') {
        try {
          deliveryLinks = JSON.parse(deliveryLinks);
        } catch (error) {
          logger.error('Error al parsear deliveryLinks');
          throw new ValidationError('deliveryLinks debe ser un JSON válido');
        }
      }
      
      // 2. BUSCAR O CREAR RESTAURANTE
      let restaurant = await restaurantRepository.findByUserId(userId);
      
      // Si el usuario no tiene restaurante, o si el nombre es diferente, buscar/crear
      if (!restaurant || restaurant.name !== data.restaurantName) {
        // Buscar restaurante por nombre
        restaurant = await restaurantRepository.findByName(data.restaurantName);
        
        // Si no existe, crearlo
        if (!restaurant) {
          logger.info(`Creando nuevo restaurante: ${data.restaurantName}`);
          restaurant = await restaurantRepository.create({
            name: data.restaurantName,
            description: `Restaurante ${data.restaurantName}`,
            address: 'Por definir',
            userId: userId,
            phoneNumber: null,
            isActive: true,
            isVerified: false
          });
          logger.info(`Restaurante creado con ID: ${restaurant.id}`);
        }
      }
      
      // 3. CREAR PLATILLO (DISH)
      logger.info(`Creando platillo: ${data.dishName} para restaurante ${restaurant.id}`);
      const dish = await dishRepository.create({
        name: data.dishName,
        description: data.description,
        price: parseFloat(data.price),
        restaurantId: restaurant.id,
        category: data.category || 'OTRO',
        // Guardar los links de delivery en el platillo
        uberEatsLink: deliveryLinks.uberEats || null,
        didiLink: deliveryLinks.didiFood || null,
        rappiLink: deliveryLinks.rappi || null,
        isAvailable: true
      });
      logger.info(`Platillo creado con ID: ${dish.id}`);
      
      // 4. SUBIR VIDEO A CLOUDINARY
      logger.info(`Subiendo video a Cloudinary para restaurante ${restaurant.id}`);
      const uploadResult = await cloudinaryService.uploadVideo(file.buffer, {
        folder: `umai/videos/${restaurant.id}`
      });
      logger.info(`Video subido a Cloudinary: ${uploadResult.publicId}`);
      
      // 5. CREAR VIDEO EN BASE DE DATOS
      const video = await videoRepository.create({
        restaurantId: restaurant.id,
        dishId: dish.id,
        cloudinaryUrl: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId,
        title: data.title || data.dishName, // Si no hay título, usar nombre del platillo
        description: data.description,
        duration: uploadResult.duration,
        thumbnailUrl: uploadResult.url.replace(/\.[^.]+$/, '.jpg'),
        tags: tags,
        category: data.category || 'OTRO',
        priceRange: data.priceRange,
        deliveryLinks: {
          uber: deliveryLinks.uberEats || null,
          didi: deliveryLinks.didiFood || null,
          rappi: deliveryLinks.rappi || null
        },
        isActive: true,
        isPublic: true
      });
      logger.info(`Video creado con ID: ${video.id}`);
      
      // 6. INCREMENTAR CONTADOR DE VIDEOS DEL RESTAURANTE
      await restaurantRepository.incrementVideosThisMonth(restaurant.id);
      
      logger.info(`✅ Video creado exitosamente: ${video.id}`);
      
      return {
        video,
        dish,
        restaurant
      };
      
    } catch (error) {
      logger.error('❌ Error en VideoService.create:', error);
      throw error;
    }
  }
  
  /**
   * Obtener video por ID
   */
  async getById(videoId, userId = null) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Si hay usuario autenticado, verificar interacciones
    if (userId) {
      const [hasLiked, hasFavorited] = await Promise.all([
        videoRepository.hasLiked(userId, videoId),
        videoRepository.hasFavorited(userId, videoId)
      ]);
      
      return {
        ...video,
        hasLiked,
        hasFavorited
      };
    }
    
    return video;
  }
  
  /**
   * Listar videos con filtros
   */
  async list(options = {}) {
    const { page = 1, limit = 20, category, restaurantId } = options;
    
    const skip = (page - 1) * limit;
    
    const { videos, total } = await videoRepository.findAll({
      skip,
      take: limit,
      category,
      restaurantId,
      orderBy: { createdAt: 'desc' }
    });
    
    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Obtener videos de mi restaurante
   */
  async getMyVideos(userId, options = {}) {
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurante no encontrado');
    }
    
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    const videos = await videoRepository.findByRestaurant(restaurant.id, {
      skip,
      take: limit
    });
    
    return videos;
  }
  
  /**
   * Obtener videos de un restaurante específico
   */
  async getByRestaurant(restaurantId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    const videos = await videoRepository.findByRestaurant(restaurantId, {
      skip,
      take: limit
    });
    
    return videos;
  }
  
  /**
   * Actualizar video
   */
  async update(userId, videoId, data) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Verificar que el video pertenece al restaurante del usuario
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant || video.restaurantId !== restaurant.id) {
      throw new ForbiddenError('No tienes permiso para editar este video');
    }
    
    const updated = await videoRepository.update(videoId, data);
    
    return updated;
  }
  
  /**
   * Eliminar video
   */
  async delete(userId, videoId) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Verificar permisos
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant || video.restaurantId !== restaurant.id) {
      throw new ForbiddenError('No tienes permiso para eliminar este video');
    }
    
    // Eliminar de Cloudinary
    try {
      await cloudinaryService.deleteFile(video.cloudinaryPublicId, 'video');
    } catch (error) {
      logger.error('Error al eliminar video de Cloudinary:', error);
      // Continuar aunque falle la eliminación de Cloudinary
    }
    
    // Eliminar de base de datos
    await videoRepository.delete(videoId);
    
    return { message: 'Video eliminado exitosamente' };
  }
  
  /**
   * Registrar visualización
   */
  async registerView(userId, videoId, data = {}) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Crear o actualizar registro de visualización
    await videoRepository.createView(userId, videoId, {
      watchTime: data.watchTime || 0,
      completed: data.completed || false,
      platform: data.platform,
      location: data.location
    });
    
    // Incrementar contador de vistas
    await videoRepository.incrementViews(videoId);
    
    // Incrementar vistas del platillo
    await dishRepository.incrementViews(video.dishId);
    
    return { message: 'Visualización registrada' };
  }
  
  /**
   * Dar like a video
   */
  async likeVideo(userId, videoId) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Verificar si ya le dio like
    const hasLiked = await videoRepository.hasLiked(userId, videoId);
    
    if (hasLiked) {
      throw new ValidationError('Ya le diste like a este video');
    }
    
    // Crear like
    await videoRepository.createLike(userId, videoId);
    
    // Incrementar contador
    await videoRepository.incrementLikes(videoId);
    
    return { message: 'Like registrado' };
  }
  
  /**
   * Quitar like
   */
  async unlikeVideo(userId, videoId) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Verificar si tiene like
    const hasLiked = await videoRepository.hasLiked(userId, videoId);
    
    if (!hasLiked) {
      throw new ValidationError('No le has dado like a este video');
    }
    
    // Eliminar like
    await videoRepository.deleteLike(userId, videoId);
    
    // Decrementar contador
    await videoRepository.decrementLikes(videoId);
    
    return { message: 'Like eliminado' };
  }
  
  /**
   * Agregar a favoritos
   */
  async addToFavorites(userId, videoId) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Verificar si ya está en favoritos
    const hasFavorited = await videoRepository.hasFavorited(userId, videoId);
    
    if (hasFavorited) {
      throw new ValidationError('El video ya está en favoritos');
    }
    
    // Crear favorito
    await videoRepository.createFavorite(userId, videoId);
    
    // Incrementar contador
    await videoRepository.incrementFavorites(videoId);
    
    return { message: 'Agregado a favoritos' };
  }
  
  /**
   * Quitar de favoritos
   */
  async removeFromFavorites(userId, videoId) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Verificar si está en favoritos
    const hasFavorited = await videoRepository.hasFavorited(userId, videoId);
    
    if (!hasFavorited) {
      throw new ValidationError('El video no está en favoritos');
    }
    
    // Eliminar favorito
    await videoRepository.deleteFavorite(userId, videoId);
    
    // Decrementar contador
    await videoRepository.decrementFavorites(videoId);
    
    return { message: 'Eliminado de favoritos' };
  }
  
  /**
   * Registrar click en enlace de delivery
   */
  async registerOrderClick(userId, videoId, platform, data = {}) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Validar que la plataforma es válida
    const validPlatforms = ['uber', 'didi', 'rappi'];
    if (!validPlatforms.includes(platform)) {
      throw new ValidationError('Plataforma inválida');
    }
    
    // Verificar que el video tiene el enlace de la plataforma
    const deliveryLinks = video.deliveryLinks || {};
    if (!deliveryLinks[platform]) {
      throw new ValidationError(`Este video no tiene enlace de ${platform}`);
    }
    
    // Registrar click
    await videoRepository.createOrderClick({
      userId,
      videoId,
      platform,
      location: data.location,
      device: data.device
    });
    
    // Incrementar contador de clicks
    await videoRepository.incrementOrderClicks(videoId);
    
    // Incrementar contador de pedidos del platillo
    await dishRepository.incrementOrders(video.dishId);
    
    return {
      message: 'Click registrado',
      redirectUrl: deliveryLinks[platform]
    };
  }
  
  /**
   * Obtener estadísticas de un video
   */
  async getVideoStats(userId, videoId) {
    const video = await videoRepository.findById(videoId);
    
    if (!video) {
      throw new NotFoundError('Video no encontrado');
    }
    
    // Verificar que el video pertenece al restaurante del usuario
    const restaurant = await restaurantRepository.findByUserId(userId);
    
    if (!restaurant || video.restaurantId !== restaurant.id) {
      throw new ForbiddenError('No tienes permiso para ver estas estadísticas');
    }
    
    return {
      videoId: video.id,
      title: video.title,
      views: video.viewsCount,
      likes: video.likesCount,
      favorites: video.favoritesCount,
      shares: video.sharesCount,
      clicksToOrder: video.clicksToOrder,
      conversionRate: video.viewsCount > 0 
        ? ((video.clicksToOrder / video.viewsCount) * 100).toFixed(2) + '%'
        : '0%',
      popularityScore: video.popularityScore,
      qualityScore: video.qualityScore,
      createdAt: video.createdAt
    };
  }
}

module.exports = new VideoService();