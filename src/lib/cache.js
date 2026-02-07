class MarketSaverCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      lastReset: new Date()
    };
    this.CACHE_KEYS = {
      MARKET_DATA: 'market_data_all',
      TRENDING_COINS: 'trending_coins_all',
      TOP_GAINERS: 'top_gainers_all',
      TOP_COINS: 'top_coins_all',
      TOP_MARKET_COINS: 'top_market_coins_all',
      NEWS: 'news_all',
      EXCHANGES: 'exchanges_all'
    };
    this.TTL = {
      MARKET_DATA: 2 * 60 * 60 * 1000,
      TRENDING_COINS: 8 * 60 * 60 * 1000,
      TOP_GAINERS: 12 * 60 * 60 * 1000,
      TOP_COINS: 4 * 60 * 60 * 1000,
      TOP_MARKET_COINS: 4 * 60 * 60 * 1000,
      NEWS: 6 * 60 * 60 * 1000,
      EXCHANGES: 14 * 24 * 60 * 60 * 1000
    };
  }

  set(key, data, ttl = null) {
    const cacheItem = {
      data: data,
      timestamp: Date.now(),
      ttl: ttl || this.TTL[key] || 3600000,
      expiresAt: Date.now() + (ttl || this.TTL[key] || 3600000)
    };
    this.cache.set(key, cacheItem);
    this.stats.sets++;
    return true;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    this.stats.hits++;
    return item.data;
  }

  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    return size;
  }

  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100) : 0;
    return {
      ...this.stats,
      totalRequests,
      hitRate: hitRate.toFixed(2),
      missRate: (100 - hitRate).toFixed(2),
      cacheSize: this.cache.size,
      uptime: Date.now() - this.stats.lastReset.getTime(),
      lastReset: this.stats.lastReset.toISOString()
    };
  }

  getHealth() {
    try {
      const stats = this.getStats();
      const memoryUsage = process.memoryUsage();
      return {
        status: 'healthy',
        cache: {
          size: stats.cacheSize,
          hitRate: stats.hitRate,
          uptime: stats.uptime
        },
        memory: {
          rss: memoryUsage.rss,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  isFresh(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    return Date.now() <= item.expiresAt;
  }

  getKeys() {
    return Array.from(this.cache.keys());
  }

  getSize() {
    return this.cache.size;
  }

  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      lastReset: new Date()
    };
  }
}

const marketSaverCache = new MarketSaverCache();
module.exports = marketSaverCache;
