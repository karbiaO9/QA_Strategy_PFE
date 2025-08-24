// Cache Updater Service
// This service runs cron jobs to fetch data from database and update cache

const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const cache = require('../lib/cache');

class CacheUpdaterService {
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });
    
    this.isRunning = false;
    this.jobs = new Map();
    
    console.log('🚀 Cache Updater Service initialized');
  }

  // Start all cron jobs
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cache updater is already running');
      return;
    }

    console.log('📅 Starting cache update cron jobs...');
    
    // Market data: every 2 hours
    this.scheduleJob('market-data', '0 */2 * * *', () => this.updateMarketDataCache());
    
    // Trending coins: every 8 hours
    this.scheduleJob('trending-coins', '0 */8 * * *', () => this.updateTrendingCoinsCache());
    
    // Top gainers: every 12 hours
    this.scheduleJob('top-gainers', '0 */12 * * *', () => this.updateTopGainersCache());
    
    // Top coins: every 4 hours
    this.scheduleJob('top-coins', '0 */4 * * *', () => this.updateTopCoinsCache());
    
    // Top market coins: every 4 hours
    this.scheduleJob('top-market-coins', '0 */4 * * *', () => this.updateTopMarketCoinsCache());
    
    // News: every 6 hours
    this.scheduleJob('news', '0 */6 * * *', () => this.updateNewsCache());
    
    // Exchanges: every 2 weeks on Sunday at 2 AM UTC
    this.scheduleJob('exchanges', '0 2 */2 * 0', () => this.updateExchangesCache());
    

    
    this.isRunning = true;
    console.log('✅ All cache update jobs scheduled');
  }

  // Stop all cron jobs
  stop() {
    console.log('🛑 Stopping cache update jobs...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ All cache update jobs stopped');
  }

  // Schedule a single job
  scheduleJob(name, schedule, task) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📅 Job '${name}' would run on schedule: ${schedule} (disabled in development)`);
      return;
    }

    const job = cron.schedule(schedule, async () => {
      try {
        console.log(`🔄 Running scheduled job: ${name}`);
        await task();
        console.log(`✅ Scheduled job completed: ${name}`);
      } catch (error) {
        console.error(`❌ Error in scheduled job ${name}:`, error.message);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });
    
    this.jobs.set(name, job);
    console.log(`📅 Scheduled job '${name}' with schedule: ${schedule}`);
  }

  // Update market data cache - SELECT * FROM market_data
  async updateMarketDataCache() {
    try {
      console.log('🔄 Updating market data cache...');
      
      // Simple SELECT * - no filters, no ordering
      const data = await this.prisma.marketData.findMany();
      
      if (data && data.length > 0) {
        cache.set(cache.CACHE_KEYS.MARKET_DATA, data);
        console.log(`✅ Market data cache updated: ${data.length} records`);
      } else {
        console.log('⚠️ No market data found in database');
      }
    } catch (error) {
      console.error('❌ Error updating market data cache:', error.message);
    }
  }

  // Update trending coins cache - SELECT * FROM trending_coins
  async updateTrendingCoinsCache() {
    try {
      console.log('🔄 Updating trending coins cache...');
      
      // Simple SELECT * - no filters, no ordering
      const data = await this.prisma.trendingCoin.findMany();
      
      if (data && data.length > 0) {
        cache.set(cache.CACHE_KEYS.TRENDING_COINS, data);
        console.log(`✅ Trending coins cache updated: ${data.length} records`);
      } else {
        console.log('⚠️ No trending coins found in database');
      }
    } catch (error) {
      console.error('❌ Error updating trending coins cache:', error.message);
    }
  }

  // Update top gainers cache - SELECT * FROM top_gainers
  async updateTopGainersCache() {
    try {
      console.log('🔄 Updating top gainers cache...');
      
      // Simple SELECT * - no filters, no ordering
      const data = await this.prisma.topGainer.findMany();
      
      if (data && data.length > 0) {
        cache.set(cache.CACHE_KEYS.TOP_GAINERS, data);
        console.log(`✅ Top gainers cache updated: ${data.length} records`);
      } else {
        console.log('⚠️ No top gainers found in database');
      }
    } catch (error) {
      console.error('❌ Error updating top gainers cache:', error.message);
    }
  }

  // Update top coins cache - SELECT * FROM top_coins
  async updateTopCoinsCache() {
    try {
      console.log('🔄 Updating top coins cache...');
      
      // Simple SELECT * - no filters, no ordering
      const data = await this.prisma.topCoins.findMany();
      
      if (data && data.length > 0) {
        cache.set(cache.CACHE_KEYS.TOP_COINS, data);
        console.log(`✅ Top coins cache updated: ${data.length} records`);
      } else {
        console.log('⚠️ No top coins found in database');
      }
    } catch (error) {
      console.error('❌ Error updating top coins cache:', error.message);
    }
  }

  // Update top market coins cache - SELECT * FROM top_market_coins
  async updateTopMarketCoinsCache() {
    try {
      console.log('🔄 Updating top market coins cache...');
      
      // Simple SELECT * - no filters, no ordering
      const data = await this.prisma.topMarketCoins.findMany();
      
      if (data && data.length > 0) {
        cache.set(cache.CACHE_KEYS.TOP_MARKET_COINS, data);
        console.log(`✅ Top market coins cache updated: ${data.length} records`);
      } else {
        console.log('⚠️ No top market coins found in database');
      }
    } catch (error) {
      console.error('❌ Error updating top market coins cache:', error.message);
    }
  }

  // Update news cache - SELECT * FROM news
  async updateNewsCache() {
    try {
      console.log('🔄 Updating news cache...');
      
      // Simple SELECT * - no filters, no ordering, no field selection
      const data = await this.prisma.news.findMany();
      
      if (data && data.length > 0) {
        // Serialize BigInts for JSON compatibility
        const serializedData = this.serializeBigInts(data);
        cache.set(cache.CACHE_KEYS.NEWS, serializedData);
        console.log(`✅ News cache updated: ${data.length} records`);
      } else {
        console.log('⚠️ No news found in database');
      }
    } catch (error) {
      console.error('❌ Error updating news cache:', error.message);
    }
  }

  // Update exchanges cache - SELECT * FROM exchanges
  async updateExchangesCache() {
    try {
      console.log('🔄 Updating exchanges cache...');
      
      // Simple SELECT * - no filters, no ordering
      const data = await this.prisma.exchange.findMany();
      
      if (data && data.length > 0) {
        cache.set(cache.CACHE_KEYS.EXCHANGES, data);
        console.log(`✅ Exchanges cache updated: ${data.length} records`);
      } else {
        console.log('⚠️ No exchanges found in database');
      }
    } catch (error) {
      console.error('❌ Error updating exchanges cache:', error.message);
    }
  }

  // Populate all cache on startup
  async populateAllCache() {
    console.log('🚀 Populating all cache on startup...');
    
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
      
      console.log('✅ All cache populated on startup');
      
      // Verify cache population
      const cacheKeys = Object.values(cache.CACHE_KEYS);
      const populatedKeys = cacheKeys.filter(key => cache.get(key) !== null);
      
      console.log(`📊 Cache verification: ${populatedKeys.length}/${cacheKeys.length} keys populated`);
      
      if (populatedKeys.length === cacheKeys.length) {
        console.log('🎯 All cache keys successfully populated');
      } else {
        const missingKeys = cacheKeys.filter(key => cache.get(key) === null);
        console.log(`⚠️ Missing cache data for: ${missingKeys.join(', ')}`);
      }
      
    } catch (error) {
      console.error('❌ Error during cache population:', error.message);
      throw error; // Re-throw to handle in server startup
    }
  }

  // Serialize BigInts for JSON compatibility
  serializeBigInts(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return Number(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeBigInts(item));
    }
    
    if (typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.serializeBigInts(value);
      }
      return result;
    }
    
    return obj;
  }

  // Get service status
  getStatus() {
    return {
      running: this.isRunning,
      activeJobs: this.jobs.size,
      jobNames: Array.from(this.jobs.keys()),
      cacheStats: cache.getStats(),
      timestamp: new Date().toISOString()
    };
  }

  // Test database connection
  async testConnection() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error.message);
      return false;
    }
  }

  // Check if all cache is populated and ready
  isCacheReady() {
    const cacheKeys = Object.values(cache.CACHE_KEYS);
    const populatedKeys = cacheKeys.filter(key => cache.get(key) !== null);
    return populatedKeys.length === cacheKeys.length;
  }

  // Get cache readiness status
  getCacheReadinessStatus() {
    const cacheKeys = Object.values(cache.CACHE_KEYS);
    const status = {};
    
    cacheKeys.forEach(key => {
      const data = cache.get(key);
      status[key] = {
        populated: data !== null,
        count: data ? data.length : 0,
        ready: data !== null
      };
    });
    
    return {
      totalKeys: cacheKeys.length,
      populatedKeys: cacheKeys.filter(key => cache.get(key) !== null).length,
      allReady: this.isCacheReady(),
      details: status
    };
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🔄 Shutting down cache updater service...');
    
    this.stop();
    
    try {
      await this.prisma.$disconnect();
      console.log('✅ Prisma disconnected');
    } catch (error) {
      console.log('⚠️ Error disconnecting Prisma:', error.message);
    }
    
    console.log('✅ Cache updater service shutdown complete');
  }
}

// Create singleton instance
const cacheUpdaterService = new CacheUpdaterService();

module.exports = cacheUpdaterService;
