const { cacheOperations, aggressiveCacheMiddleware } = require('../middleware/cache');

// Use centralized Prisma client
const prismaClient = require('../lib/prisma');

// Fastify plugin function
async function topMarketCoinsRoutes(fastify, options) {
  const prisma = prismaClient.getClient();

  // Smart cache keys for different top market coins views
  const CACHE_KEYS = {
    ALL: 'top_market_coins_all'
  };

  // Enhanced cache TTLs in seconds - longer TTLs for better cache performance
  const CACHE_TTL = {
    ALL: 600        // 10 minutes - moderate updates (increased from 5)
  };

  // Cache warming for frequently accessed data
  const WARMUP_KEYS = [
    CACHE_KEYS.ALL + '_1_50'
  ];

  // Warm up cache on startup
  setTimeout(() => {
    console.log('🔥 Warming up top market coins cache...');
    cacheOperations.warmup(WARMUP_KEYS);
  }, 5000); // Wait 5 seconds after startup

  // Get all top market coins with aggressive caching
  fastify.get('/', async (request, reply) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = Math.min(parseInt(request.query.limit) || 50, 100);
      
      // Create cache key
      const cacheKey = `${CACHE_KEYS.ALL}_${page}_${limit}`;
      
      // Check cache first
      const cachedData = cacheOperations.get(cacheKey);
      if (cachedData) {
        console.log(`🚀 Route-level cache HIT: ${cacheKey}`);
        
        // Add cache headers
        reply.header('X-Cache', 'HIT');
        reply.header('X-Cache-Key', cacheKey);
        reply.header('Cache-Control', `public, max-age=${CACHE_TTL.ALL}`);
        
        return {
          success: true,
          ...cachedData,
          source: 'route_cache',
          timestamp: new Date().toISOString()
        };
      }

      console.log(`🚀 Route-level cache MISS: ${cacheKey}`);

      // Fetch from database
      const [data, total] = await Promise.all([
        prisma.topMarketCoins.findMany({
          orderBy: { marketCapRank: 'asc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.topMarketCoins.count()
      ]);

      const result = {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };

      // Cache the result with longer TTL
      cacheOperations.set(cacheKey, result, CACHE_TTL.ALL);

      // Add cache headers
      reply.header('X-Cache', 'MISS');
      reply.header('X-Cache-Key', cacheKey);
      reply.header('Cache-Control', `public, max-age=${CACHE_TTL.ALL}`);

      return {
        success: true,
        ...result,
        source: 'database',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error fetching top market coins:', error);
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch top market coins',
        message: error.message
      };
    }
  });
}

module.exports = topMarketCoinsRoutes;
