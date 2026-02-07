const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');
const db = require('../lib/supabase');

const CACHE_TTL = { market_data: 7200, news: 21600, trending_coins: 28800, top_gainers: 43200, top_coins: 14400, top_market_coins: 14400, exchanges: 1209600 };

const setCacheHeaders = (res, ttl = 3600) => {
  res.set('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}`);
};

const streamJson = (res, data, source, total) => {
  setCacheHeaders(res, 1209600);
  res.setHeader('Content-Type', 'application/json');
  const chunkSize = 1000;
  let offset = 0;
  res.write(`{"success":true,"source":"${source}","total":${total},"timestamp":"${new Date().toISOString()}","data":[`);
  const next = () => {
    const chunk = data.slice(offset, offset + chunkSize);
    if (chunk.length) res.write((offset ? ',' : '') + JSON.stringify(chunk));
    offset += chunkSize;
    if (offset >= data.length) { res.write(']}'); res.end(); }
    else setImmediate(next);
  };
  next();
};

const fetch = async (cacheKey, tableName) => {
  const data = cache.get(cacheKey);
  if (data) return { data, source: 'cache' };
  const { rows } = await db.selectAll(tableName);
  if (rows?.length) cache.set(cacheKey, rows);
  return { data: rows || [], source: 'database' };
};

const json = (res, data, source, ttl) => {
  setCacheHeaders(res, ttl);
  res.json({ success: true, data, source, total: data.length, timestamp: new Date().toISOString() });
};

const routes = [
  { path: '/market-data', key: cache.CACHE_KEYS.MARKET_DATA, table: 'market_data', ttl: CACHE_TTL.market_data },
  { path: '/news', key: cache.CACHE_KEYS.NEWS, table: 'news', ttl: CACHE_TTL.news },
  { path: '/trending-coins', key: cache.CACHE_KEYS.TRENDING_COINS, table: 'trending_coins', ttl: CACHE_TTL.trending_coins },
  { path: '/top-gainers', key: cache.CACHE_KEYS.TOP_GAINERS, table: 'top_gainers', ttl: CACHE_TTL.top_gainers },
  { path: '/top-coins', key: cache.CACHE_KEYS.TOP_COINS, table: 'top_coins', ttl: CACHE_TTL.top_coins },
  { path: '/top-market-coins', key: cache.CACHE_KEYS.TOP_MARKET_COINS, table: 'top_market_coins', ttl: CACHE_TTL.top_market_coins }
];

routes.forEach(({ path, key, table, ttl }) => {
  router.get(path, async (req, res) => {
    try {
      const { data, source } = await fetch(key, table);
      json(res, data, source, ttl);
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
});

router.get('/exchanges', async (req, res) => {
  try {
    const { data, source } = await fetch(cache.CACHE_KEYS.EXCHANGES, 'exchanges');
    if (data.length > 1000) return streamJson(res, data, source, data.length);
    json(res, data, source, CACHE_TTL.exchanges);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
