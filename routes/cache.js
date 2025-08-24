const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');
const cacheUpdater = require('../services/cache-updater');

// Get cache statistics
router.get('/stats', (req, res) => {
  try {
    const stats = cache.getStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats',
      message: error.message
    });
  }
});

// Get cache health
router.get('/health', (req, res) => {
  try {
    const health = cache.getHealth();
    res.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache health',
      message: error.message
    });
  }
});

// Get cache readiness status
router.get('/status', (req, res) => {
  try {
    const status = cacheUpdater.getCacheReadinessStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache status',
      message: error.message
    });
  }
});

// Warm up cache manually (useful for production maintenance)
router.post('/warm', async (req, res) => {
  try {
    console.log('🔥 Manual cache warming requested...');
    
    // Check if cache updater is running
    if (!cacheUpdater.isRunning) {
      return res.status(503).json({
        success: false,
        error: 'Cache updater service not running',
        message: 'Cannot warm cache while service is stopped'
      });
    }
    
    // Start warming process
    const warmed = await cacheUpdater.populateAllCache();
    
    if (warmed) {
      res.json({
        success: true,
        message: 'Cache warmed successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Cache warming failed',
        message: 'Failed to populate all cache data after retries'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to warm cache',
      message: error.message
    });
  }
});

// Refresh specific cache key
router.post('/refresh/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const cacheKeys = Object.values(cache.CACHE_KEYS);
    
    if (!cacheKeys.includes(key)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cache key',
        message: `Valid keys are: ${cacheKeys.join(', ')}`
      });
    }
    
    console.log(`🔄 Manual cache refresh requested for: ${key}`);
    
    // Map key to update function
    const updateFunctions = {
      [cache.CACHE_KEYS.MARKET_DATA]: () => cacheUpdater.updateMarketDataCache(),
      [cache.CACHE_KEYS.TRENDING_COINS]: () => cacheUpdater.updateTrendingCoinsCache(),
      [cache.CACHE_KEYS.TOP_GAINERS]: () => cacheUpdater.updateTopGainersCache(),
      [cache.CACHE_KEYS.TOP_COINS]: () => cacheUpdater.updateTopCoinsCache(),
      [cache.CACHE_KEYS.TOP_MARKET_COINS]: () => cacheUpdater.updateTopMarketCoinsCache(),
      [cache.CACHE_KEYS.NEWS]: () => cacheUpdater.updateNewsCache(),
      [cache.CACHE_KEYS.EXCHANGES]: () => cacheUpdater.updateExchangesCache()
    };
    
    const updateFunction = updateFunctions[key];
    if (updateFunction) {
      await updateFunction();
      
      res.json({
        success: true,
        message: `Cache refreshed for ${key}`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Update function not found',
        message: `No update function available for key: ${key}`
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

// Clear all cache
router.delete('/clear', (req, res) => {
  try {
    const clearedCount = cache.clear();
    res.json({
      success: true,
      message: `Cleared ${clearedCount} cache items`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

// Get service status
router.get('/service', (req, res) => {
  try {
    const status = cacheUpdater.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get service status',
      message: error.message
    });
  }
});

module.exports = router;
