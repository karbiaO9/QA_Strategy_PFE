const { Pool } = require('pg');

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  // Initialize database connection
  async connect() {
    try {
      if (this.pool && this.isConnected) {
        return this.pool;
      }

      console.log('🔌 Connecting to PostgreSQL database...');
      
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        // Simple, reliable connection settings
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
        maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
        // Enable SSL for production
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      this.retryCount = 0;
      console.log('✅ PostgreSQL connection established successfully');
      
      // Handle pool errors
      this.pool.on('error', (err) => {
        console.error('❌ Unexpected error on idle client', err);
        this.isConnected = false;
        this.reconnect();
      });

      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.isConnected = false;
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying connection (${this.retryCount}/${this.maxRetries}) in 5 seconds...`);
        setTimeout(() => this.connect(), 5000);
      } else {
        console.error('❌ Max retry attempts reached. Database connection failed.');
        throw error;
      }
    }
  }

  // Reconnect method
  async reconnect() {
    console.log('🔄 Attempting to reconnect to database...');
    this.isConnected = false;
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    await this.connect();
  }

  // Get database pool
  async getPool() {
    if (!this.pool || !this.isConnected) {
      await this.connect();
    }
    return this.pool;
  }

  // Execute a query
  async query(text, params = []) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('❌ Query execution failed:', error.message);
      
      // If it's a connection error, try to reconnect
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.message.includes('connection')) {
        console.log('🔄 Connection error detected, attempting reconnect...');
        await this.reconnect();
        // Retry the query once
        const pool = await this.getPool();
        return await pool.query(text, params);
      }
      
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.query('SELECT NOW() as timestamp, 1 as status');
      return { 
        status: 'healthy', 
        message: 'Database connection is working',
        timestamp: result.rows[0].timestamp
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: 'Database connection failed', 
        error: error.message 
      };
    }
  }

  // Close connection
  async close() {
    if (this.pool) {
      console.log('🔌 Closing database connection...');
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('✅ Database connection closed');
    }
  }
}

// Create singleton instance
const db = new DatabaseConnection();

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await db.close();
  process.exit(0);
});

module.exports = db;
