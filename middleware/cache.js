const NodeCache = require('node-cache');

// Initialize cache with configuration from environment variables
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 14400, // 4 hours default (was 300 = 5 minutes)
  checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD_SECONDS) || 3600, // 1 hour default (was 600 = 10 minutes)
  maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 10000, // Increased from 1000 to 10000
  useClones: false, // Better performance
  deleteOnExpire: false // Don't delete expired keys immediately - keep them for fallback
});

// MarketSaver-specific cache patterns for smart invalidation
const CACHE_PATTERNS = {
  MARKET_DATA: ['market_data', 'sentiment'],
  TOP_MARKET_COINS: ['top_market_coins'],
  NEWS: ['news'],
  TRENDING_COINS: ['trending_coins'],
  TOP_GAINERS: ['top_gainers'],
  TOP_COINS: ['top_coins'],
  EXCHANGES: ['exchanges'],
  ALL: ['cache:'] // All cached data
};

// Fastify plugin for cache functionality
async function cachePlugin(fastify, options) {
  // Decorate fastify with cache operations
  fastify.decorate('cacheOperations', {
    get: (key) => cache.get(key),
    set: (key, value, ttl) => cache.set(key, value, ttl),
    del: (key) => cache.del(key),
    getTtl: (key) => cache.getTtl(key),
    getStats: () => cache.getStats(),
    flush: () => cache.flushAll(),
    warmup: (keys) => {
      console.log('🔥 Starting cache warmup...');
      keys.forEach(key => {
        console.log(`🔥 Warming up cache for: ${key}`);
      });
    }
  });

  // Cache middleware as Fastify hook
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip cache for non-GET requests
    if (request.method !== 'GET') {
      return;
    }

    // Create cache key from URL and query parameters
    const cacheKey = `cache:${request.url}`;
    
    // Try to get cached response
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`💾 Cache HIT: ${cacheKey}`);
      
      // Add cache headers for client-side caching
      reply.header('X-Cache', 'HIT');
      reply.header('X-Cache-Key', cacheKey);
      reply.header('Cache-Control', `public, max-age=${options.defaultTTL || 300}`);
      reply.header('ETag', `"${cacheKey}-${Date.now()}"`);
      
      // Send cached response and end request
      reply.send({
        ...cachedResponse,
        _cache: {
          hit: true,
          key: cacheKey,
          ttl: cache.getTtl(cacheKey),
          source: 'cache'
        }
      });
      
      // Return to stop further processing
      return reply;
    }

    console.log(`💾 Cache MISS: ${cacheKey}`);
    
    // Store cache key in request for later use
    request.cacheKey = cacheKey;
    request.cacheTTL = options.defaultTTL || 300;
  });

  // Hook to cache responses
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (request.cacheKey && payload) {
      try {
        const data = JSON.parse(payload);
        
        // Cache the response
        cache.set(request.cacheKey, data, request.cacheTTL);
        console.log(`💾 Cached: ${request.cacheKey} for ${request.cacheTTL}s`);
        console.log(`💾 Cache data size: ${JSON.stringify(data).length} bytes`);
        
        // Add cache headers
        reply.header('X-Cache', 'MISS');
        reply.header('X-Cache-Key', request.cacheKey);
        reply.header('Cache-Control', `public, max-age=${request.cacheTTL}`);
        reply.header('ETag', `"${request.cacheKey}-${Date.now()}"`);
        
      } catch (error) {
        console.error(`❌ Failed to cache response for ${request.cacheKey}:`, error.message);
      }
    }
  });
}

