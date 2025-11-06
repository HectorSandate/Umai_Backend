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
    // ⚠️ IMPORTANTE: '0.0.0.0' permite conexiones desde cualquier dispositivo en la red
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📱 Modo: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API Local: http://localhost:${PORT}/api/v1`);
      logger.info(`🌐 API Red: http://0.0.0.0:${PORT}/api/v1`);
      
      // Mostrar la IP local para facilitar desarrollo móvil
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      const addresses = [];
      
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(iface.address);
          }
        }
      }
      
      if (addresses.length > 0) {
        logger.info(`📱 Para app móvil usa: http://${addresses[0]}:${PORT}/api/v1`);
      }
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