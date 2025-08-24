const { cacheOperations } = require('./cache');

// Retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: ['P1001', 'P1002', 'P2002', 'P2003'], // Database connection and constraint errors
  cacheFallback: true,
  cacheFallbackTTL: 60 // 1 minute for error responses
};

// Exponential backoff delay calculation
const calculateDelay = (attempt, config) => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
};

// Check if error is retryable
const isRetryableError = (error, config) => {
  if (error.code && config.retryableErrors.includes(error.code)) {
    return true;
  }
  
  // Retry on network errors
  if (error.message && (
    error.message.includes('ECONNRESET') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('ENOTFOUND') ||
    error.message.includes('ECONNREFUSED')
  )) {
    return true;
  }
  
  return false;
};

// Retry wrapper for individual functions
const withRetry = async (fn, config = {}) => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`Function failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}):`, error.message);
      
      if (attempt < retryConfig.maxRetries && isRetryableError(error, retryConfig)) {
        const delay = calculateDelay(attempt, retryConfig);
        console.log(`🔄 Retrying function in ${delay}ms... (${attempt + 1}/${retryConfig.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      break;
    }
  }
  
  throw lastError;
};

// Retry with cache fallback
const withRetryAndCache = async (fn, cacheKey, config = {}) => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  try {
    return await withRetry(fn, retryConfig);
  } catch (error) {
    console.error('All retry attempts failed, trying cache fallback:', error.message);
    
    // Try to get cached data
    if (retryConfig.cacheFallback && cacheKey) {
      const cachedData = cacheOperations.get(cacheKey);
      if (cachedData) {
        console.log(`💾 Using cached data as fallback for: ${cacheKey}`);
        return {
          ...cachedData,
          _cache: {
            hit: true,
            key: cacheKey,
            source: 'fallback_cache',
            retry_failed: true
          }
        };
      }
    }
    
    // If no cache fallback, throw the error
    throw error;
  }
};

// Simple retry middleware that can be used as a hook
const retryHook = (config = {}) => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  return async (request, reply) => {
    // Store retry config in request for use in route handlers
    request.retryConfig = retryConfig;
  };
};

module.exports = {
  retryHook,
  withRetry,
  withRetryAndCache,
  DEFAULT_RETRY_CONFIG,
  isRetryableError,
  calculateDelay
};
