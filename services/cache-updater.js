// Cache Updater Service
// This service runs cron jobs to fetch data from database and update cache

const cron = require('node-cron');
const db = require('../lib/database');
const cache = require('../lib/cache');

class CacheUpdaterService {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    
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
        // Retry failed jobs
        await this.retryJob(name, task);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });
    
    this.jobs.set(name, job);
    console.log(`📅 Scheduled job '${name}' with schedule: ${schedule}`);
  }

  // Retry failed jobs
  async retryJob(name, task) {
    const attempts = this.retryAttempts.get(name) || 0;
    
    if (attempts < this.maxRetries) {
      console.log(`🔄 Retrying job ${name} (attempt ${attempts + 1}/${this.maxRetries})...`);
      this.retryAttempts.set(name, attempts + 1);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 5000 * (attempts + 1))); // Exponential backoff
        await task();
        console.log(`✅ Retry successful for job: ${name}`);
        this.retryAttempts.delete(name); // Reset retry count on success
      } catch (error) {
        console.error(`❌ Retry failed for job ${name}:`, error.message);
        if (attempts + 1 >= this.maxRetries) {
          console.error(`💥 Max retries reached for job ${name}`);
        }
      }
    }
  }

  // Update market data cache - SELECT * FROM market_data
  async updateMarketDataCache() {
    try {
      console.log('🔄 Updating market data cache...');
      
      // Simple SELECT * - no filters, no ordering
      const result = await db.query('SELECT * FROM market_data');
      
      if (result.rows && result.rows.length > 0) {
        cache.set(cache.CACHE_KEYS.MARKET_DATA, result.rows);
        console.log(`✅ Market data cache updated: ${result.rows.length} records`);
      } else {
        console.log('⚠️ No market data found in database');
      }
    } catch (error) {
      console.error('❌ Error updating market data cache:', error.message);
      throw error;
    }
  }

  // Update trending coins cache - SELECT * FROM trending_coins
  async updateTrendingCoinsCache() {
    try {
      console.log('🔄 Updating trending coins cache...');
      
      // Simple SELECT * - no filters, no ordering
      const result = await db.query('SELECT * FROM trending_coins');
      
      if (result.rows && result.rows.length > 0) {
        cache.set(cache.CACHE_KEYS.TRENDING_COINS, result.rows);
        console.log(`✅ Trending coins cache updated: ${result.rows.length} records`);
      } else {
        console.log('⚠️ No trending coins found in database');
      }
    } catch (error) {
      console.error('❌ Error updating trending coins cache:', error.message);
      throw error;
    }
  }

  // Update top gainers cache - SELECT * FROM top_gainers
  async updateTopGainersCache() {
    try {
      console.log('🔄 Updating top gainers cache...');
      
      // Simple SELECT * - no filters, no ordering
      const result = await db.query('SELECT * FROM top_gainers');
      
      if (result.rows && result.rows.length > 0) {
        cache.set(cache.CACHE_KEYS.TOP_GAINERS, result.rows);
        console.log(`✅ Top gainers cache updated: ${result.rows.length} records`);
      } else {
        console.log('⚠️ No top gainers found in database');
      }
    } catch (error) {
      console.error('❌ Error updating top gainers cache:', error.message);
      throw error;
    }
  }

  // Update top coins cache - SELECT * FROM top_coins
  async updateTopCoinsCache() {
    try {
      console.log('🔄 Updating top coins cache...');
      
      // Simple SELECT * - no filters, no ordering
      const result = await db.query('SELECT * FROM top_coins');
      
      if (result.rows && result.rows.length > 0) {
        cache.set(cache.CACHE_KEYS.TOP_COINS, result.rows);
        console.log(`✅ Top coins cache updated: ${result.rows.length} records`);
      } else {
        console.log('⚠️ No top coins found in database');
      }
    } catch (error) {
      console.error('❌ Error updating top coins cache:', error.message);
      throw error;
    }
  }

  // Update top market coins cache - SELECT * FROM top_market_coins
  async updateTopMarketCoinsCache() {
    try {
      console.log('🔄 Updating top market coins cache...');
      
      // Simple SELECT * - no filters, no ordering
      const result = await db.query('SELECT * FROM top_market_coins');
      
      if (result.rows && result.rows.length > 0) {
        cache.set(cache.CACHE_KEYS.TOP_MARKET_COINS, result.rows);
        console.log(`✅ Top market coins cache updated: ${result.rows.length} records`);
      } else {
        console.log('⚠️ No top market coins found in database');
      }
    } catch (error) {
      console.error('❌ Error updating top market coins cache:', error.message);
      throw error;
    }
  }

  // Update news cache - SELECT * FROM news
  async updateNewsCache() {
    try {
      console.log('🔄 Updating news cache...');
      
      // Simple SELECT * - no filters, no ordering, no field selection
      const result = await db.query('SELECT * FROM news');
      
      if (result.rows && result.rows.length > 0) {
        // Serialize BigInts for JSON compatibility
        const serializedData = this.serializeBigInts(result.rows);
        cache.set(cache.CACHE_KEYS.NEWS, serializedData);
        console.log(`✅ News cache updated: ${result.rows.length} records`);
      } else {
        console.log('⚠️ No news found in database');
      }
    } catch (error) {
      console.error('❌ Error updating news cache:', error.message);
      throw error;
    }
  }

  // Update exchanges cache - SELECT * FROM exchanges
  async updateExchangesCache() {
    try {
      console.log('🔄 Updating exchanges cache...');
      
      // Simple SELECT * - no filters, no ordering
      const result = await db.query('SELECT * FROM exchanges');
      
      if (result.rows && result.rows.length > 0) {
        cache.set(cache.CACHE_KEYS.EXCHANGES, result.rows);
        console.log(`✅ Exchanges cache updated: ${result.rows.length} records`);
      } else {
        console.log('⚠️ No exchanges found in database');
      }
    } catch (error) {
      console.error('❌ Error updating exchanges cache:', error.message);
      throw error;
    }
  }

  // Populate all cache on startup with retry mechanism
  async populateAllCache() {
    console.log('🚀 Populating all cache on startup...');
    
    const maxRetries = 3;
    let attempt = 1;
    
    while (attempt <= maxRetries) {
      try {
        console.log(`🔄 Cache population attempt ${attempt}/${maxRetries}...`);
        
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
          return true;
        } else {
          const missingKeys = cacheKeys.filter(key => cache.get(key) === null);
          console.log(`⚠️ Missing cache data for: ${missingKeys.join(', ')}`);
          
          if (attempt < maxRetries) {
            console.log(`🔄 Retrying in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
        
        attempt++;
      } catch (error) {
        console.error(`❌ Error during cache population (attempt ${attempt}):`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`🔄 Retrying in 10 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          console.error('💥 Max retries reached for cache population');
          throw error;
        }
        
        attempt++;
      }
    }
    
    return false;
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
      retryAttempts: Object.fromEntries(this.retryAttempts),
      timestamp: new Date().toISOString()
    };
  }

  // Test database connection
  async testConnection() {
    try {
      await db.query('SELECT 1');
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
      await db.close();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.log('⚠️ Error closing database connection:', error.message);
    }
    
    console.log('✅ Cache updater service shutdown complete');
  }
}

// Create singleton instance
const cacheUpdaterService = new CacheUpdaterService();

module.exports = cacheUpdaterService;
