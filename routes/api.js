const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');

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

// API Routes - ALL DATA FROM CACHE ONLY
router.get('/market-data', (req, res) => {
  try {
    const data = cache.get(cache.CACHE_KEYS.MARKET_DATA);
    
    if (!data) {
      return res.status(503).json({
        success: false,
        error: 'Market data not available in cache',
        message: 'Cache is being populated, please try again later'
      });
    }
    
    addCacheHeaders(res, 7200); // 2 hours
    
    res.json({
      success: true,
      data: data,
      source: 'cache',
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

router.get('/news', (req, res) => {
  try {
    const data = cache.get(cache.CACHE_KEYS.NEWS);
    
    if (!data) {
      return res.status(503).json({
        success: false,
        error: 'News not available in cache',
        message: 'Cache is being populated, please try again later'
      });
    }
    
    addCacheHeaders(res, 21600); // 6 hours
    
    res.json({
      success: true,
      data: data,
      source: 'cache',
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

router.get('/trending-coins', (req, res) => {
  try {
    const data = cache.get(cache.CACHE_KEYS.TRENDING_COINS);
    
    if (!data) {
      return res.status(503).json({
        success: false,
        error: 'Trending coins not available in cache',
        message: 'Cache is being populated, please try again later'
      });
    }
    
    addCacheHeaders(res, 28800); // 8 hours
    
    res.json({
      success: true,
      data: data,
      source: 'cache',
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

router.get('/top-gainers', (req, res) => {
  try {
    const data = cache.get(cache.CACHE_KEYS.TOP_GAINERS);
    
    if (!data) {
      return res.status(503).json({
        success: false,
        error: 'Top gainers not available in cache',
        message: 'Cache is being populated, please try again later'
      });
    }
    
    addCacheHeaders(res, 43200); // 12 hours
    
    res.json({
      success: true,
      data: data,
      source: 'cache',
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

router.get('/top-coins', (req, res) => {
  try {
    const data = cache.get(cache.CACHE_KEYS.TOP_COINS);
    
    if (!data) {
      return res.status(503).json({
        success: false,
        error: 'Top coins not available in cache',
        message: 'Cache is being populated, please try again later'
      });
    }
    
    addCacheHeaders(res, 14400); // 4 hours
    
    res.json({
      success: true,
      data: data,
      source: 'cache',
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

router.get('/top-market-coins', (req, res) => {
  try {
    const data = cache.get(cache.CACHE_KEYS.TOP_MARKET_COINS);
    
    if (!data) {
      return res.status(503).json({
        success: false,
        error: 'Top market coins not available in cache',
        message: 'Cache is being populated, please try again later'
      });
    }
    
    addCacheHeaders(res, 14400); // 4 hours
    
    res.json({
      success: true,
      data: data,
      source: 'cache',
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

router.get('/exchanges', (req, res) => {
  try {
    const data = cache.get(cache.CACHE_KEYS.EXCHANGES);
    
    if (!data) {
      return res.status(503).json({
        success: false,
        error: 'Exchanges not available in cache',
        message: 'Cache is being populated, please try again later'
      });
    }
    
    // Use streaming for large datasets (exchanges can be very large)
    if (data.length > 1000) {
      return streamResponse(res, data, 'cache', data.length);
    }
    
    // For smaller datasets, use regular response
    addCacheHeaders(res, 1209600); // 2 weeks
    
    res.json({
      success: true,
      data: data,
      source: 'cache',
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
