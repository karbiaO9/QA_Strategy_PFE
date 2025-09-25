require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const cacheUpdater = require('./services/cache-updater');

const routes = require('./routes');
const PORT = process.env.PORT || 5051;
const app = express();

app.set('trust proxy', 1);
app.set('x-powered-by', false);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: false,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
  hsts: false
}));

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/cache/stats'
});
app.use('/api/', limiter);

app.use((req, res, next) => {
  req.setTimeout(15000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1000000;
    if (duration > 100) {
      console.log(`🐌 Slow request: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
});

app.use('/', routes);

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const start = async () => {
  try {
    console.log('🚀 Starting MarketSaver Cache-First Server...');
    console.log('💾 Initializing cache population...');
    
    console.log('🔌 Testing database connection...');
    const dbConnected = await cacheUpdater.testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed. Cannot populate cache.');
    }
    console.log('✅ Database connection successful');
    
    console.log('📊 Populating all cache data from database...');
    await cacheUpdater.populateAllCache();
    console.log('✅ All cache data populated successfully');
    
    const cacheReadiness = cacheUpdater.getCacheReadinessStatus();
    if (!cacheReadiness.allReady) {
      console.log('⚠️ Cache readiness status:', cacheReadiness);
      throw new Error('Not all cache data was populated successfully');
    }
    console.log('🎯 All cache data verified and ready');
    
    console.log('📅 Starting cache update cron jobs...');
    cacheUpdater.start();
    
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
      }
    });
    
  } catch (err) {
    console.error('❌ Error starting server:', err);
    console.error('💥 Server startup failed. Exiting...');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
  
  try {
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

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

start();
