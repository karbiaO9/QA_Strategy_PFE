const { cacheOperations } = require('../middleware/cache');

// Fastify plugin function to register all API routes
async function apiRoutes(fastify, options) {
  // Register market data routes - main endpoint for all market data
  fastify.register(require('./marketData'), { prefix: '/market-data' });
  
  // Register news routes - main endpoint for all news
  fastify.register(require('./news'), { prefix: '/news' });
  
  // Register trending coins routes - main endpoint for all trending coins
  fastify.register(require('./trendingCoins'), { prefix: '/trending-coins' });
  
  // Register top gainers routes - main endpoint for all top gainers
  fastify.register(require('./topGainers'), { prefix: '/top-gainers' });
  
  // Register top coins routes - main endpoint for all top coins
  fastify.register(require('./topCoins'), { prefix: '/top-coins' });
  
  // Register top market coins routes - main endpoint for all top market coins
  fastify.register(require('./topMarketCoins'), { prefix: '/top-market-coins' });
  
  // Register exchanges routes - main endpoint for all exchanges
  fastify.register(require('./exchanges'), { prefix: '/exchanges' });

  // API info endpoint
  fastify.get('/', async (request, reply) => {
    return {
      success: true,
      message: 'MarketSaver API - Simplified Endpoints',
      version: '2.0.0',
      description: 'All endpoints now provide simplified access to database tables with smart caching',
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
      ],
      timestamp: new Date().toISOString()
    };
  });
}

module.exports = apiRoutes;
