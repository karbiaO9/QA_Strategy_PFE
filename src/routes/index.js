const express = require('express');
const router = express.Router();
const cacheUpdater = require('../services/cache-updater');

router.get('/', (req, res) => {
  const status = cacheUpdater.getCacheReadinessStatus();
  res.json({
    success: true,
    message: 'MarketSaver Cache-First Server',
    version: '1.0.0',
    status: 'running',
    cache: { ready: status.allReady, populated: status.populatedKeys, total: status.totalKeys },
    endpoints: { health: '/health', cache: '/cache', api: '/api' },
    timestamp: new Date().toISOString()
  });
});

router.use('/health', require('./health'));
router.use('/cache', require('./cache'));
router.use('/api', require('./api'));

module.exports = router;
