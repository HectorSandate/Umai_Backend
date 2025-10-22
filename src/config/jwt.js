// src/config/jwt.js

const jwt = require('jsonwebtoken');
const config = require('./env');
const { UnauthorizedError } = require('../utils/apiError');

/**
 * Generar token de acceso
 */
function generateAccessToken(payload) {
  return jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * Generar token de refresco
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

/**
 * Verificar token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Token inválido');
    }
    throw error;
  }
}

/**
 * Decodificar token sin verificar (útil para refresh tokens)
 */
function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Generar par de tokens (access + refresh)
 */
function generateTokenPair(userId, email, role) {
  const payload = {
    userId,
    email,
    role
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  generateTokenPair
};