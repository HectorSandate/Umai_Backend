// src/utils/apiError.js

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Conflicto') {
    super(message, 409);
  }
}

class ValidationError extends ApiError {
  constructor(message = 'Error de validación') {
    super(message, 422);
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500);
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError
};