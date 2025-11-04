import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function testConnection() {
  console.log('🔌 Testing Neon Database Connection...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  // Clean connection string (remove channel_binding)
  let connectionString = process.env.DATABASE_URL;
  connectionString = connectionString.replace(/[?&]channel_binding=[^&]*/, '');

  console.log('Connection String (masked):', connectionString.replace(/:[^:@]+@/, ':****@'));
  console.log('');

  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log('Attempting to connect...');
    const startTime = Date.now();
    
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version, current_database() as db_name');
    
    const connectionTime = Date.now() - startTime;
    
    console.log('✅ Connection successful!');
    console.log(`   Connection time: ${connectionTime}ms`);
    console.log(`   Database: ${result.rows[0].db_name}`);
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${result.rows[0].pg_version.split(',')[0]}`);
    console.log('');
    
    // Test a simple query
    console.log('Testing query...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name 
      LIMIT 5
    `);
    
    console.log('✅ Query test successful!');
    if (tablesResult.rows.length > 0) {
      console.log('   Found tables:', tablesResult.rows.map(r => r.table_name).join(', '));
    } else {
      console.log('   ⚠️  No tables found - you may need to run migrations');
    }
    
    await pool.end();
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.message.includes('timeout')) {
      console.error('\n💡 Tips:');
      console.error('   1. Check if your Neon database is active');
      console.error('   2. Verify the connection string is correct');
      console.error('   3. Try using the direct connection endpoint instead of pooler');
      console.error('   4. Check your network/firewall settings');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();
