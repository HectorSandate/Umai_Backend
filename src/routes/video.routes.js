// src/routes/video.routes.js

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const { 
  createVideoValidator, 
  updateVideoValidator,
  getVideoByIdValidator,
  listVideosValidator,
  registerOrderClickValidator
} = require('../validators/video.validator');
const validationMiddleware = require('../middlewares/validation.middleware');
const { uploadLimiter } = require('../middlewares/rateLimit.middleware');

// Rutas públicas
// GET /api/v1/videos
router.get(
  '/',
  listVideosValidator,
  validationMiddleware.handleValidation,
  videoController.getAllVideos
);

// GET /api/v1/videos/:id
router.get(
  '/:id',
  getVideoByIdValidator,
  validationMiddleware.handleValidation,
  videoController.getVideoById
);

// GET /api/v1/videos/restaurant/:restaurantId
router.get(
  '/restaurant/:restaurantId',
  videoController.getByRestaurant
);
  
// PATCH /api/v1/videos/:id/delivery-links (actualizar links de delivery)
router.patch(
  '/:id/delivery-links',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  videoController.updateDeliveryLinks
);

// Rutas protegidas
// POST /api/v1/videos (crear video - solo restaurantes)
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  uploadLimiter,
  uploadMiddleware.single('video'),
  uploadMiddleware.handleMulterError,
  createVideoValidator,
  validationMiddleware.handleValidation,
  videoController.createVideo
);

// GET /api/v1/videos/my/all (mis videos)
router.get(
  '/my/all',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  videoController.getMyVideos
);

// PUT /api/v1/videos/:id (actualizar video)
router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  updateVideoValidator,
  validationMiddleware.handleValidation,
  videoController.updateVideo
);

// DELETE /api/v1/videos/:id (eliminar video)
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  videoController.deleteVideo
);

// POST /api/v1/videos/:id/view (registrar visualización)
router.post(
  '/:id/view',
  authMiddleware.verifyToken,
  videoController.registerView
);

// POST /api/v1/videos/:id/like (dar like)
router.post(
  '/:id/like',
  authMiddleware.verifyToken,
  videoController.likeVideo
);

// DELETE /api/v1/videos/:id/like (quitar like)
router.delete(
  '/:id/like',
  authMiddleware.verifyToken,
  videoController.unlikeVideo
);

// POST /api/v1/videos/:id/favorite (agregar a favoritos)
router.post(
  '/:id/favorite',
  authMiddleware.verifyToken,
  videoController.addToFavorites
);

// DELETE /api/v1/videos/:id/favorite (quitar de favoritos)
router.delete(
  '/:id/favorite',
  authMiddleware.verifyToken,
  videoController.removeFromFavorites
);

// POST /api/v1/videos/:id/click-order (registrar click en delivery)
router.post(
  '/:id/click-order',
  authMiddleware.verifyToken,
  registerOrderClickValidator,
  validationMiddleware.handleValidation,
  videoController.registerOrderClick
);

// GET /api/v1/videos/:id/stats (estadísticas del video)
router.get(
  '/:id/stats',
  authMiddleware.verifyToken,
  authMiddleware.isRestaurant,
  videoController.getVideoStats
);

module.exports = router;
