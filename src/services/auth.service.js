// src/services/auth.service.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const { UnauthorizedError, ValidationError, ConflictError, NotFoundError } = require('../utils/apiError');
const logger = require('../utils/logger');

class AuthService {
  
  /**
   * ========== REGISTRO (CUSTOMER, RESTAURANT o DELIVERY) ==========
   */
  async register(data) {
    const { email, password, name, phone, role, restaurantData } = data;
    
    // 1. Verificar que el email no exista
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('El correo electrónico ya está registrado');
    }
    
    // 2. Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Crear usuario (sin isActive)
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: role
      // ❌ ELIMINADO: isActive: true
    });
    
    logger.info(`✅ Usuario creado: ${user.id} - ${user.email} - Rol: ${user.role}`);
    
    // 4. Si el rol es RESTAURANT, crear el registro en tabla Restaurant
    let restaurant = null;
    if (role === 'RESTAURANT') {
      if (!restaurantData) {
        // Si no vienen datos del restaurante, eliminar usuario y lanzar error
        await userRepository.delete(user.id);
        throw new ValidationError('Datos del restaurante requeridos para registro de restaurante');
      }
      
      try {
        restaurant = await restaurantRepository.create({
          userId: user.id,
          name: restaurantData.name,
          description: restaurantData.description || `Restaurante ${restaurantData.name}`,
          address: restaurantData.address || 'Por definir',
          phone: restaurantData.phoneNumber || phone,
          isActive: true,
          isVerified: false,
          subscriptionTier: 'FREE',
          maxVideosPerMonth: 10,
          canSponsorVideos: false,
          videosUploadedThisMonth: 0,
          totalVideos: 0
        });
        
        logger.info(`✅ Restaurante creado: ${restaurant.id} - ${restaurant.name}`);
      } catch (error) {
        logger.error('❌ Error al crear restaurante:', error);
        // Si falla la creación del restaurante, eliminar el usuario (rollback manual)
        await userRepository.delete(user.id);
        throw new ValidationError('Error al crear el restaurante. Intenta nuevamente.');
      }
    }
    
    // 5. Generar tokens
    const tokens = this.generateTokens(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      restaurant: restaurant ? {
        id: restaurant.id,
        name: restaurant.name,
        subscriptionTier: restaurant.subscriptionTier,
        maxVideosPerMonth: restaurant.maxVideosPerMonth
      } : null,
      tokens
    };
  }
  
  /**
   * ========== LOGIN ==========
   */
  async login(email, password) {
    // 1. Buscar usuario por email
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }
    
    // 2. Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciales inválidas');
    }
    
    // ❌ ELIMINADO: Verificación de isActive
    // if (!user.isActive) {
    //   throw new UnauthorizedError('Usuario desactivado');
    // }
    
    // 3. Si es restaurante, obtener datos del restaurante
    let restaurant = null;
    if (user.role === 'RESTAURANT') {
      restaurant = await restaurantRepository.findByUserId(user.id);
      
      if (!restaurant) {
        logger.warn(`⚠️ Usuario ${user.id} tiene rol RESTAURANT pero no tiene restaurante en BD`);
      }
    }
    
    // 4. Generar tokens
    const tokens = this.generateTokens(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      restaurant: restaurant ? {
        id: restaurant.id,
        name: restaurant.name,
        subscriptionTier: restaurant.subscriptionTier,
        maxVideosPerMonth: restaurant.maxVideosPerMonth
      } : null,
      tokens
    };
  }
  
  /**
   * ========== LOGOUT ==========
   */
  async logout(userId) {
    logger.info(`Usuario ${userId} cerró sesión`);
    return { message: 'Sesión cerrada exitosamente' };
  }
  
  /**
   * ========== OBTENER USUARIO ACTUAL ==========
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    // Si es restaurante, incluir datos del restaurante
    let restaurant = null;
    if (user.role === 'RESTAURANT') {
      restaurant = await restaurantRepository.findByUserId(user.id);
    }
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        // ❌ ELIMINADO: isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      restaurant: restaurant ? {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phoneNumber: restaurant.phoneNumber,
        subscriptionTier: restaurant.subscriptionTier,
        maxVideosPerMonth: restaurant.maxVideosPerMonth,
        videosUploadedThisMonth: restaurant.videosUploadedThisMonth,
        totalVideos: restaurant.totalVideos
      } : null
    };
  }
  
  /**
   * ========== CAMBIAR CONTRASEÑA ==========
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValidPassword) {
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }
    
    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña
    await userRepository.update(userId, { password: hashedPassword });
    
    logger.info(`Usuario ${userId} cambió su contraseña`);
    
    return { message: 'Contraseña actualizada exitosamente' };
  }
  
  /**
   * ========== GENERAR TOKENS JWT ==========
   */
  generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  /**
   * ========== VERIFICAR TOKEN ==========
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }
  
  /**
   * ========== REFRESH TOKEN ==========
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
      
      const user = await userRepository.findById(decoded.id);
      
      if (!user) {
        throw new UnauthorizedError('Usuario no válido');
      }
      
      // ❌ ELIMINADO: Verificación de isActive
      // if (!user.isActive) {
      //   throw new UnauthorizedError('Usuario no válido');
      // }
      
      const tokens = this.generateTokens(user);
      
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Refresh token inválido');
    }
  }
}

module.exports = new AuthService();