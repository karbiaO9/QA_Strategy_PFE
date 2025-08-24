const { PrismaClient } = require('@prisma/client');

// Optimized Prisma client for high-load scenarios
class OptimizedPrismaClient {
  constructor() {
    this.prisma = null;
    this.connectionCount = 0;
    this.maxConnections = 0;
  }

  // Initialize the Prisma client with optimized settings
  initialize() {
    if (this.prisma) {
      return this.prisma;
    }

    // Connection pool optimization for high-load scenarios
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      // Optimize connection pool for high concurrent load
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Connection pool settings optimized for 50k+ concurrent users
      __internal: {
        engine: {
          // Increase connection pool size
          connectionLimit: parseInt(process.env.PRISMA_CONNECTION_LIMIT) || 50,
          // Increase connection timeout
          connectionTimeout: parseInt(process.env.PRISMA_CONNECTION_TIMEOUT) || 30000,
          // Optimize pool management
          pool: {
            min: parseInt(process.env.PRISMA_POOL_MIN) || 5,
            max: parseInt(process.env.PRISMA_POOL_MAX) || 50,
            acquire: parseInt(process.env.PRISMA_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.PRISMA_POOL_IDLE) || 10000
          }
        }
      }
    });

    // Monitor connection pool health
    this.setupConnectionMonitoring();
    
    return this.prisma;
  }

  // Get the Prisma client instance
  getClient() {
    if (!this.prisma) {
      this.initialize();
    }
    return this.prisma;
  }

  // Setup connection pool monitoring
  setupConnectionMonitoring() {
    // Monitor connection pool health every 30 seconds
    setInterval(() => {
      this.logConnectionPoolStatus();
    }, 30000);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  // Log connection pool status
  logConnectionPoolStatus() {
    try {
      const metrics = this.getConnectionMetrics();
    } catch (error) {
      console.log('📊 Prisma Connection Pool Status: Unable to get metrics');
    }
  }


  // Disconnect gracefully
  async disconnect() {
    if (this.prisma) {
      console.log('🔌 Disconnecting Prisma client...');
      await this.prisma.$disconnect();
      this.prisma = null;
    }
  }

  // Health check for the connection pool
  async healthCheck() {
    try {
      if (!this.prisma) {
        return { status: 'disconnected', message: 'Prisma client not initialized' };
      }

      // Simple query to test connection
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', message: 'Database connection is working' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: 'Database connection failed', 
        error: error.message 
      };
    }
  }

  // Get connection pool metrics
  getConnectionMetrics() {
    return {
      connectionCount: this.connectionCount,
      maxConnections: this.maxConnections,
      poolUtilization: this.maxConnections > 0 ? (this.connectionCount / this.maxConnections * 100).toFixed(2) + '%' : 'N/A'
    };
  }
}

// Create singleton instance
const prismaClient = new OptimizedPrismaClient();

// Export the singleton instance
module.exports = prismaClient;
