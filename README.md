# MarketSaver Server - Cache-First Architecture

A high-performance cryptocurrency data server that serves data exclusively from memory cache, with automatic updates via cron jobs.

## 🚀 **New Architecture Overview**

### **Cache-First Design:**
- **All API responses come from memory cache** - no database queries during API calls
- **Automatic cache updates** via scheduled cron jobs
- **Sub-millisecond response times** for all endpoints
- **High availability** - API works even if database is temporarily unavailable

### **Data Flow:**
1. **Other server saves data to database** (via cron jobs)
2. **This server fetches data from DB and caches it** (via cron jobs)
3. **API serves data ONLY from cache** (never hits database)
4. **Automatic cache refresh** based on data volatility

## 🏗️ **System Components**

### **Core Services:**
- **Express Server** - Handles HTTP requests and responses
- **In-Memory Cache** - Stores all database data in server memory
- **Cache Updater Service** - Runs cron jobs to refresh cache from database
- **PostgreSQL Connection** - Simple, robust database connection for cache updates only

### **Cache Update Schedule:**
- **📊 Market Data:** Every 2 hours
- **🪙 Trending Coins:** Every 8 hours
- **📈 Top Gainers:** Every 12 hours
- **🏆 Top Coins:** Every 4 hours
- **🏆 Top Market Coins:** Every 4 hours
- **📰 News:** Every 6 hours
- **🏦 Exchanges:** Every 2 weeks (Sunday 2 AM UTC)

## 🛠️ **Installation & Setup**

### **Prerequisites:**
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### **Install Dependencies:**
```bash
npm install
```

### **Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/marketsaver?schema=public"

# Server
PORT=5050
NODE_ENV=production
```

### **Start Server:**
```bash
npm start
```

## 📡 **API Endpoints**

### **Data Endpoints (Cache-First):**
All endpoints return data from cache with no database queries:

- `GET /api/market-data` - All market data
- `GET /api/news` - All news articles
- `GET /api/trending-coins` - All trending coins
- `GET /api/top-gainers` - All top gainers
- `GET /api/top-coins` - All top coins
- `GET /api/top-market-coins` - All top market coins
- `GET /api/exchanges` - All exchanges

### **Cache Management:**
- `GET /cache/stats` - Cache statistics and performance
- `GET /cache/health` - Cache health status
- `POST /cache/clear` - Clear cache by type or all
- `POST /cache/refresh` - Force refresh cache from database

### **System Endpoints:**
- `GET /` - Server information and API docs
- `GET /health` - Server and database health check

## 🔧 **Cache Management**

### **Cache Types:**
- **Market Data:** 2 hours TTL
- **Trending Coins:** 8 hours TTL
- **Top Gainers:** 12 hours TTL
- **Top Coins:** 4 hours TTL
- **Top Market Coins:** 4 hours TTL
- **News:** 6 hours TTL
- **Exchanges:** 2 weeks TTL

### **Cache Operations:**
- **Automatic expiration** based on TTL
- **Memory management** with configurable limits
- **Statistics tracking** (hit rate, miss rate, performance)
- **Health monitoring** with detailed metrics

## 📊 **Performance Benefits**

### **Speed:**
- **Sub-millisecond response times** for all endpoints
- **No database latency** during API calls
- **Instant data retrieval** from memory

### **Scalability:**
- **High concurrent user support** (50k+ users)
- **Memory-efficient caching** with automatic cleanup
- **Load distribution** - cache reduces database load

### **Reliability:**
- **API continues working** even if database is down
- **Graceful degradation** with cache fallbacks
- **Automatic recovery** when database comes back online

## 🧪 **Testing**

### **Run Tests:**
```bash
npm test
```

### **Test Coverage:**
- Cache-first API endpoints
- Cache management operations
- Server health and performance
- Error handling and edge cases

## 🚨 **Error Handling**

### **Cache Miss Scenarios:**
- Returns 503 status with helpful message
- Indicates cache is being populated
- Suggests retry after cache update

### **Database Issues:**
- Cache continues serving stale data
- Automatic retry mechanisms
- Graceful degradation

## 🔄 **Development vs Production**

### **Development Mode:**
- Cron jobs are disabled
- Cache can be manually refreshed
- Detailed logging enabled

### **Production Mode:**
- All cron jobs active
- Automatic cache management
- Optimized performance settings

## 📈 **Monitoring & Metrics**

### **Cache Statistics:**
- Hit rate and miss rate
- Memory usage
- Response times
- Cache size and efficiency

### **Health Checks:**
- Server status
- Database connectivity
- Cache health
- Memory utilization

## 🚀 **Deployment**

### **Production Considerations:**
- **Memory monitoring** - ensure sufficient RAM for cache
- **Process management** - use PM2 or similar
- **Load balancing** - multiple instances for high availability
- **Monitoring** - cache performance metrics

### **Scaling:**
- **Horizontal scaling** - multiple cache instances
- **Cache sharing** - Redis for distributed caching (optional)
- **Load distribution** - round-robin or sticky sessions

## 🔮 **Future Enhancements**

### **Planned Features:**
- **Redis integration** for distributed caching
- **Cache warming strategies** for better hit rates
- **Advanced monitoring** with Grafana dashboards
- **Cache invalidation** based on data changes

---

**MarketSaver Server v3.0** - The ultimate cache-first cryptocurrency data API! 🚀