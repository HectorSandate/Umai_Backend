// src/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/apiError');
const userRepository = require('../repositories/user.repository');

class AuthMiddleware {
  
  /**
   * Verificar que el usuario tiene un token válido
   */
  async verifyToken(req, res, next) {
    try {
      // 1. Obtener token del header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token no proporcionado');
      }
      
      const token = authHeader.split(' ')[1];
      
      // 2. Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Verificar que el usuario aún existe
      // ⚠️ CORRECCIÓN: decoded.id (no decoded.userId)
      const user = await userRepository.findById(decoded.id);
      
      if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
      }
      
      if (!user.isActive) {
        throw new UnauthorizedError('Usuario desactivado');
      }
      
      // 4. Agregar usuario a la request para que lo usen los controllers
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      };
      
      next();
      
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        next(new UnauthorizedError('Token inválido'));
      } else if (error.name === 'TokenExpiredError') {
        next(new UnauthorizedError('Token expirado'));
      } else {
        next(error);
      }
    }
  }
  
  /**
   * Verificar que el usuario sea un restaurante
   */
  isRestaurant(req, res, next) {
    if (req.user.role !== 'RESTAURANT') {
      return next(new ForbiddenError('Solo restaurantes pueden realizar esta acción'));
    }
    next();
  }
  
  /**
   * Verificar que el usuario sea un cliente
   */
  isCustomer(req, res, next) {
    if (req.user.role !== 'CUSTOMER') {
      return next(new ForbiddenError('Solo clientes pueden realizar esta acción'));
    }
    next();
  }
  
  /**
   * Verificar que el usuario sea un repartidor
   */
  isDelivery(req, res, next) {
    if (req.user.role !== 'DELIVERY') {
      return next(new ForbiddenError('Solo repartidores pueden realizar esta acción'));
    }
    next();
  }
  
  /**
   * Verificar que el usuario sea cliente O restaurante (para acciones comunes)
   */
  isCustomerOrRestaurant(req, res, next) {
    if (!['CUSTOMER', 'RESTAURANT'].includes(req.user.role)) {
      return next(new ForbiddenError('Acción no permitida para tu tipo de cuenta'));
    }
    next();
  }
}

module.exports = new AuthMiddleware();