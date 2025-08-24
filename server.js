require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const cacheUpdater = require('./services/cache-updater');

// Import routes
const routes = require('./routes');

// Configuration
const PORT = process.env.PORT || 5050;
const app = express();

// Comprehensive CORS configuration - allow all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: false, // Set to false when origin is *
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Server readiness middleware - check if cache is populated before serving API requests
let serverReady = false;
app.use((req, res, next) => {
  // Allow health and cache endpoints even if server is not ready
  if (req.path === '/health' || req.path === '/cache/stats' || req.path === '/cache/health' || req.path === '/') {
    return next();
  }
  
  // For API endpoints, check if server is ready
  if (req.path.startsWith('/api/') && !serverReady) {
    return res.status(503).json({
      success: false,
      error: 'Server not ready',
      message: 'Server is still initializing cache. Please try again in a few moments.',
      status: 'initializing'
    });
  }
  
  next();
});

// Mount all routes
app.use('/', routes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start the server
const start = async () => {
  try {
    console.log('🚀 Starting MarketSaver Cache-First Server...');
    console.log('💾 Initializing cache population...');
    
    // Test database connection first
    console.log('🔌 Testing database connection...');
    const dbConnected = await cacheUpdater.testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed. Cannot populate cache.');
    }
    console.log('✅ Database connection successful');
    
    // First, populate all cache data before starting cron jobs
    console.log('📊 Populating all cache data from database...');
    await cacheUpdater.populateAllCache();
    console.log('✅ All cache data populated successfully');
    
    // Verify cache is ready
    const cacheReadiness = cacheUpdater.getCacheReadinessStatus();
    if (!cacheReadiness.allReady) {
      console.log('⚠️ Cache readiness status:', cacheReadiness);
      throw new Error('Not all cache data was populated successfully');
    }
    console.log('🎯 All cache data verified and ready');
    
    // Now start the cache updater service with cron jobs
    console.log('📅 Starting cache update cron jobs...');
    cacheUpdater.start();
    
    // Start the Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MarketSaver Cache-First Server started on port ${PORT}`);
      console.log(`📊 Server ID: ${process.env.SERVER_ID || 'cache-first-v3'}`);
      console.log(`💾 Cache-first architecture enabled`);
      console.log(`📅 Cache update cron jobs started`);
      console.log(`🔧 All data served from cache - no database queries`);
      console.log(`🌍 CORS enabled for all origins (*)`);
      console.log(`🔒 Server listening on 0.0.0.0:${PORT}`);
      
      console.log('\n📅 SCHEDULED CACHE UPDATES:');
      console.log('═'.repeat(60));
      console.log('📊 Market data: Every 2 hours');
      console.log('🪙 Trending coins: Every 8 hours');
      console.log('📈 Top gainers: Every 12 hours');
      console.log('🏆 Top coins: Every 4 hours');
      console.log('🏆 Top market coins: Every 4 hours');
      console.log('📰 News: Every 6 hours');
      console.log('🏦 Exchanges: Every 2 weeks (Sunday 2 AM UTC)');
      
      console.log('\n🧪 Test endpoints: GET /api/*');
      console.log('🏥 Health check: GET /health');
      console.log('📊 Cache stats: GET /cache/stats');
      
      console.log('\n💾 CACHE STATUS:');
      console.log('═'.repeat(60));
      console.log(`📊 Cache items: ${cacheReadiness.totalKeys}`);
      console.log(`✅ Populated items: ${cacheReadiness.populatedKeys}`);
      console.log(`🎯 All ready: ${cacheReadiness.allReady ? 'YES' : 'NO'}`);
      
      console.log('\n🎯 CACHE READINESS:');
      console.log('═'.repeat(60));
      console.log(`📊 Total cache keys: ${cacheReadiness.totalKeys}`);
      console.log(`✅ Populated keys: ${cacheReadiness.populatedKeys}`);
      console.log(`🎯 All ready: ${cacheReadiness.allReady ? 'YES' : 'NO'}`);
      
      if (cacheReadiness.allReady) {
        console.log('🚀 Server is ready to serve API requests!');
        serverReady = true; // Set server as ready
      }
    });
    
  } catch (err) {
    console.error('❌ Error starting server:', err);
    console.error('💥 Server startup failed. Exiting...');
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
  
  try {
    // Stop cache updater service
    await cacheUpdater.shutdown();
    console.log('✅ Cache updater service stopped');
    
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
start();
