// src/routes/index.js

const express = require('express');
const router = express.Router();

// Importar rutas individuales
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const restaurantRoutes = require('./restaurant.routes');
const videoRoutes = require('./video.routes');
const feedRoutes = require('./feed.routes');
const dishRoutes = require('./dish.routes');
// Ruta de bienvenida
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a Plateo API v1',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: {
        base: '/api/v1/auth',
        endpoints: [
          'POST /register',
          'POST /login',
          'POST /logout',
          'POST /refresh',
          'GET /me',
          'PUT /change-password'
        ]
      },
      users: {
        base: '/api/v1/users',
        endpoints: [
          'GET /profile',
          'PUT /profile',
          'PUT /preferences',
          'GET /history',
          'GET /likes',
          'GET /favorites',
          'DELETE /account'
        ]
      },
      restaurants: {
        base: '/api/v1/restaurants',
        endpoints: [
          'GET /',
          'GET /nearby',
          'GET /:id',
          'GET /my/profile',
          'PUT /my/profile',
          'GET /my/stats',
          'PUT /my/subscription'
        ]
      },
      videos: {
        base: '/api/v1/videos',
        endpoints: [
          'GET /',
          'POST /',
          'GET /:id',
          'PUT /:id',
          'DELETE /:id',
          'POST /:id/view',
          'POST /:id/like',
          'DELETE /:id/like',
          'POST /:id/favorite',
          'DELETE /:id/favorite',
          'POST /:id/click-order',
          'GET /:id/stats'
        ]
      },
      feed: {
        base: '/api/v1/feed',
        endpoints: [
          'GET /',
          'GET /trending',
          'GET /nearby'
        ]
      },
      dishes: {
        base: '/api/v1/dishes',
        endpoints: [
          'GET /',
          'POST /',
          'GET /:id',
          'PUT /:id',
          'DELETE /:id',
          'PATCH /:id/availability'
        ]
      }
    },
    documentation: 'https://docs.plateo.com',
    support: 'support@plateo.com'
  });
});

// Registrar todas las rutas con su prefijo
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/videos', videoRoutes);
router.use('/feed', feedRoutes);
router.use('/dishes', dishRoutes);

module.exports = router;