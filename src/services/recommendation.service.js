// src/services/recommendation.service.js

const videoRepository = require('../repositories/video.repository');
const userRepository = require('../repositories/user.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const logger = require('../utils/logger');

class RecommendationService {
  
  /**
   * Generar feed personalizado para el usuario
   */
  async generateFeed(userId, page = 1, limit = 20) {
    logger.info(`Generando feed para usuario ${userId}, página ${page}, límite ${limit}`);
    
    // Obtener usuario con historial
    const user = await userRepository.findById(userId);
    
    if (!user) {
      // Si no hay usuario, devolver videos populares
      return await this.getTrendingVideos(page, limit);
    }
    
    // Calcular cuántos videos excluir basado en la página
    // Para página 1: excluir últimos 100 vistos
    // Para página 2: excluir últimos 100 + 20 (videos de página 1)
    // Para página 3: excluir últimos 100 + 40 (videos de páginas 1 y 2)
    // etc.
    const videosToExclude = 100 + ((page - 1) * limit);
    
    // Obtener videos candidatos (excluyendo vistos recientemente + videos de páginas anteriores)
    const candidateVideos = await videoRepository.findForRecommendation(userId, limit, videosToExclude);
    
    if (candidateVideos.length === 0) {
      // Si no hay candidatos, devolver trending
      return await this.getTrendingVideos(page, limit);
    }
    
    // Calcular score para cada video
    const scoredVideos = candidateVideos.map(video => ({
      ...video,
      recommendationScore: this.calculateVideoScore(video, user)
    }));
    
    // Ordenar por score
    scoredVideos.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    // Aplicar diversificación para evitar siempre los mismos videos
    // Necesitamos más videos para poder paginar correctamente
    const diversifiedVideos = this.diversifyFeed(scoredVideos, limit * 3);
    
    // Mezclar videos patrocinados
    const finalFeed = this.injectSponsoredVideos(diversifiedVideos, limit * 3);
    
    // Eliminar duplicados por ID antes de paginar
    const uniqueFeed = this.removeDuplicates(finalFeed);
    
    // Aplicar paginación
    const skip = (page - 1) * limit;
    const paginatedFeed = uniqueFeed.slice(skip, skip + limit);
    
    logger.info(`Feed generado: página ${page}, ${paginatedFeed.length} videos de ${uniqueFeed.length} disponibles`);
    
    return paginatedFeed;
  }
  
  /**
   * Calcular score de recomendación de un video para un usuario
   */
  calculateVideoScore(video, user) {
    let score = 0;
    
    // 1. POPULARIDAD GENERAL (30%)
    const popularityScore = this.calculatePopularityScore(video);
    score += popularityScore * 0.3;
    
    // 2. PERSONALIZACIÓN (40%)
    const personalScore = this.calculatePersonalScore(video, user);
    score += personalScore * 0.4;
    
    // 3. CALIDAD DEL VIDEO (20%)
    const qualityScore = this.calculateQualityScore(video);
    score += qualityScore * 0.2;
    
    // 4. PROXIMIDAD GEOGRÁFICA (10%)
    const proximityScore = this.calculateProximityScore(video, user);
    score += proximityScore * 0.1;
    
    // 5. BOOST POR SUSCRIPCIÓN
    if (video.restaurant.subscriptionTier === 'PREMIUM') {
      score *= 1.5; // 50% más de visibilidad
    } else if (video.restaurant.subscriptionTier === 'BASIC') {
      score *= 1.2; // 20% más de visibilidad
    }
    
    // 6. PENALIZACIÓN POR ANTIGÜEDAD
    const daysOld = this.getDaysOld(video.createdAt);
    const freshness = Math.exp(-daysOld / 30); // Decae exponencialmente
    score *= (0.5 + freshness * 0.5); // Mínimo 50% del score
    
    return score;
  }
  
  /**
   * Score de popularidad general
   */
  calculatePopularityScore(video) {
    const views = video.viewsCount || 0;
    const likes = video.likesCount || 0;
    const favorites = video.favoritesCount || 0;
    const clicks = video.clicksToOrder || 0;
    
    // Ponderación: clicks > favoritos > likes > views
    const weightedScore = (
      views * 1 +
      likes * 3 +
      favorites * 5 +
      clicks * 10
    );
    
    // Normalizar con logaritmo para evitar que videos virales dominen
    return Math.log10(weightedScore + 10);
  }
  
  /**
   * Score personalizado basado en preferencias del usuario
   */
  calculatePersonalScore(video, user) {
    let score = 0;
    
    // Obtener preferencias del usuario
    const preferences = user.preferences || {};
    const preferredCategories = preferences.categories || [];
    const preferredTags = preferences.tags || [];
    const maxPrice = preferences.maxPrice || 1000;
    
    // Coincidencia de categoría
    if (preferredCategories.includes(video.category)) {
      score += 50;
    }
    
    // Coincidencia de tags
    const videoTags = video.tags || [];
    const matchingTags = videoTags.filter(tag => preferredTags.includes(tag));
    score += matchingTags.length * 10;
    
    // Rango de precio compatible
    const dishPrice = video.dish?.price || 0;
    if (dishPrice <= maxPrice) {
      score += 20;
    } else {
      score -= 10; // Penalizar si está fuera del rango
    }
    
    return score;
  }
  
  /**
   * Score de calidad (engagement rate)
   */
  calculateQualityScore(video) {
    const views = video.viewsCount || 0;
    
    if (views === 0) {
      return 50; // Dar oportunidad a videos nuevos
    }
    
    const likes = video.likesCount || 0;
    const favorites = video.favoritesCount || 0;
    const clicks = video.clicksToOrder || 0;
    
    const engagementRate = (
      (likes * 2 + favorites * 3 + clicks * 5) / views
    );
    
    return Math.min(engagementRate * 100, 100); // Max 100
  }
  
  /**
   * Score de cercanía geográfica
   */
  calculateProximityScore(video, user) {
    if (!user.location || !video.restaurant.location) {
      return 50; // Neutral si no hay ubicación
    }
    
    const userLat = user.location.lat;
    const userLng = user.location.lng;
    const restaurantLat = video.restaurant.location.lat;
    const restaurantLng = video.restaurant.location.lng;
    
    const distance = this.calculateDistance(
      userLat, userLng,
      restaurantLat, restaurantLng
    );
    
    // Score decrece con la distancia
    // 0km = 100, 5km = 50, 10km+ = 0
    if (distance <= 5) {
      return 100 - (distance * 10);
    } else if (distance <= 10) {
      return 50 - ((distance - 5) * 10);
    } else {
      return 0;
    }
  }
  
  /**
   * Inyectar videos patrocinados en el feed
   */
  injectSponsoredVideos(organicVideos, limit) {
    const now = new Date();
    
    // Separar videos orgánicos de patrocinados para evitar duplicados
    const organicOnly = organicVideos.filter(v => 
      !v.isSponsored || 
      !v.sponsoredUntil || 
      new Date(v.sponsoredUntil) <= now
    );
    
    // Obtener videos patrocinados activos (pueden venir de otra fuente o estar en la lista)
    const sponsoredVideos = organicVideos.filter(v => 
      v.isSponsored && 
      v.sponsoredUntil && 
      new Date(v.sponsoredUntil) > now
    );
    
    if (sponsoredVideos.length === 0) {
      return organicOnly;
    }
    
    // Mezclar: cada 5 videos orgánicos, 1 patrocinado
    const mixed = [];
    let sponsoredIndex = 0;
    const usedSponsoredIds = new Set(); // Para evitar duplicados
    
    for (let i = 0; i < organicOnly.length && mixed.length < limit * 2; i++) {
      // Cada 5 videos, insertar uno patrocinado
      if (i > 0 && i % 5 === 0 && sponsoredIndex < sponsoredVideos.length) {
        const sponsored = sponsoredVideos[sponsoredIndex];
        // Solo agregar si no está ya en la lista
        if (!usedSponsoredIds.has(sponsored.id)) {
          mixed.push({
            ...sponsored,
            isAd: true // Flag para el frontend
          });
          usedSponsoredIds.add(sponsored.id);
          sponsoredIndex++;
        }
      }
      
      mixed.push(organicOnly[i]);
    }
    
    return mixed;
  }
  
  /**
   * Diversificar el feed para evitar siempre los mismos videos
   */
  diversifyFeed(videos, limit) {
    if (videos.length <= limit) {
      return videos;
    }
    
    const diversified = [];
    const usedRestaurantIds = new Map(); // restaurantId -> count
    const usedVideoIds = new Set();
    const maxVideosPerRestaurant = Math.ceil(limit / 3); // Máximo 1/3 del feed del mismo restaurante
    
    // Primero, tomar los mejores videos pero limitando por restaurante
    for (const video of videos) {
      if (diversified.length >= limit) break;
      
      const restaurantId = video.restaurantId;
      const count = usedRestaurantIds.get(restaurantId) || 0;
      
      // Si no hemos excedido el límite por restaurante y el video no está duplicado
      if (count < maxVideosPerRestaurant && !usedVideoIds.has(video.id)) {
        diversified.push(video);
        usedRestaurantIds.set(restaurantId, count + 1);
        usedVideoIds.add(video.id);
      }
    }
    
    // Si aún no tenemos suficientes videos, añadir más sin restricción de restaurante
    if (diversified.length < limit) {
      for (const video of videos) {
        if (diversified.length >= limit) break;
        if (!usedVideoIds.has(video.id)) {
          diversified.push(video);
          usedVideoIds.add(video.id);
        }
      }
    }
    
    // Mezclar aleatoriamente un poco para añadir variedad (manteniendo calidad)
    // Mezclar solo los últimos 30% para no perder los mejores
    const topCount = Math.floor(diversified.length * 0.7);
    const topVideos = diversified.slice(0, topCount);
    const restVideos = diversified.slice(topCount);
    
    // Mezclar aleatoriamente el resto
    for (let i = restVideos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [restVideos[i], restVideos[j]] = [restVideos[j], restVideos[i]];
    }
    
    return [...topVideos, ...restVideos];
  }
  
  /**
   * Eliminar videos duplicados del feed
   */
  removeDuplicates(videos) {
    const seen = new Set();
    const unique = [];
    
    for (const video of videos) {
      if (!seen.has(video.id)) {
        seen.add(video.id);
        unique.push(video);
      }
    }
    
    return unique;
  }
  
  /**
   * Obtener videos en tendencia
   */
  async getTrendingVideos(page = 1, limit = 20) {
    // Para paginación, necesitamos traer más videos desde el inicio
    // y luego aplicar paginación después de diversificar
    const skip = (page - 1) * limit;
    
    // Traer suficientes videos para poder paginar y diversificar
    // Traemos desde el inicio para tener más opciones
    const { videos } = await videoRepository.findAll({
      skip: 0, // Siempre desde el inicio
      take: (skip + limit) * 2, // Traer suficientes para la página actual
      orderBy: { popularityScore: 'desc' }
    });
    
    if (videos.length === 0) {
      return [];
    }
    
    // Aplicar diversificación y eliminar duplicados
    const diversified = this.diversifyFeed(videos, videos.length);
    const unique = this.removeDuplicates(diversified);
    
    // Aplicar paginación después de diversificar
    const paginated = unique.slice(skip, skip + limit);
    
    return paginated;
  }
  
  /**
   * Obtener videos cercanos al usuario
   */
  async getNearbyVideos(userId, radiusKm = 10, limit = 20) {
    const user = await userRepository.findById(userId);
    
    if (!user || !user.location) {
      return [];
    }
    
    // Obtener restaurantes cercanos
    const nearbyRestaurants = await restaurantRepository.findNearby(
      user.location.lat,
      user.location.lng,
      radiusKm
    );
    
    if (nearbyRestaurants.length === 0) {
      return [];
    }
    
    const restaurantIds = nearbyRestaurants.map(r => r.id);
    
    // Obtener videos de restaurantes cercanos
    const videos = [];
    for (const restaurantId of restaurantIds) {
      const restaurantVideos = await videoRepository.findByRestaurant(restaurantId, {
        take: 5
      });
      videos.push(...restaurantVideos);
    }
    
    // Ordenar por popularidad y limitar
    videos.sort((a, b) => b.popularityScore - a.popularityScore);
    
    return videos.slice(0, limit);
  }
  
  /**
   * Helpers
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
  
  getDaysOld(createdAt) {
    const now = new Date();
    const diff = now - new Date(createdAt);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

module.exports = new RecommendationService();
