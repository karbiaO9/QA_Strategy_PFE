const { cacheOperations } = require('../middleware/cache');

// Use centralized Prisma client
const prismaClient = require('../lib/prisma');

// Fastify plugin function
async function trendingCoinsRoutes(fastify, options) {
  const prisma = prismaClient.getClient();

  // Smart cache keys for trending coins
  const CACHE_KEYS = {
    ALL: 'trending_coins_all'
  };

  // Cache TTLs in seconds
  const CACHE_TTL = {
    ALL: 300        // 5 minutes - moderate updates
  };

  // Utility function to handle BigInt serialization
  function serializeBigInts(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return Number(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(serializeBigInts);
    }
    
    if (typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = serializeBigInts(value);
      }
      return result;
    }
    
    return obj;
  }

  // Get all trending coins with smart caching
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
        prisma.trendingCoins.findMany({
          orderBy: { score: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.trendingCoins.count()
      ]);

      // Serialize BigInts to prevent serialization errors
      const serializedData = serializeBigInts(data);

      const result = {
        data: serializedData || [],
        pagination: {
          page,
          limit,
          total: total || 0,
          pages: Math.ceil((total || 0) / limit),
          hasNext: page < Math.ceil((total || 0) / limit),
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
      console.error('Error fetching trending coins:', error);
      
      // Check if it's a database connection error
      if (error.message.includes('Cannot read properties of undefined') || 
          error.message.includes('findMany')) {
        return {
          success: true,
          data: [],
          pagination: {
            page: parseInt(request.query.page) || 1,
            limit: Math.min(parseInt(request.query.limit) || 20, 100),
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false
          },
          source: 'database',
          timestamp: new Date().toISOString(),
          note: 'Database connection issue - returning empty result'
        };
      }
      
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch trending coins',
        message: error.message
      };
    }
  });
}

module.exports = trendingCoinsRoutes;
