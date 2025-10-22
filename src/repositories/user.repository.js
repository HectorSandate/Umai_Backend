// src/repositories/user.repository.js

const database = require('../config/database');
const prisma = database.getClient();

class UserRepository {
  
  /**
   * Crear nuevo usuario
   */
  async create(data) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        location: true,
        isVerified: true,
        createdAt: true
      }
    });
  }
  
  /**
   * Buscar usuario por ID
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        location: true,
        preferences: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
  
  /**
   * Buscar usuario por email
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }
  
  /**
   * Buscar usuario por email (incluye password para auth)
   */
  async findByEmailWithPassword(email) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isVerified: true
      }
    });
  }
  
  /**
   * Actualizar usuario
   */
  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        location: true,
        preferences: true,
        isVerified: true,
        updatedAt: true
      }
    });
  }
  
  /**
   * Eliminar usuario
   */
  async delete(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }
  
  /**
   * Actualizar refresh token
   */
  async updateRefreshToken(id, refreshToken) {
    return await prisma.user.update({
      where: { id },
      data: { refreshToken }
    });
  }
  
  /**
   * Verificar usuario
   */
  async verify(id) {
    return await prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedAt: new Date()
      }
    });
  }
  
  /**
   * Actualizar preferencias del usuario
   */
  async updatePreferences(id, preferences) {
    return await prisma.user.update({
      where: { id },
      data: { preferences }
    });
  }
  
  /**
   * Obtener historial de videos vistos por el usuario
   */
  async getViewHistory(userId, limit = 50) {
    return await prisma.videoView.findMany({
      where: { userId },
      include: {
        video: {
          include: {
            restaurant: true,
            dish: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
  
  /**
   * Obtener videos con like del usuario
   */
  async getLikedVideos(userId) {
    return await prisma.like.findMany({
      where: { userId },
      include: {
        video: {
          include: {
            restaurant: true,
            dish: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  /**
   * Obtener favoritos del usuario
   */
  async getFavorites(userId) {
    return await prisma.favorite.findMany({
      where: { userId },
      include: {
        video: {
          include: {
            restaurant: true,
            dish: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new UserRepository();