// Aggressive cache-first middleware as Fastify hook
function aggressiveCacheHook(duration = 300, fallbackToDb = true) {
  return async (request, reply) => {
    // Skip cache for non-GET requests
    if (request.method !== 'GET') {
      return;
    }

    // Create cache key from URL and query parameters
    const cacheKey = `cache:${request.url}`;
    
    // Try to get cached response
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`🚀 Aggressive Cache HIT: ${cacheKey}`);
      
      // Add cache headers
      reply.header('X-Cache', 'HIT');
      reply.header('X-Cache-Key', cacheKey);
      reply.header('Cache-Control', `public, max-age=${duration}`);
      reply.header('ETag', `"${cacheKey}-${Date.now()}"`);
      
      // Send cached response and end request
      reply.send({
        ...cachedResponse,
        _cache: {
          hit: true,
          key: cacheKey,
          ttl: cache.getTtl(cacheKey),
          source: 'cache',
          strategy: 'aggressive'
        }
      });
      
      // Return to stop further processing
      return reply;
    }

    console.log(`🚀 Aggressive Cache MISS: ${cacheKey}`);

    // If fallback to DB is disabled, return cached data even if expired
    if (!fallbackToDb) {
      const expiredData = cache.get(cacheKey);
      if (expiredData) {
        console.log(`🔄 Using expired cache data: ${cacheKey}`);
        reply.send({
          ...expiredData,
          _cache: {
            hit: true,
            key: cacheKey,
            expired: true,
            source: 'expired_cache',
            strategy: 'aggressive_no_fallback'
          }
        });
        return reply;
      }
    }

    // Store cache key in request for later use
    request.cacheKey = cacheKey;
    request.cacheTTL = duration;
    request.cacheStrategy = 'aggressive';
  };
}

// Ultra-aggressive cache-first middleware that prevents database calls
function ultraAggressiveCacheHook(duration = 14400, fallbackToDb = false) { // 4 hours default (was 300 = 5 minutes)
  return async (request, reply) => {
    // Skip cache for non-GET requests
    if (request.method !== 'GET') {
      return;
    }

    // Create cache key from URL and query parameters
    const cacheKey = `cache:${request.url}`;
    
    // Try to get cached response
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`🚀 ULTRA Cache HIT: ${cacheKey} (TTL: ${duration}s = ${Math.round(duration/3600)}h)`);
      console.log(`💾 Cache data size: ${JSON.stringify(cachedResponse).length} bytes`);
      
      // Add cache headers
      reply.header('X-Cache', 'HIT');
      reply.header('X-Cache-Key', cacheKey);
      reply.header('X-Cache-Strategy', 'ultra-aggressive-4h');
      reply.header('Cache-Control', `public, max-age=${duration}`);
      reply.header('ETag', `"${cacheKey}-${Date.now()}"`);
      
      // Send cached response and end request - NO DATABASE CALL
      reply.send({
        ...cachedResponse,
        _cache: {
          hit: true,
          key: cacheKey,
          ttl: cache.getTtl(cacheKey),
          source: 'cache',
          strategy: 'ultra_aggressive_4h',
          lifetime: `${Math.round(duration/3600)} hours`,
          message: '🚀 Served from cache - NO database call!'
        }
      });
      
      // Return to stop further processing - THIS IS THE KEY
      return reply;
    }

    console.log(`🚀 ULTRA Cache MISS: ${cacheKey} (TTL: ${duration}s = ${Math.round(duration/3600)}h)`);
    console.log(`⚠️ This will trigger a database call to populate cache`);

    // If fallback to DB is disabled, return cached data even if expired
    if (!fallbackToDb) {
      const expiredData = cache.get(cacheKey);
      if (expiredData) {
        console.log(`🔄 Using expired cache data: ${cacheKey} (NO database call)`);
        reply.send({
          ...expiredData,
          _cache: {
            hit: true,
            key: cacheKey,
            expired: true,
            source: 'expired_cache',
            strategy: 'ultra_aggressive_4h_no_fallback',
            lifetime: `${Math.round(duration/3600)} hours`,
            message: '🔄 Served from expired cache - NO database call!'
          }
        });
        return reply;
      }
    }

    // Store cache key in request for later use
    request.cacheKey = cacheKey;
    request.cacheTTL = duration;
    request.cacheStrategy = 'ultra_aggressive_4h';
    
    console.log(`📝 Cache key stored: ${cacheKey} - Will cache response for ${Math.round(duration/3600)} hours`);
  };
}

