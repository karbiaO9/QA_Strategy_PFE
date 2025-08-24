// Cache configuration for MarketSaver - prioritizing cache over database
module.exports = {
  // Global cache settings
  global: {
    // Maximum cache size
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 2000,
    
    // Default TTL for all cached items
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 600, // 10 minutes
    
    // Cache check period
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 300, // 5 minutes
    
    // Enable aggressive caching by default
    aggressiveMode: process.env.CACHE_AGGRESSIVE_MODE !== 'false', // true by default
    
    // Enable cache warming
    enableWarming: process.env.CACHE_WARMING !== 'false', // true by default
    
    // Warmup interval in milliseconds
    warmupInterval: parseInt(process.env.CACHE_WARMUP_INTERVAL) || 300000, // 5 minutes
  },

  // Cache strategies for different data types
  strategies: {
    // Aggressive caching - prioritize cache over database
    aggressive: {
      // Return expired cache data instead of hitting database
      useExpiredCache: true,
      
      // Cache TTL multiplier (longer TTLs)
      ttlMultiplier: 2.0,
      
      // Enable cache warming
      enableWarming: true,
      
      // Cache miss threshold before warming
      missThreshold: 3
    },
    
    // Conservative caching - balance cache and database
    conservative: {
      useExpiredCache: false,
      ttlMultiplier: 1.0,
      enableWarming: false,
      missThreshold: 10
    },
    
    // Minimal caching - only for very stable data
    minimal: {
      useExpiredCache: false,
      ttlMultiplier: 0.5,
      enableWarming: false,
      missThreshold: 20
    }
  },

  // Data type specific configurations
  dataTypes: {
    // Market data - frequently changing, moderate cache
    marketData: {
      strategy: 'aggressive',
      baseTTL: 180, // 3 minutes
      maxTTL: 600,  // 10 minutes
      priority: 'high',
      warming: true,
      patterns: ['market_data', 'sentiment']
    },

    // Top market coins - moderately stable, aggressive cache
    topMarketCoins: {
      strategy: 'aggressive',
      baseTTL: 600,  // 10 minutes
      maxTTL: 1800,  // 30 minutes
      priority: 'high',
      warming: true,
      patterns: ['top_market_coins']
    },

    // News - frequently changing, moderate cache
    news: {
      strategy: 'aggressive',
      baseTTL: 300,  // 5 minutes
      maxTTL: 900,   // 15 minutes
      priority: 'medium',
      warming: true,
      patterns: ['news']
    },

    // Trending coins - frequently changing, moderate cache
    trendingCoins: {
      strategy: 'aggressive',
      baseTTL: 300,  // 5 minutes
      maxTTL: 900,   // 15 minutes
      priority: 'medium',
      warming: true,
      patterns: ['trending_coins']
    },

    // Top gainers/losers - frequently changing, moderate cache
    topGainers: {
      strategy: 'aggressive',
      baseTTL: 300,  // 5 minutes
      maxTTL: 600,   // 10 minutes
      priority: 'medium',
      warming: true,
      patterns: ['top_gainers', 'top_losers']
    },

    // Top coins - moderately stable, aggressive cache
    topCoins: {
      strategy: 'aggressive',
      baseTTL: 600,  // 10 minutes
      maxTTL: 1800,  // 30 minutes
      priority: 'high',
      warming: true,
      patterns: ['top_coins']
    },

    // Exchanges - very stable, aggressive cache
    exchanges: {
      strategy: 'aggressive',
      baseTTL: 1800, // 30 minutes
      maxTTL: 3600,  // 1 hour
      priority: 'low',
      warming: true,
      patterns: ['exchanges']
    }
  },

  // Cache warming configuration
  warming: {
    // Enable automatic warming
    enabled: true,
    
    // Warmup intervals for different data types
    intervals: {
      marketData: 300000,      // 5 minutes
      topMarketCoins: 600000,  // 10 minutes
      news: 300000,            // 5 minutes
      trendingCoins: 300000,   // 5 minutes
      topGainers: 300000,      // 5 minutes
      topCoins: 600000,        // 10 minutes
      exchanges: 1800000       // 30 minutes
    },
    
    // Warmup keys for each data type
    keys: {
      marketData: [
        'market_data_latest',
        'market_data_summary',
        'market_data_sentiment'
      ],
      topMarketCoins: [
        'top_market_coins_all_1_50',
        'top_market_coins_gainers_20',
        'top_market_coins_losers_20',
        'top_market_coins_summary'
      ],
      news: [
        'news_latest',
        'news_trending'
      ],
      trendingCoins: [
        'trending_coins_top',
        'trending_coins_gainers'
      ],
      topGainers: [
        'top_gainers_20',
        'top_losers_20'
      ],
      topCoins: [
        'top_coins_all',
        'top_coins_summary'
      ],
      exchanges: [
        'exchanges_all',
        'exchanges_popular'
      ]
    }
  },

  // Performance thresholds
  performance: {
    // Target cache hit rate
    targetHitRate: 85, // 85%
    
    // Minimum acceptable hit rate
    minHitRate: 60, // 60%
    
    // Cache miss penalty (ms)
    missPenalty: 100,
    
    // Database query timeout (ms)
    dbTimeout: 5000,
    
    // Cache operation timeout (ms)
    cacheTimeout: 100
  },

  // Monitoring and alerts
  monitoring: {
    // Enable performance monitoring
    enabled: true,
    
    // Metrics collection interval (ms)
    metricsInterval: 60000, // 1 minute
    
    // Alert thresholds
    alerts: {
      lowHitRate: 60,        // Alert if hit rate < 60%
      highMemoryUsage: 80,   // Alert if memory usage > 80%
      cacheFull: 90,         // Alert if cache > 90% full
      slowQueries: 1000      // Alert if queries > 1 second
    },
    
    // Log levels
    logLevel: process.env.CACHE_LOG_LEVEL || 'info'
  },

  // Cache invalidation rules
  invalidation: {
    // Automatic invalidation
    auto: {
      enabled: true,
      // Invalidate related data when main data changes
      cascade: true,
      // Invalidate expired data
      cleanup: true
    },
    
    // Manual invalidation patterns
    patterns: {
      // Invalidate all market data when any market data changes
      marketData: ['market_data', 'sentiment'],
      // Invalidate all coin data when any coin data changes
      coins: ['top_market_coins', 'trending_coins', 'top_gainers', 'top_coins'],
      // Invalidate all data when exchanges change
      exchanges: ['exchanges']
    }
  },

  // Environment-specific overrides
  environments: {
    development: {
      global: {
        maxKeys: 500,
        defaultTTL: 300,
        aggressiveMode: false
      }
    },
    staging: {
      global: {
        maxKeys: 1000,
        defaultTTL: 600,
        aggressiveMode: true
      }
    },
    production: {
      global: {
        maxKeys: 2000,
        defaultTTL: 900,
        aggressiveMode: true
      }
    }
  }
};
