const { cacheOperations } = require('../middleware/cache');

// Use centralized Prisma client
const prismaClient = require('../lib/prisma');

// Fastify plugin function
async function topCoinsRoutes(fastify, options) {
  const prisma = prismaClient.getClient();

  // Smart cache keys for top coins
  const CACHE_KEYS = {
    ALL: 'top_coins_all'
  };

  // Cache TTLs in seconds
  const CACHE_TTL = {
    ALL: 300        // 5 minutes - moderate updates
  };

  // Get all top coins with smart caching
  fastify.get('/', async (request, reply) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = Math.min(parseInt(request.query.limit) || 20, 100);
      
      // Create cache key
      const cacheKey = `${CACHE_KEYS.ALL}_${page}_${limit}`;
      
      // Check cache first
      const cachedData = cacheOperations.get(cacheKey);
      if (cachedData) {
        // Add cache headers
        reply.header('X-Cache', 'HIT');
        reply.header('X-Cache-Key', cacheKey);
        reply.header('Cache-Control', `public, max-age=${CACHE_TTL.ALL}`);
        
        return {
          success: true,
          ...cachedData,
          source: 'cache',
          timestamp: new Date().toISOString()
        };
      }

      // Fetch from database
      const [data, total] = await Promise.all([
        prisma.topCoins.findMany({
          orderBy: { rank: 'asc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.topCoins.count()
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

      // Cache the result
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
      console.error('Error fetching top coins:', error);
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch top coins',
        message: error.message
      };
    }
  });
}

module.exports = topCoinsRoutes;