// Cache warming middleware for frequently accessed data
const cacheWarmingMiddleware = (warmupKeys = [], warmupInterval = 300000) => { // 5 minutes default
  let warmupTimer = null;
  
  const warmupCache = async () => {
    console.log('🔥 Starting cache warmup...');
    
    for (const key of warmupKeys) {
      try {
        // This would typically fetch data from database and cache it
        // For now, we'll just log the warmup attempt
        console.log(`🔥 Warming up cache for: ${key}`);
        
        // You can implement actual data fetching here
        // const data = await fetchDataForKey(key);
        // cache.set(key, data, 300);
        
      } catch (error) {
        console.error(`🔥 Cache warmup failed for ${key}:`, error);
      }
    }
  };

  // Start warmup timer
  const startWarmup = () => {
    if (warmupTimer) {
      clearInterval(warmupTimer);
    }
    
    warmupTimer = setInterval(warmupCache, warmupInterval);
    
    // Initial warmup
    warmupCache();
    
    console.log(`🔥 Cache warmup scheduled every ${warmupInterval / 1000} seconds`);
  };

  // Stop warmup timer
  const stopWarmup = () => {
    if (warmupTimer) {
      clearInterval(warmupTimer);
      warmupTimer = null;
      console.log('🔥 Cache warmup stopped');
    }
  };

  return {
    start: startWarmup,
    stop: stopWarmup,
    warmup: warmupCache
  };
};

// Cache warming with actual data fetching
const warmupCacheWithData = async (prismaClient) => {
  console.log('🔥 Starting cache warmup with actual data...');
  
  try {
    // Warm up news cache
    const newsData = await prismaClient.news.findMany({
      take: 50,
      orderBy: { publishedOn: 'desc' },
      select: {
        id: true,
        title: true,
        body: true,
        url: true,
        imageUrl: true,
        source: true,
        categories: true,
        publishedOn: true,
        publishedTimestamp: true,
        lang: true
      }
    });

    if (newsData && newsData.length > 0) {
      // Cache main news endpoint
      const mainNewsKey = 'cache:/api/news';
      cache.set(mainNewsKey, {
        data: newsData,
        pagination: {
          page: 1,
          limit: 50,
          total: newsData.length,
          pages: 1,
          hasNext: false,
          hasPrev: false
        },
        filters: {
          source: null,
          category: null,
          search: null,
          sortBy: 'publishedOn',
          sortOrder: 'desc'
        }
      }, 300);

      // Cache latest news
      const latestNewsKey = 'cache:/api/news/latest';
      cache.set(latestNewsKey, {
        data: newsData.slice(0, 10),
        count: 10,
        type: 'latest'
      }, 180);

      console.log(`🔥 Cached ${newsData.length} news articles`);
    }

    // Warm up other endpoints with placeholder data
    const placeholderData = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
      },
      filters: {
        source: null,
        category: null,
        search: null,
        sortBy: 'publishedOn',
        sortOrder: 'desc'
      }
    };

    // Cache empty results for common queries
    cache.set('cache:/api/news?page=1&limit=20', placeholderData, 300);
    cache.set('cache:/api/news?page=2&limit=20', placeholderData, 300);
    cache.set('cache:/api/news?page=3&limit=20', placeholderData, 300);

    console.log('✅ Cache warmup completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Cache warmup failed:', error);
    return false;
  }
};

// Cache operations object for direct use
const cacheOperations = {
  get: (key) => cache.get(key),
  set: (key, value, ttl) => cache.set(key, value, ttl),
  del: (key) => cache.del(key),
  getTtl: (key) => cache.getTtl(key),
  getStats: () => getCacheStats(),
  getHealth: () => getCacheHealth(),
  flush: () => cache.flushAll(),
  warmup: (keys) => {
    console.log('🔥 Starting cache warmup...');
    keys.forEach(key => {
      console.log(`🔥 Warming up cache for: ${key}`);
    });
  },
  // Add missing invalidateByPattern method
  invalidateByPattern: (pattern) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => 
      CACHE_PATTERNS[pattern]?.some(p => key.includes(p)) || 
      key.includes(pattern)
    );
    
    matchingKeys.forEach(key => {
      cache.del(key);
      console.log(`🗑️  Invalidated cache key: ${key}`);
    });
    
    return matchingKeys.length;
  },
  // Add clearByType method
  clearByType: (type) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => 
      CACHE_PATTERNS[type]?.some(p => key.includes(p)) || 
      key.includes(type)
    );
    
    matchingKeys.forEach(key => {
      cache.del(key);
      console.log(`🗑️  Cleared cache key: ${key}`);
    });
    
    return matchingKeys.length;
  },
  // Add clearByPattern method
  clearByPattern: (pattern) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    matchingKeys.forEach(key => {
      cache.del(key);
      console.log(`🗑️  Cleared cache key: ${key}`);
    });
    
    return matchingKeys.length;
  }
};

