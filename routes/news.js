const { cacheOperations } = require('../middleware/cache');

// Use centralized Prisma client
const prismaClient = require('../lib/prisma');

// Fastify plugin function
async function newsRoutes(fastify, options) {
  const prisma = prismaClient.getClient();

  // Smart cache keys for different news views
  const CACHE_KEYS = {
    ALL: 'news_all'
  };

  // Enhanced cache TTLs in seconds
  const CACHE_TTL = {
    ALL: 300        // 5 minutes
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

  // Get all news with pagination, filtering, and search (main endpoint)
  fastify.get('/', async (request, reply) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = Math.min(parseInt(request.query.limit) || 20, 100);
      const source = request.query.source;
      const category = request.query.category;
      const search = request.query.search;
      const sortBy = request.query.sortBy || 'publishedOn';
      const sortOrder = request.query.sortOrder === 'asc' ? 'asc' : 'desc';
      
      // Create cache key based on all query parameters
      const cacheKey = `${CACHE_KEYS.ALL}_${page}_${limit}_${source || 'all'}_${category || 'all'}_${search || 'none'}_${sortBy}_${sortOrder}`;
      
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

      // Build where clause
      const where = {};
      if (source) where.source = source;
      if (category) where.categories = { has: category };
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { body: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Fetch from database
      const [data, total] = await Promise.all([
        prisma.news.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            title: true,
            body: true,
            url: true,
            imageUrl: true,
            source: true,
            categories: true,
            publishedOn: true,
            publishedTimestamp: true,
            lang: true
          }
        }),
        prisma.news.count({ where })
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
        },
        filters: {
          source: source || null,
          category: category || null,
          search: search || null,
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
      console.error('Error fetching news:', error);
      
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
          filters: {
            source: request.query.source || null,
            category: request.query.category || null,
            search: request.query.search || null,
            sortBy: request.query.sortBy || 'publishedOn',
            sortOrder: request.query.sortOrder === 'asc' ? 'asc' : 'desc'
          },
          source: 'database',
          timestamp: new Date().toISOString(),
          note: 'Database connection issue - returning empty result'
        };
      }
      
      // Return empty result instead of 500 error
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
        filters: {
          source: request.query.source || null,
          category: request.query.category || null,
          search: request.query.search || null,
          sortBy: request.query.sortBy || 'publishedOn',
          sortOrder: request.query.sortOrder === 'asc' ? 'asc' : 'desc'
        },
        source: 'database',
        timestamp: new Date().toISOString(),
        note: 'No news data available yet'
      };
    }
  });
}

module.exports = newsRoutes;
