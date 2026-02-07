require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const cacheUpdater = require('./services/cache-updater');

const app = express();
const PORT = process.env.PORT || 5051;

app.set('trust proxy', 1);
app.set('x-powered-by', false);
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], optionsSuccessStatus: 200 }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false, hsts: false }));
app.use(compression({ level: 6, threshold: 1024 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: 'Too many requests.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/cache/stats'
}));

app.use((req, res, next) => {
  req.setTimeout(15000, () => res.status(408).json({ error: 'Request timeout' }));
  next();
});

app.use('/', routes);

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

async function start() {
  try {
    const conn = await cacheUpdater.testConnection();
    if (!conn.ok) throw new Error(conn.error || 'Supabase connection failed');
    await cacheUpdater.populateAllCache();
    const status = cacheUpdater.getCacheReadinessStatus();
    if (!status.allReady) throw new Error('Cache not fully populated');
    cacheUpdater.start();
    app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    const cause = err.cause ? (err.cause.code || err.cause.message || err.cause) : '';
    const msg = cause ? `${err.message} — ${cause}` : err.message;
    const hint = /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(msg) ? ' Check .env SUPABASE_URL and network.' : '';
    console.error('Startup failed:', msg + hint);
    process.exit(1);
  }
}

async function shutdown(signal) {
  await cacheUpdater.shutdown();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (err) => { console.error(err); shutdown('uncaughtException'); });
process.on('unhandledRejection', (_, err) => { console.error(err); shutdown('unhandledRejection'); });

start();
