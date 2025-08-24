const { cacheOperations } = require('../middleware/cache');

// Use centralized Prisma client
const prismaClient = require('../lib/prisma');

// Fastify plugin function
async function marketDataRoutes(fastify, options) {
  const prisma = prismaClient.getClient();

  // Smart cache keys for market data
  const CACHE_KEYS = {
    ALL: 'market_data_all'
  };

  // Cache TTLs in seconds
  const CACHE_TTL = {
    ALL: 300        // 5 minutes - moderate updates
  };

  // Get all market data with smart caching
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
        prisma.marketData.findMany({
          orderBy: { timestamp: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.marketData.count()
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
      console.error('Error fetching market data:', error);
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch market data',
        message: error.message
      };
    }
  });

  // Cache invalidation endpoint
  fastify.post('/invalidate-cache', async (request, reply) => {
    try {
      const { pattern } = request.body;
      
      if (!pattern) {
        reply.status(400);
        return {
          success: false,
          error: 'Pattern is required',
          message: 'Please provide a cache pattern to invalidate'
        };
      }

      // Invalidate cache based on pattern
      const invalidatedKeys = cacheOperations.invalidateByPattern(pattern);
      
      console.log(`🗑️ Invalidated ${invalidatedKeys.length} cache keys matching: ${pattern}`);

      return {
        success: true,
        message: `Successfully invalidated ${invalidatedKeys.length} cache keys`,
        invalidatedKeys,
        pattern,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error invalidating cache:', error);
      reply.status(500);
      return {
        success: false,
        error: 'Failed to invalidate cache',
        message: error.message
      };
    }
  });
}

module.exports = marketDataRoutes;
