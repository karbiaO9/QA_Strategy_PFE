const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');
const cacheUpdater = require('../services/cache-updater');

const send = (res, data) => res.json({ success: true, data, timestamp: new Date().toISOString() });
const sendErr = (res, code, msg) => res.status(code).json({ success: false, error: msg });

router.get('/stats', (req, res) => send(res, cache.getStats()));
router.get('/health', (req, res) => send(res, cache.getHealth()));
router.get('/status', (req, res) => send(res, cacheUpdater.getCacheReadinessStatus()));

router.post('/warm', async (req, res) => {
  if (!cacheUpdater.isRunning) return sendErr(res, 503, 'Cache updater not running');
  const ok = await cacheUpdater.populateAllCache();
  res.status(ok ? 200 : 500).json({ success: ok, message: ok ? 'Cache warmed' : 'Cache warm failed', timestamp: new Date().toISOString() });
});

router.post('/refresh/:key', async (req, res) => {
  const { key } = req.params;
  const keys = Object.values(cache.CACHE_KEYS);
  if (!keys.includes(key)) return sendErr(res, 400, `Valid keys: ${keys.join(', ')}`);
  const fns = {
    [cache.CACHE_KEYS.MARKET_DATA]: () => cacheUpdater.updateMarketDataCache(),
    [cache.CACHE_KEYS.TRENDING_COINS]: () => cacheUpdater.updateTrendingCoinsCache(),
    [cache.CACHE_KEYS.TOP_GAINERS]: () => cacheUpdater.updateTopGainersCache(),
    [cache.CACHE_KEYS.TOP_COINS]: () => cacheUpdater.updateTopCoinsCache(),
    [cache.CACHE_KEYS.TOP_MARKET_COINS]: () => cacheUpdater.updateTopMarketCoinsCache(),
    [cache.CACHE_KEYS.NEWS]: () => cacheUpdater.updateNewsCache(),
    [cache.CACHE_KEYS.EXCHANGES]: () => cacheUpdater.updateExchangesCache()
  };
  try {
    await (fns[key] || (() => Promise.reject(new Error('Unknown key'))))();
    send(res, { message: `Refreshed ${key}` });
  } catch (e) {
    sendErr(res, 500, e.message);
  }
});

router.delete('/clear', (req, res) => send(res, { cleared: cache.clear(), message: 'Cache cleared' }));
router.get('/service', (req, res) => send(res, cacheUpdater.getStatus()));

module.exports = router;
