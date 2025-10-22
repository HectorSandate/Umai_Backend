// src/services/user.service.js

const userRepository = require('../repositories/user.repository');
const { NotFoundError, ValidationError } = require('../utils/apiError');

class UserService {
  
  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    return user;
  }
  
  /**
   * Actualizar perfil
   */
  async updateProfile(userId, data) {
    const { name, phone, avatarUrl, location } = data;
    
    const updatedUser = await userRepository.update(userId, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(avatarUrl && { avatarUrl }),
      ...(location && { location })
    });
    
    return updatedUser;
  }
  
  /**
   * Actualizar preferencias (para algoritmo de recomendación)
   */
  async updatePreferences(userId, preferences) {
    const { categories, tags, maxPrice } = preferences;
    
    const updatedUser = await userRepository.updatePreferences(userId, {
      categories: categories || [],
      tags: tags || [],
      maxPrice: maxPrice || 1000
    });
    
    return updatedUser;
  }
  
  /**
   * Obtener historial de videos vistos
   */
  async getViewHistory(userId, limit = 50) {
    const history = await userRepository.getViewHistory(userId, limit);
    
    return history.map(item => ({
      ...item.video,
      watchTime: item.watchTime,
      completed: item.completed,
      viewedAt: item.createdAt
    }));
  }
  
  /**
   * Obtener videos con like
   */
  async getLikedVideos(userId) {
    const likes = await userRepository.getLikedVideos(userId);
    
    return likes.map(item => ({
      ...item.video,
      likedAt: item.createdAt
    }));
  }
  
  /**
   * Obtener favoritos
   */
  async getFavorites(userId) {
    const favorites = await userRepository.getFavorites(userId);
    
    return favorites.map(item => ({
      ...item.video,
      favoritedAt: item.createdAt
    }));
  }
  
  /**
   * Eliminar cuenta
   */
  async deleteAccount(userId) {
    await userRepository.delete(userId);
    
    return { message: 'Cuenta eliminada exitosamente' };
  }
}

module.exports = new UserService();