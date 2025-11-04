import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Support both connection string and individual config
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string (for Neon, Railway, etc.)
  // Parse connection string to ensure proper format
  let connectionString = process.env.DATABASE_URL;
  
  // Remove channel_binding if present (can cause issues with some clients)
  connectionString = connectionString.replace(/[?&]channel_binding=[^&]*/, '');
  
  poolConfig = {
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false, // Required for Neon SSL connection
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Increased to 30 seconds for cloud databases
    allowExitOnIdle: true, // Allow process to exit when pool is idle
  };
} else {
  // Use individual environment variables (for local development)
  poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hrms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pool = new Pool(poolConfig);

// Log database connection info (for debugging)
console.log('📊 Database Config:');
if (process.env.DATABASE_URL) {
  // Mask password in connection string for security
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log('  Connection String:', maskedUrl);
} else {
console.log('  Database:', process.env.DB_NAME || 'hrms_database');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Port:', process.env.DB_PORT || 5432);
console.log('  User:', process.env.DB_USER || 'postgres');
}

pool.on('connect', (client) => {
  console.log('✅ New client connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client', err);
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    severity: err.severity
  });
  // Don't exit on error - let the pool handle reconnection
});

// Test connection on startup
pool.query('SELECT NOW() as current_time, version() as pg_version')
  .then((result) => {
    console.log('✅ Database connection test successful');
    console.log('  Current time:', result.rows[0].current_time);
    console.log('  PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
  })
  .catch((err) => {
    console.error('❌ Database connection test failed:', err.message);
    console.error('Please check your DATABASE_URL in .env file');
});

export default pool;
