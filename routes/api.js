const express = require('express');
const router = express.Router();
const cache = require('../lib/cache');

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
