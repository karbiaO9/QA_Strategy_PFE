// In-Memory Cache System for MarketSaver
// This cache stores all database data and serves API requests

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
    
    // Cache keys for different data types
    this.CACHE_KEYS = {
      MARKET_DATA: 'market_data_all',
      TRENDING_COINS: 'trending_coins_all',
      TOP_GAINERS: 'top_gainers_all',
      TOP_COINS: 'top_coins_all',
      TOP_MARKET_COINS: 'top_market_coins_all',
      NEWS: 'news_all',
      EXCHANGES: 'exchanges_all'
    };
    
    // Cache TTLs (in milliseconds)
    this.TTL = {
      MARKET_DATA: 2 * 60 * 60 * 1000,        // 2 hours
      TRENDING_COINS: 8 * 60 * 60 * 1000,      // 8 hours
      TOP_GAINERS: 12 * 60 * 60 * 1000,        // 12 hours
      TOP_COINS: 4 * 60 * 60 * 1000,           // 4 hours
      TOP_MARKET_COINS: 4 * 60 * 60 * 1000,    // 4 hours
      NEWS: 6 * 60 * 60 * 1000,                // 6 hours
      EXCHANGES: 14 * 24 * 60 * 60 * 1000      // 2 weeks
    };
    
    console.log('🚀 MarketSaver Cache initialized');
  }

  // Set data in cache with TTL
  set(key, data, ttl = null) {
    const cacheItem = {
      data: data,
      timestamp: Date.now(),
      ttl: ttl || this.TTL[key] || 3600000, // Default 1 hour
      expiresAt: Date.now() + (ttl || this.TTL[key] || 3600000)
    };
    
    this.cache.set(key, cacheItem);
    this.stats.sets++;
    
    return true;
  }

  // Get data from cache
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return item.data;
  }

  // Delete from cache
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  // Clear all cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared all cache (${size} items)`);
    return size;
  }

  // Get cache statistics
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

  // Get cache health
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

  // Check if cache is fresh for a key
  isFresh(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    return Date.now() <= item.expiresAt;
  }

  // Get cache keys
  getKeys() {
    return Array.from(this.cache.keys());
  }

  // Get cache size
  getSize() {
    return this.cache.size;
  }

  // Reset statistics
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      lastReset: new Date()
    };
    console.log('📊 Cache statistics reset');
  }
}

// Create singleton instance
const marketSaverCache = new MarketSaverCache();

module.exports = marketSaverCache;
