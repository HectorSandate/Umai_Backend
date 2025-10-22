// src/services/auth.service.js

const userRepository = require('../repositories/user.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const { hashPassword, comparePassword } = require('../utils/crypto');
const { generateTokenPair } = require('../config/jwt');
const { 
  ConflictError, 
  UnauthorizedError, 
  NotFoundError,
  ValidationError 
} = require('../utils/apiError');

class AuthService {
  
  /**
   * Registrar nuevo usuario
   */
  async register(data) {
    const { email, password, name, phone, role } = data;
    
    // Verificar que el email no exista
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }
    
    // Hashear contraseña
    const hashedPassword = await hashPassword(password);
    
    // Crear usuario
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role
    });
    
    // Si es restaurante, crear perfil de restaurante
    if (role === 'RESTAURANT') {
      await restaurantRepository.create({
        userId: user.id,
        name: data.restaurantName || name,
        address: data.address || '',
        phone: phone || '',
        subscriptionTier: 'FREE',
        maxVideosPerMonth: 10
      });
    }
    
    // Generar tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);
    
    // Guardar refresh token
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);
    
    return {
      user,
      tokens
    };
  }
  
  /**
   * Login
   */
  async login(email, password) {
    // Buscar usuario con password
    const user = await userRepository.findByEmailWithPassword(email);
    
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }
    
    // Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }
    
    // Generar tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);
    
    // Guardar refresh token
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);
    
    // Remover password del objeto user
    delete user.password;
    
    return {
      user,
      tokens
    };
  }
  
  /**
   * Logout
   */
  async logout(userId) {
    // Eliminar refresh token
    await userRepository.updateRefreshToken(userId, null);
    
    return { message: 'Sesión cerrada exitosamente' };
  }
  
  /**
   * Refrescar token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token no proporcionado');
    }
    
    // Verificar token
    const { verifyToken } = require('../config/jwt');
    const decoded = verifyToken(refreshToken);
    
    // Buscar usuario
    const user = await userRepository.findById(decoded.userId);
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    // Generar nuevos tokens
    const tokens = generateTokenPair(user.id, user.email, user.role);
    
    // Guardar nuevo refresh token
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);
    
    return {
      user,
      tokens
    };
  }
  
  /**
   * Obtener usuario actual
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    // Si es restaurante, incluir datos del restaurante
    if (user.role === 'RESTAURANT') {
      const restaurant = await restaurantRepository.findByUserId(userId);
      return {
        ...user,
        restaurant
      };
    }
    
    return user;
  }
  
  /**
   * Cambiar contraseña
   */
  async changePassword(userId, oldPassword, newPassword) {
    // Buscar usuario con password
    const user = await userRepository.findByEmailWithPassword(
      (await userRepository.findById(userId)).email
    );
    
    // Verificar contraseña actual
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }
    
    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword);
    
    // Actualizar contraseña
    await userRepository.update(userId, {
      password: hashedPassword
    });
    
    return { message: 'Contraseña actualizada exitosamente' };
  }
}

module.exports = new AuthService();