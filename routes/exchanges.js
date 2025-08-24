const { cacheOperations } = require('../middleware/cache');

// Use centralized Prisma client
const prismaClient = require('../lib/prisma');

// Fastify plugin function
async function exchangesRoutes(fastify, options) {
  const prisma = prismaClient.getClient();

  // Smart cache keys for exchanges
  const CACHE_KEYS = {
    ALL: 'exchanges_all'
  };

  // Cache TTLs in seconds
  const CACHE_TTL = {
    ALL: 3600       // 1 hour - rarely changing
  };

  // Get all exchanges with smart caching
  fastify.get('/', async (request, reply) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = Math.min(parseInt(request.query.limit) || 20, 100);
      const sortBy = request.query.sortBy || 'trustScoreRank';
      const sortOrder = request.query.sortOrder === 'asc' ? 'asc' : 'desc';
      
      // Create cache key
      const cacheKey = `${CACHE_KEYS.ALL}_${page}_${limit}_${sortBy}_${sortOrder}`;
      
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
        prisma.exchange.findMany({
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.exchange.count()
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
        },
        sorting: {
          sortBy,
          sortOrder
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
      console.error('Error fetching exchanges:', error);
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch exchanges',
        message: error.message
      };
    }
  });
}

module.exports = exchangesRoutes;
