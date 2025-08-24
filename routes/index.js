const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');
const cacheUpdater = require('../services/cache-updater');

// Import route modules
const healthRoutes = require('./health');
const cacheRoutes = require('./cache');
const apiRoutes = require('./api');

// Root route - server information
router.get('/', (req, res) => {
  try {
    const cacheStatus = cacheUpdater.getCacheReadinessStatus();
    
    res.json({
      success: true,
      message: 'MarketSaver Cache-First Server',
      version: '1.0.0',
      status: 'running',
      cache: {
        ready: cacheStatus.allReady,
        populated: cacheStatus.populatedKeys,
        total: cacheStatus.totalKeys
      },
      endpoints: {
        health: '/health',
        cache: '/cache',
        api: '/api'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get server info',
      message: error.message
    });
  }
});

// Mount routes
router.use('/health', healthRoutes);
router.use('/cache', cacheRoutes);
router.use('/api', apiRoutes);

module.exports = router;
