const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');
const cacheUpdater = require('../services/cache-updater');

function memoryMb() {
  const u = process.memoryUsage();
  return { rss: Math.round(u.rss / 1024 / 1024), heapUsed: Math.round(u.heapUsed / 1024 / 1024), heapTotal: Math.round(u.heapTotal / 1024 / 1024) };
}

router.get('/', (req, res) => {
  const cacheHealth = cache.getHealth();
  const status = cacheUpdater.getCacheReadinessStatus();
  const health = {
    status: 'healthy',
    server: { uptime: process.uptime(), memory: memoryMb(), pid: process.pid, version: process.version },
    cache: { status: cacheHealth.status, size: status.totalKeys, populated: status.populatedKeys, ready: status.allReady, details: status.details },
    database: { connected: cacheUpdater.isRunning },
    timestamp: new Date().toISOString()
  };
  const code = health.cache.ready && health.database.connected ? 200 : 503;
  res.status(code).json({ success: code === 200, data: health, message: code === 200 ? 'Ready' : 'Cache not fully populated' });
});

router.get('/detailed', (req, res) => {
  const health = {
    status: 'healthy',
    server: { uptime: process.uptime(), memory: { ...memoryMb(), external: Math.round(process.memoryUsage().external / 1024 / 1024) }, pid: process.pid, version: process.version, env: process.env.NODE_ENV || 'development' },
    cache: { stats: cache.getStats(), readiness: cacheUpdater.getCacheReadinessStatus(), health: cache.getHealth() },
    service: { status: cacheUpdater.getStatus(), database: { connected: cacheUpdater.isRunning } },
    timestamp: new Date().toISOString()
  };
  res.json({ success: true, data: health });
});

router.get('/cache-ready', (req, res) => {
  const status = cacheUpdater.getCacheReadinessStatus();
  res.json({ success: true, data: { ready: status.allReady, totalKeys: status.totalKeys, populatedKeys: status.populatedKeys, details: status.details }, message: status.allReady ? 'Ready' : 'Not fully populated' });
});

module.exports = router;
