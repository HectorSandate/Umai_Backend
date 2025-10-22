// src/config/database.js

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

/**
 * Instancia singleton de Prisma Client
 */
class Database {
  constructor() {
    if (!Database.instance) {
      this.prisma = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' }
        ]
      });

      // Logging de queries en desarrollo
      if (process.env.NODE_ENV === 'development') {
        this.prisma.$on('query', (e) => {
          logger.debug(`Query: ${e.query}`);
          logger.debug(`Duration: ${e.duration}ms`);
        });
      }

      Database.instance = this;
    }

    return Database.instance;
  }

  /**
   * Conectar a la base de datos
   */
  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('Conexión a PostgreSQL establecida');
    } catch (error) {
      logger.error('Error al conectar a PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Desconectar de la base de datos
   */
  async disconnect() {
    try {
      await this.prisma.$disconnect();
      logger.info('Desconectado de PostgreSQL');
    } catch (error) {
      logger.error('Error al desconectar de PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Verificar salud de la conexión
   */
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Obtener instancia de Prisma
   */
  getClient() {
    return this.prisma;
  }
}

// Exportar instancia única
const database = new Database();
module.exports = database;