// src/utils/apiResponse.js

class ApiResponse {
  /**
   * Respuesta exitosa genérica
   */
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Respuesta de recurso creado
   */
  static created(res, data = null, message = 'Recurso creado exitosamente') {
    return this.success(res, data, message, 201);
  }

  /**
   * Respuesta con paginación
   */
  static successWithPagination(res, data, pagination, message = 'Operación exitosa') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination
    });
  }

  /**
   * Respuesta de error
   */
  static error(res, message = 'Error en la operación', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Error de validación
   */
  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  /**
   * No autorizado
   */
  static unauthorized(res, message = 'No autorizado') {
    return this.error(res, message, 401);
  }

  /**
   * Prohibido
   */
  static forbidden(res, message = 'Acceso prohibido') {
    return this.error(res, message, 403);
  }

  /**
   * No encontrado
   */
  static notFound(res, message = 'Recurso no encontrado') {
    return this.error(res, message, 404);
  }
}

module.exports = ApiResponse;