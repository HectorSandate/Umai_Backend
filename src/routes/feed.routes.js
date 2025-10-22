// src/routes/feed.routes.js

const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Verificar que feedController tenga los métodos
console.log('feedController:', typeof feedController);
console.log('getPersonalizedFeed:', typeof feedController.getPersonalizedFeed);

// GET /api/v1/feed (feed personalizado)
router.get(
  '/',
  authMiddleware.verifyToken,
  feedController.getPersonalizedFeed
);

// GET /api/v1/feed/trending (videos en tendencia)
router.get(
  '/trending',
  feedController.getTrendingVideos
);

// GET /api/v1/feed/nearby (videos cercanos)
router.get(
  '/nearby',
  authMiddleware.verifyToken,
  feedController.getNearbyVideos
);

module.exports = router;