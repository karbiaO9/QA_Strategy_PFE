require('dotenv').config();
const fastify = require('fastify');
const { PrismaClient } = require('@prisma/client');
const { bigIntSerializerPlugin } = require('./middleware/bigint-serializer');
const { retryHook } = require('./middleware/retry');
const { ultraAggressiveCacheHook, warmupCacheWithData } = require('./middleware/cache');

// Configuration
const PORT = process.env.PORT || 5050;

// Create Fastify instance with optimized configuration
const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    // prettyPrint option removed - no longer supported in newer versions
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    } : undefined
  },
  trustProxy: true,
  connectionTimeout: 30000,
  keepAliveTimeout: 30000,
  // Move deprecated router options to new structure
  routerOptions: {
    maxParamLength: 100,
    ignoreTrailingSlash: true,
    caseSensitive: false
  }
});


// Register plugins
app.register(bigIntSerializerPlugin);
app.register(retryHook);

// Register API routes
app.register(require('./routes'), { prefix: '/api' });

// Health check endpoints
app.get('/health', async (request, reply) => {
  return {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  };
});

app.get('/health/performance', async (request, reply) => {
  const startTime = Date.now();
  
  // Simulate a quick database check
  try {
    const prisma = require('./lib/prisma').getClient();
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      status: 'healthy',
      performance: {
        responseTime: `${responseTime}ms`,
        database: 'connected',
        cache: 'active'
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    reply.status(500);
    return {
      success: false,
      status: 'unhealthy',
      error: 'Database connection failed',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

// Cache management endpoints
app.get('/cache/stats', async (request, reply) => {
  try {
    const stats = require('./middleware/cache').cacheOperations.getStats();
    
    return {
      success: true,
      cache: {
        status: 'active',
        ...stats,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    reply.status(500);
    return {
      success: false,
      error: 'Failed to get cache stats',
      message: error.message
    };
  }
});

app.get('/cache/health', async (request, reply) => {
  try {
    const health = require('./middleware/cache').cacheOperations.getHealth();
    
    return {
      success: true,
      cache: {
        status: 'healthy',
        ...health,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    reply.status(500);
    return {
      success: false,
      error: 'Failed to get cache health',
      message: error.message
    };
  }
});

app.post('/cache/clear', async (request, reply) => {
  try {
    const { type, pattern } = request.body || {};
    
    if (!type && !pattern) {
      reply.status(400);
      return {
        success: false,
        error: 'Type or pattern is required',
        message: 'Please provide either a cache type or pattern to clear'
      };
    }

    let result;
    if (type) {
      result = require('./middleware/cache').cacheOperations.clearByType(type);
    } else {
      result = require('./middleware/cache').cacheOperations.clearByPattern(pattern);
    }
    
    return {
      success: true,
      message: 'Cache cleared successfully',
      cleared: result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    reply.status(500);
    return {
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    };
  }
});

// Root endpoint with API information
app.get('/', async (request, reply) => {
  return {
    success: true,
    message: 'MarketSaver Server - Simplified API',
    version: '2.0.0',
    description: 'High-performance cryptocurrency data server with simplified endpoints and smart caching',
    server: {
      status: 'running',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    },
    api: {
      baseUrl: '/api',
      endpoints: {
        '/market-data': 'Get all market data with pagination and caching',
        '/news': 'Get all news with pagination, filtering, and caching',
        '/trending-coins': 'Get all trending coins with pagination and caching',
        '/top-gainers': 'Get all top gainers with pagination and caching',
        '/top-coins': 'Get all top coins with pagination and caching',
        '/top-market-coins': 'Get all top market coins with pagination and caching',
        '/exchanges': 'Get all exchanges with pagination, sorting, and caching'
      },
      features: [
        'Smart caching with configurable TTLs',
        'Pagination support (page, limit parameters)',
        'Error handling and structured responses',
        'Cache headers for monitoring',
        'Database query optimization'
      ]
    },
    cache: {
      status: 'active',
      endpoints: {
        '/cache/stats': 'Get cache statistics and performance metrics',
        '/cache/health': 'Check cache health and status',
        '/cache/clear': 'Clear cache by type or pattern'
      }
    },
    timestamp: new Date().toISOString()
  };
});

// Start the server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 MarketSaver server started on port ${PORT}`);
    console.log(`📊 Server ID: ${process.env.SERVER_ID || 'ultra-fast-complete'}`);
    console.log(`💾 Cache TTL: 4 hours (14400 seconds)`);
    console.log(`🔧 Auto-scaling: Removed (use cloud scaling instead)`);
    console.log(`🎯 Enhanced caching: Prevents database calls for 4 hours`);
    
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  await app.close();
  console.log('✅ Server stopped');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  await app.close();
  console.log('✅ Server stopped');
  process.exit(0);
});

// Start the server
start();
