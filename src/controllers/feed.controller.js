// src/controllers/feed.controller.js

const recommendationService = require('../services/recommendation.service');
const ApiResponse = require('../utils/apiResponse');

class FeedController {
  
  async getPersonalizedFeed(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const feed = await recommendationService.generateFeed(userId, page, limit);
      
      return ApiResponse.success(res, feed, 'Feed generado exitosamente');
    } catch (error) {
      next(error);
    }
  }
  
  async getTrendingVideos(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const trending = await recommendationService.getTrendingVideos(page, limit);
      
      return ApiResponse.success(res, trending);
    } catch (error) {
      next(error);
    }
  }
  
  async getNearbyVideos(req, res, next) {
    try {
      const userId = req.user.id;
      const radius = parseFloat(req.query.radius) || 10;
      const limit = parseInt(req.query.limit) || 20;
      
      const nearby = await recommendationService.getNearbyVideos(
        userId,
        radius,
        limit
      );
      
      return ApiResponse.success(res, nearby);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeedController();  // ← IMPORTANTE: esta línea