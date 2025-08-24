const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');
const cacheUpdater = require('../services/cache-updater');

// Cache management endpoints
router.get('/stats', (req, res) => {
  try {
    const stats = cache.getStats();
    
    // Calculate cache size in MB
    const cacheSizeInMB = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2);
    
    res.json({
      success: true,
      cache: {
        status: 'active',
        ...stats,
        cacheSize: parseFloat(cacheSizeInMB),
        cacheSizeUnit: 'MB',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats',
      message: error.message
    });
  }
});

router.get('/health', (req, res) => {
  try {
    const health = cache.getHealth();
    res.json({
      success: true,
      cache: {
        status: 'healthy',
        ...health,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache health',
      message: error.message
    });
  }
});

router.post('/clear', (req, res) => {
  try {
    const { type } = req.body;
    
    if (type === 'all') {
      const clearedCount = cache.clear();
      res.json({
        success: true,
        message: 'All cache cleared successfully',
        cleared: clearedCount,
        timestamp: new Date().toISOString()
      });
    } else if (type && cache.CACHE_KEYS[type.toUpperCase()]) {
      const key = cache.CACHE_KEYS[type.toUpperCase()];
      cache.delete(key);
      res.json({
        success: true,
        message: `${type} cache cleared successfully`,
        cleared: 1,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid cache type',
        message: 'Please provide a valid cache type or "all"'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

// Force cache refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { type } = req.body;
    
    if (type === 'all') {
      await cacheUpdater.populateAllCache();
      res.json({
        success: true,
        message: 'All cache refreshed successfully',
        timestamp: new Date().toISOString()
      });
    } else if (type === 'market-data') {
      await cacheUpdater.updateMarketDataCache();
      res.json({
        success: true,
        message: 'Market data cache refreshed',
        timestamp: new Date().toISOString()
      });
    } else if (type === 'news') {
      await cacheUpdater.updateNewsCache();
      res.json({
        success: true,
        message: 'News cache refreshed',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid cache type',
        message: 'Please provide a valid cache type or "all"'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh cache',
      message: error.message
    });
  }
});

module.exports = router;