// Cache statistics
const getCacheStats = () => {
  const stats = cache.getStats();
  return {
    hits: stats.hits,
    misses: stats.misses,
    keys: stats.keys,
    ksize: stats.ksize,
    vsize: stats.vsize,
    hitRate: stats.hits / (stats.hits + stats.misses) * 100,
    totalRequests: stats.hits + stats.misses,
    uptime: process.uptime()
  };
};

// Cache health check
const getCacheHealth = () => {
  try {
    const stats = cache.getStats();
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'healthy',
      stats: {
        hits: stats.hits,
        misses: stats.misses,
        keys: stats.keys,
        hitRate: stats.hits / (stats.hits + stats.misses) * 100
      },
      memory: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal
      },
      uptime: process.uptime()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      uptime: process.uptime()
    };
  }
};

// Smart cache invalidation based on patterns
const invalidateCacheByPattern = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => 
    CACHE_PATTERNS[pattern]?.some(p => key.includes(p)) || 
    key.includes(pattern)
  );
  
  matchingKeys.forEach(key => {
    cache.del(key);
    console.log(`🗑️  Invalidated cache key: ${key}`);
  });
  
  return matchingKeys.length;
};

// Clear all caches
const clearAllCaches = () => {
  const keys = cache.keys();
  const clearedCount = keys.length;
  
  keys.forEach(key => {
    cache.del(key);
    console.log(`🗑️  Cleared cache key: ${key}`);
  });
  
  console.log(`🗑️  Cleared all caches: ${clearedCount} keys removed`);
  return clearedCount;
};

// Clear cache by specific type
const clearCacheByType = (type) => {
  if (!type || type === 'all') {
    return clearAllCaches();
  }
  
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => 
    CACHE_PATTERNS[type]?.some(p => key.includes(p)) || 
    key.includes(type.toLowerCase())
  );
  
  matchingKeys.forEach(key => {
    cache.del(key);
    console.log(`🗑️  Cleared cache key: ${key}`);
  });
  
  console.log(`🗑️  Cleared cache type '${type}': ${matchingKeys.length} keys removed`);
  return matchingKeys.length;
};

// Cache warming for specific data types
const warmupCacheByType = async (dataType) => {
  const warmupKeys = CACHE_PATTERNS[dataType] || [];
  
  if (warmupKeys.length === 0) {
    console.log(`⚠️  No warmup keys found for data type: ${dataType}`);
    return false;
  }
  
  console.log(`🔥 Warming up cache for ${dataType}: ${warmupKeys.join(', ')}`);
  
  try {
    // This would typically fetch data from database and cache it
    // For now, we'll just log the warmup attempt
    warmupKeys.forEach(key => {
      console.log(`🔥 Warming up cache for: ${key}`);
    });
    
    return true;
  } catch (error) {
    console.error(`🔥 Cache warmup failed for ${dataType}:`, error);
    return false;
  }
};

// Export Fastify plugin and utility functions
module.exports = {
  cache,
  cachePlugin,
  aggressiveCacheHook,
  ultraAggressiveCacheHook, // Add the new ultra-aggressive hook
  cacheWarmingMiddleware,
  cacheOperations,
  getCacheStats,
  getCacheHealth,
  invalidateCacheByPattern,
  warmupCacheByType,
  warmupCacheWithData, // Add the new data warming function
  clearAllCaches,
  clearCacheByType,
  
  // Legacy compatibility (for existing code)
  cacheMiddleware: (duration) => aggressiveCacheHook(duration),
  aggressiveCacheMiddleware: (duration, fallbackToDb) => aggressiveCacheHook(duration, fallbackToDb)
};
