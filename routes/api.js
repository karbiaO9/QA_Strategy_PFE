const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');
const db = require('../lib/database');

// Helper function to add cache headers
const addCacheHeaders = (res, ttl = 3600) => {
  res.set({
    'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
    'ETag': `"${Date.now()}"`,
    'Last-Modified': new Date().toISOString()
  });
};

// Helper function to stream large responses
const streamResponse = (res, data, source, total) => {
  addCacheHeaders(res, 1209600); // 2 weeks for exchanges
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  // Stream the response in chunks
  const chunkSize = 1000; // Process 1000 items at a time
  let offset = 0;
  
  res.write('{"success":true,"source":"' + source + '","total":' + total + ',"timestamp":"' + new Date().toISOString() + '","data":[');
  
  const streamChunk = () => {
    const chunk = data.slice(offset, offset + chunkSize);
    const isLastChunk = offset + chunkSize >= data.length;
    
    if (chunk.length > 0) {
      const chunkJson = JSON.stringify(chunk);
      if (offset > 0) res.write(',');
      res.write(chunkJson);
    }
    
    offset += chunkSize;
    
    if (isLastChunk) {
      res.write(']}');
      res.end();
    } else {
      // Use setImmediate to prevent blocking the event loop
      setImmediate(streamChunk);
    }
  };
  
  streamChunk();
};

// Helper function to fetch data from database with fallback
const fetchDataWithFallback = async (cacheKey, query, source = 'database') => {
  try {
    // First try to get from cache
    let data = cache.get(cacheKey);
    
    if (data) {
      return { data, source: 'cache' };
    }
    
    // If cache is empty, fetch from database
    console.log(`🔄 Cache miss for ${cacheKey}, fetching from database...`);
    const result = await db.query(query);
    
    if (result.rows && result.rows.length > 0) {
      // Update cache with fresh data
      cache.set(cacheKey, result.rows);
      console.log(`✅ Updated cache for ${cacheKey} with ${result.rows.length} records`);
      return { data: result.rows, source: 'database' };
    } else {
      console.log(`⚠️ No data found in database for ${cacheKey}`);
      return { data: [], source: 'database' };
    }
  } catch (error) {
    console.error(`❌ Error fetching data for ${cacheKey}:`, error.message);
    throw error;
  }
};

// API Routes - WITH FALLBACK TO DATABASE
router.get('/market-data', async (req, res) => {
  try {
    const { data, source } = await fetchDataWithFallback(
      cache.CACHE_KEYS.MARKET_DATA,
      'SELECT * FROM market_data'
    );
    
    addCacheHeaders(res, 7200); // 2 hours
    
    res.json({
      success: true,
      data: data,
      source: source,
      total: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data',
      message: error.message
    });
  }
});

router.get('/news', async (req, res) => {
  try {
    const { data, source } = await fetchDataWithFallback(
      cache.CACHE_KEYS.NEWS,
      'SELECT * FROM news'
    );
    
    addCacheHeaders(res, 21600); // 6 hours
    
    res.json({
      success: true,
      data: data,
      source: source,
      total: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      message: error.message
    });
  }
});

router.get('/trending-coins', async (req, res) => {
  try {
    const { data, source } = await fetchDataWithFallback(
      cache.CACHE_KEYS.TRENDING_COINS,
      'SELECT * FROM trending_coins'
    );
    
    addCacheHeaders(res, 28800); // 8 hours
    
    res.json({
      success: true,
      data: data,
      source: source,
      total: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending coins',
      message: error.message
    });
  }
});

router.get('/top-gainers', async (req, res) => {
  try {
    const { data, source } = await fetchDataWithFallback(
      cache.CACHE_KEYS.TOP_GAINERS,
      'SELECT * FROM top_gainers'
    );
    
    addCacheHeaders(res, 43200); // 12 hours
    
    res.json({
      success: true,
      data: data,
      source: source,
      total: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top gainers',
      message: error.message
    });
  }
});

router.get('/top-coins', async (req, res) => {
  try {
    const { data, source } = await fetchDataWithFallback(
      cache.CACHE_KEYS.TOP_COINS,
      'SELECT * FROM top_coins'
    );
    
    addCacheHeaders(res, 14400); // 4 hours
    
    res.json({
      success: true,
      data: data,
      source: source,
      total: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top coins',
      message: error.message
    });
  }
});

router.get('/top-market-coins', async (req, res) => {
  try {
    const { data, source } = await fetchDataWithFallback(
      cache.CACHE_KEYS.TOP_MARKET_COINS,
      'SELECT * FROM top_market_coins'
    );
    
    addCacheHeaders(res, 14400); // 4 hours
    
    res.json({
      success: true,
      data: data,
      source: source,
      total: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top market coins',
      message: error.message
    });
  }
});

router.get('/exchanges', async (req, res) => {
  try {
    const { data, source } = await fetchDataWithFallback(
      cache.CACHE_KEYS.EXCHANGES,
      'SELECT * FROM exchanges'
    );
    
    // Use streaming for large datasets (exchanges can be very large)
    if (data.length > 1000) {
      return streamResponse(res, data, source, data.length);
    }
    
    // For smaller datasets, use regular response
    addCacheHeaders(res, 1209600); // 2 weeks
    
    res.json({
      success: true,
      data: data,
      source: source,
      total: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchanges',
      message: error.message
    });
  }
});

module.exports = router;
