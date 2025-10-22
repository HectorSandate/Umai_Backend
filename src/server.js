// src/server.js

const app = require('./app');
const { PrismaClient } = require('@prisma/client');
const logger = require('./utils/logger');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
async function startServer() {
  try {
    // 1. Intentar conectar a la base de datos
    await prisma.$connect();
    logger.info('✅ Conexión a PostgreSQL establecida');

    // 2. Iniciar el servidor Express
    const server = app.listen(PORT, () => {
      logger.info(` Servidor corriendo en puerto ${PORT}`);
      logger.info(`📱 Modo: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API: http://localhost:${PORT}/api/v1`);
    });

    // 3. Manejar cierre graceful del servidor
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM recibido. Cerrando servidor...');
      
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();