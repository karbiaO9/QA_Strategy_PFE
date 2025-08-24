const express = require('express');
const router = express.Router();
const cacheUpdater = require('../services/cache-updater');
const cache = require('../lib/cache');

// Health check endpoints
router.get('/health', async (req, res) => {
  try {
    const dbConnected = await cacheUpdater.testConnection();
    const cacheHealth = cache.getHealth();
    
    res.json({
      success: true,
      status: 'healthy',
      database: dbConnected ? 'connected' : 'disconnected',
      cache: cacheHealth,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint with API information
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MarketSaver Server - Cache-First API',
    version: '3.0.0',
    description: 'High-performance cryptocurrency data server serving data from cache',
    server: {
      status: 'running',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    },
    api: {
      baseUrl: '/api',
      endpoints: {
        '/market-data': 'Get all market data from cache',
        '/news': 'Get all news from cache',
        '/trending-coins': 'Get all trending coins from cache',
        '/top-gainers': 'Get all top gainers from cache',
        '/top-coins': 'Get all top coins from cache',
        '/top-market-coins': 'Get all top market coins from cache',
        '/exchanges': 'Get all exchanges from cache'
      },
      features: [
        'Cache-first architecture - no database queries',
        'All data served from memory cache',
        'Automatic cache updates via cron jobs',
        'High performance - sub-millisecond response times'
      ]
    },
    cache: {
      status: 'active',
      endpoints: {
        '/cache/stats': 'Get cache statistics and performance metrics',
        '/cache/health': 'Check cache health and status',
        '/cache/clear': 'Clear cache by type or all',
        '/cache/refresh': 'Force refresh cache from database'
      }
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
