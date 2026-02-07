const cron = require('node-cron');
const db = require('../lib/supabase');
const cache = require('../lib/cache');

class CacheUpdaterService {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
  }

  start() {
    if (this.isRunning) return;
    this.scheduleJob('market-data', '0 */2 * * *', () => this.updateMarketDataCache());
    this.scheduleJob('trending-coins', '0 */8 * * *', () => this.updateTrendingCoinsCache());
    this.scheduleJob('top-gainers', '0 */12 * * *', () => this.updateTopGainersCache());
    this.scheduleJob('top-coins', '0 */4 * * *', () => this.updateTopCoinsCache());
    this.scheduleJob('top-market-coins', '0 */4 * * *', () => this.updateTopMarketCoinsCache());
    this.scheduleJob('news', '0 */6 * * *', () => this.updateNewsCache());
    this.scheduleJob('exchanges', '0 2 */2 * 0', () => this.updateExchangesCache());
    this.isRunning = true;
  }

  stop() {
    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();
    this.isRunning = false;
  }

  scheduleJob(name, schedule, task) {
    if (process.env.NODE_ENV === 'development') return;
    const job = cron.schedule(schedule, async () => {
      try {
        await task();
      } catch (error) {
        console.error(`Cache job ${name}:`, error.message);
        await this.retryJob(name, task);
      }
    }, { scheduled: true, timezone: 'UTC' });
    this.jobs.set(name, job);
  }

  async retryJob(name, task) {
    const attempts = this.retryAttempts.get(name) || 0;
    if (attempts >= this.maxRetries) return;
    this.retryAttempts.set(name, attempts + 1);
    try {
      await new Promise((r) => setTimeout(r, 5000 * (attempts + 1)));
      await task();
      this.retryAttempts.delete(name);
    } catch (error) {
      console.error(`Retry failed ${name}:`, error.message);
    }
  }

  async updateMarketDataCache() {
    try {
      const { rows } = await db.selectAll('market_data');
      if (rows?.length) cache.set(cache.CACHE_KEYS.MARKET_DATA, rows);
    } catch (error) {
      console.error('Market data cache:', error.message);
      throw error;
    }
  }

  async updateTrendingCoinsCache() {
    try {
      const { rows } = await db.selectAll('trending_coins');
      if (rows?.length) cache.set(cache.CACHE_KEYS.TRENDING_COINS, rows);
    } catch (error) {
      console.error('Trending coins cache:', error.message);
      throw error;
    }
  }

  async updateTopGainersCache() {
    try {
      const { rows } = await db.selectAll('top_gainers');
      if (rows?.length) cache.set(cache.CACHE_KEYS.TOP_GAINERS, rows);
    } catch (error) {
      console.error('Top gainers cache:', error.message);
      throw error;
    }
  }

  async updateTopCoinsCache() {
    try {
      const { rows } = await db.selectAll('top_coins');
      if (rows?.length) cache.set(cache.CACHE_KEYS.TOP_COINS, rows);
    } catch (error) {
      console.error('Top coins cache:', error.message);
      throw error;
    }
  }

  async updateTopMarketCoinsCache() {
    try {
      const { rows } = await db.selectAll('top_market_coins');
      if (rows?.length) cache.set(cache.CACHE_KEYS.TOP_MARKET_COINS, rows);
    } catch (error) {
      console.error('Top market coins cache:', error.message);
      throw error;
    }
  }

  async updateNewsCache() {
    try {
      const { rows } = await db.selectAll('news');
      if (rows?.length) cache.set(cache.CACHE_KEYS.NEWS, this.serializeBigInts(rows));
    } catch (error) {
      console.error('News cache:', error.message);
      throw error;
    }
  }

  async updateExchangesCache() {
    try {
      const { rows } = await db.selectAll('exchanges');
      if (rows?.length) cache.set(cache.CACHE_KEYS.EXCHANGES, rows);
    } catch (error) {
      console.error('Exchanges cache:', error.message);
      throw error;
    }
  }

  async populateAllCache() {
    const maxRetries = 3;
    let attempt = 1;
    while (attempt <= maxRetries) {
      try {
        await Promise.all([
          this.updateMarketDataCache(),
          this.updateTrendingCoinsCache(),
          this.updateTopGainersCache(),
          this.updateTopCoinsCache(),
          this.updateTopMarketCoinsCache(),
          this.updateNewsCache(),
          this.updateExchangesCache()
        ]);
        const keys = Object.values(cache.CACHE_KEYS);
        const populated = keys.filter((k) => cache.get(k) !== null).length;
        if (populated === keys.length) return true;
        if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 5000));
        attempt++;
      } catch (error) {
        if (attempt >= maxRetries) throw error;
        await new Promise((r) => setTimeout(r, 10000));
        attempt++;
      }
    }
    return false;
  }

  serializeBigInts(obj) {
    if (obj == null) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.serializeBigInts(item));
    if (typeof obj === 'object') {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, this.serializeBigInts(v)]));
    }
    return obj;
  }

  getStatus() {
    return {
      running: this.isRunning,
      activeJobs: this.jobs.size,
      jobNames: Array.from(this.jobs.keys()),
      cacheStats: cache.getStats(),
      retryAttempts: Object.fromEntries(this.retryAttempts),
      timestamp: new Date().toISOString()
    };
  }

  async testConnection() {
    try {
      const result = await db.testConnection();
      return typeof result === 'object' ? result : { ok: !!result };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  isCacheReady() {
    const keys = Object.values(cache.CACHE_KEYS);
    return keys.every((k) => cache.get(k) !== null);
  }

  getCacheReadinessStatus() {
    const keys = Object.values(cache.CACHE_KEYS);
    const details = {};
    keys.forEach((k) => {
      const data = cache.get(k);
      details[k] = { populated: data !== null, count: data?.length ?? 0, ready: data !== null };
    });
    return {
      totalKeys: keys.length,
      populatedKeys: keys.filter((k) => cache.get(k) !== null).length,
      allReady: this.isCacheReady(),
      details
    };
  }

  async shutdown() {
    this.stop();
    await db.close();
  }
}

module.exports = new CacheUpdaterService();
