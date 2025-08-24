const { cacheOperations } = require('../middleware/cache');
const cacheConfig = require('../config/cache-config');

/**
 * Cache-First Service for MarketSaver
 * Implements aggressive caching strategy to minimize database queries
 */
class CacheFirstService {
  constructor() {
    this.config = cacheConfig;
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      databaseQueries: 0,
      cacheWarmups: 0,
      lastReset: new Date()
    };
    
    // Initialize cache warming
    this.initializeCacheWarming();
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  /**
   * Get data with aggressive cache-first strategy
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to fetch data from database
   * @param {Object} options - Options for caching
   * @returns {Promise<Object>} Cached or fresh data
   */
  async getData(key, fetchFunction, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      let data = cacheOperations.get(key);
      
      if (data) {
        this.stats.cacheHits++;
        console.log(`🚀 Cache-First HIT: ${key}`);
        
        return {
          data,
          source: 'cache',
          cacheHit: true,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      this.stats.cacheMisses++;
      console.log(`🚀 Cache-First MISS: ${key}`);

      // If aggressive mode is enabled, try to use expired cache data
      if (this.config.global.aggressiveMode && options.useExpiredCache !== false) {
        const expiredData = this.getExpiredCacheData(key);
        if (expiredData) {
          console.log(`🔄 Using expired cache data: ${key}`);
          
          // Refresh cache in background
          this.refreshCacheInBackground(key, fetchFunction, options);
          
          return {
            data: expiredData,
            source: 'expired_cache',
            cacheHit: true,
            expired: true,
            responseTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Fetch from database
      console.log(`💾 Fetching from database: ${key}`);
      this.stats.databaseQueries++;
      
      data = await fetchFunction();
      
      if (!data) {
        throw new Error(`No data returned for key: ${key}`);
      }

      // Cache the fresh data
      const ttl = this.calculateTTL(key, options);
      cacheOperations.set(key, data, ttl);
      
      console.log(`💾 Cached fresh data: ${key} for ${ttl}s`);

      return {
        data,
        source: 'database',
        cacheHit: false,
        ttl,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Error in cache-first service for key ${key}:`, error);
      
      // Try to return expired cache data as last resort
      const expiredData = this.getExpiredCacheData(key);
      if (expiredData) {
        console.log(`🔄 Using expired cache as fallback: ${key}`);
        return {
          data: expiredData,
          source: 'expired_cache_fallback',
          cacheHit: true,
          expired: true,
          error: error.message,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }

  /**
   * Get data with multiple cache keys (for complex queries)
   * @param {Array} keys - Array of cache keys to try
   * @param {Function} fetchFunction - Function to fetch data from database
   * @param {Object} options - Options for caching
   * @returns {Promise<Object>} Cached or fresh data
   */
  async getDataWithMultipleKeys(keys, fetchFunction, options = {}) {
    // Try each cache key in order
    for (const key of keys) {
      try {
        const result = await this.getData(key, fetchFunction, options);
        if (result.data) {
          return result;
        }
      } catch (error) {
        console.log(`Cache key ${key} failed, trying next...`);
        continue;
      }
    }
    
    // If all cache keys fail, fetch from database
    return this.getData(keys[0], fetchFunction, options);
  }

  /**
   * Get expired cache data if available
   * @param {string} key - Cache key
   * @returns {*} Expired cache data or null
   */
  getExpiredCacheData(key) {
    try {
      // This is a workaround since NodeCache doesn't expose expired data directly
      // In a real implementation, you might want to use a different cache library
      // or implement a custom cache with expired data access
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh cache in background without blocking the response
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - Function to fetch data
   * @param {Object} options - Cache options
   */
  async refreshCacheInBackground(key, fetchFunction, options) {
    setImmediate(async () => {
      try {
        console.log(`🔄 Background cache refresh for: ${key}`);
        const data = await fetchFunction();
        
        if (data) {
          const ttl = this.calculateTTL(key, options);
          cacheOperations.set(key, data, ttl);
          console.log(`🔄 Background cache refresh completed: ${key}`);
        }
      } catch (error) {
        console.error(`🔄 Background cache refresh failed for ${key}:`, error);
      }
    });
  }

  /**
   * Calculate TTL based on data type and strategy
   * @param {string} key - Cache key
   * @param {Object} options - Cache options
   * @returns {number} TTL in seconds
   */
  calculateTTL(key, options = {}) {
    let baseTTL = options.ttl || this.config.global.defaultTTL;
    
    // Apply strategy-based TTL multiplier
    const dataType = this.getDataTypeFromKey(key);
    if (dataType && this.config.dataTypes[dataType]) {
      const config = this.config.dataTypes[dataType];
      const strategy = this.config.strategies[config.strategy];
      baseTTL = Math.min(
        baseTTL * strategy.ttlMultiplier,
        config.maxTTL
      );
    }
    
    return Math.floor(baseTTL);
  }

  /**
   * Determine data type from cache key
   * @param {string} key - Cache key
   * @returns {string|null} Data type or null
   */
  getDataTypeFromKey(key) {
    for (const [type, config] of Object.entries(this.config.dataTypes)) {
      if (config.patterns.some(pattern => key.includes(pattern))) {
        return type;
      }
    }
    return null;
  }

  /**
   * Warm up cache for specific data types
   * @param {string|Array} dataTypes - Data type(s) to warm up
   * @returns {Promise<Object>} Warmup results
   */
  async warmupCache(dataTypes = null) {
    const startTime = Date.now();
    const results = [];
    
    try {
      const typesToWarm = dataTypes || Object.keys(this.config.dataTypes);
      
      for (const type of typesToWarm) {
        if (this.config.dataTypes[type] && this.config.dataTypes[type].warming) {
          try {
            const warmupKeys = this.config.warming.keys[type] || [];
            console.log(`🔥 Warming up cache for ${type}: ${warmupKeys.length} keys`);
            
            for (const key of warmupKeys) {
              try {
                // This would typically fetch data and cache it
                // For now, we'll just log the warmup attempt
                console.log(`🔥 Warming up: ${key}`);
                results.push({ key, type, status: 'warmed' });
              } catch (error) {
                console.error(`🔥 Warmup failed for ${key}:`, error);
                results.push({ key, type, status: 'failed', error: error.message });
              }
            }
            
            this.stats.cacheWarmups++;
            
          } catch (error) {
            console.error(`🔥 Warmup failed for type ${type}:`, error);
            results.push({ type, status: 'failed', error: error.message });
          }
        }
      }
      
      console.log(`🔥 Cache warmup completed in ${Date.now() - startTime}ms`);
      
      return {
        success: true,
        results,
        totalWarmed: results.filter(r => r.status === 'warmed').length,
        totalFailed: results.filter(r => r.status === 'failed').length,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Cache warmup error:', error);
      return {
        success: false,
        error: error.message,
        results,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const totalRequests = this.stats.cacheHits + this.stats.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.stats.cacheHits / totalRequests * 100) : 0;
    
    return {
      ...this.stats,
      totalRequests,
      hitRate: hitRate.toFixed(2),
      missRate: (100 - hitRate).toFixed(2),
      efficiency: this.getEfficiencyRating(hitRate),
      uptime: Date.now() - this.stats.lastReset.getTime(),
      lastReset: this.stats.lastReset.toISOString()
    };
  }

  /**
   * Get efficiency rating based on hit rate
   * @param {number} hitRate - Cache hit rate percentage
   * @returns {string} Efficiency rating
   */
  getEfficiencyRating(hitRate) {
    if (hitRate >= 90) return 'excellent';
    if (hitRate >= 80) return 'very good';
    if (hitRate >= 70) return 'good';
    if (hitRate >= 60) return 'fair';
    if (hitRate >= 50) return 'poor';
    return 'very poor';
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      databaseQueries: 0,
      cacheWarmups: 0,
      lastReset: new Date()
    };
    console.log('📊 Cache statistics reset');
  }

  /**
   * Initialize cache warming
   */
  initializeCacheWarming() {
    if (this.config.global.enableWarming) {
      console.log('🔥 Initializing cache warming...');
      
      // Initial warmup after startup delay
      setTimeout(() => {
        this.warmupCache();
      }, 10000); // 10 seconds after startup
      
      // Periodic warmup
      setInterval(() => {
        this.warmupCache();
      }, this.config.global.warmupInterval);
    }
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    if (this.config.monitoring.enabled) {
      console.log('📊 Starting cache performance monitoring...');
      
      setInterval(() => {
        const stats = this.getStats();
        
        // Log performance metrics
        console.log(`📊 Cache Performance: ${stats.hitRate}% hit rate, ${stats.totalRequests} total requests`);
        
        // Check alert thresholds
        this.checkAlertThresholds(stats);
        
      }, this.config.monitoring.metricsInterval);
    }
  }

  /**
   * Check alert thresholds and log warnings
   * @param {Object} stats - Current statistics
   */
  checkAlertThresholds(stats) {
    const alerts = this.config.monitoring.alerts;
    
    if (stats.hitRate < alerts.lowHitRate) {
      console.warn(`⚠️ Low cache hit rate: ${stats.hitRate}% (threshold: ${alerts.lowHitRate}%)`);
    }
    
    // Add more threshold checks as needed
  }

  /**
   * Health check for the service
   * @returns {Object} Health status
   */
  async healthCheck() {
    try {
      const stats = this.getStats();
      const cacheHealth = cacheOperations.getStats();
      
      return {
        status: 'healthy',
        service: {
          uptime: stats.uptime,
          hitRate: stats.hitRate,
          efficiency: stats.efficiency
        },
        cache: {
          keys: cacheHealth.keys,
          hits: cacheHealth.hits,
          misses: cacheHealth.misses
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
}

// Create singleton instance
const cacheFirstService = new CacheFirstService();

module.exports = cacheFirstService;
