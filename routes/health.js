const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');
const cacheUpdater = require('../services/cache-updater');

// Health check endpoint
router.get('/', (req, res) => {
  try {
    const cacheHealth = cache.getHealth();
    const cacheStatus = cacheUpdater.getCacheReadinessStatus();
    const memoryUsage = process.memoryUsage();
    
    const health = {
      status: 'healthy',
      server: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) // MB
        },
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      cache: {
        status: cacheHealth.status,
        size: cacheStatus.totalKeys,
        populated: cacheStatus.populatedKeys,
        ready: cacheStatus.allReady,
        details: cacheStatus.details
      },
      database: {
        connected: cacheUpdater.isRunning,
        service: cacheUpdater.getStatus()
      },
      timestamp: new Date().toISOString()
    };
    
    // Set appropriate status code based on health
    const statusCode = health.cache.ready && health.database.connected ? 200 : 503;
    
    res.status(statusCode).json({
      success: statusCode === 200,
      data: health,
      message: statusCode === 200 ? 'Server is healthy and ready' : 'Server is running but cache may not be fully populated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check
router.get('/detailed', (req, res) => {
  try {
    const cacheStats = cache.getStats();
    const cacheHealth = cache.getHealth();
    const cacheStatus = cacheUpdater.getCacheReadinessStatus();
    const serviceStatus = cacheUpdater.getStatus();
    const memoryUsage = process.memoryUsage();
    
    const detailedHealth = {
      status: 'healthy',
      server: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024) // MB
        },
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        env: process.env.NODE_ENV || 'development'
      },
      cache: {
        status: cacheHealth.status,
        stats: cacheStats,
        readiness: cacheStatus,
        health: cacheHealth
      },
      service: {
        status: serviceStatus,
        database: {
          connected: cacheUpdater.isRunning,
          testConnection: async () => {
            try {
              return await cacheUpdater.testConnection();
            } catch (error) {
              return false;
            }
          }
        }
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: detailedHealth,
      message: 'Detailed health information retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Detailed health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Cache readiness check
router.get('/cache-ready', (req, res) => {
  try {
    const cacheStatus = cacheUpdater.getCacheReadinessStatus();
    
    res.json({
      success: true,
      data: {
        ready: cacheStatus.allReady,
        totalKeys: cacheStatus.totalKeys,
        populatedKeys: cacheStatus.populatedKeys,
        details: cacheStatus.details,
        timestamp: new Date().toISOString()
      },
      message: cacheStatus.allReady ? 'Cache is fully populated and ready' : 'Cache is not fully populated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Cache readiness check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
