import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('🔍 Verifying Database Connection...\n');
console.log('Configuration from .env:');
console.log('  DB_HOST:', process.env.DB_HOST || 'localhost (default)');
console.log('  DB_PORT:', process.env.DB_PORT || '5432 (default)');
console.log('  DB_NAME:', process.env.DB_NAME || 'hrms_database (default)');
console.log('  DB_USER:', process.env.DB_USER || 'postgres (default)');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET ❌');
console.log('');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hrms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function verifyDatabase() {
  try {
    console.log('Testing connection...');
    const result = await pool.query('SELECT current_database(), current_user, version()');
    
    console.log('✅ Connection successful!');
    console.log('  Database:', result.rows[0].current_database);
    console.log('  User:', result.rows[0].current_user);
    console.log('  PostgreSQL Version:', result.rows[0].version.split(',')[0]);
    console.log('');

    // Check if roles table exists in THIS database
    console.log('Checking for roles table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ Roles table EXISTS in database:', result.rows[0].current_database);
      
      const count = await pool.query('SELECT COUNT(*) FROM roles');
      console.log('  Roles count:', count.rows[0].count);
      
      // Show all tables
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('\n📋 Tables in database:');
      tables.rows.forEach(row => {
        console.log('  -', row.table_name);
      });
      
      if (tables.rows.length === 0) {
        console.log('  ⚠️  No tables found!');
      }
    } else {
      console.log('❌ Roles table DOES NOT exist in database:', result.rows[0].current_database);
      console.log('\n💡 Solution: Run "npm run fix-roles" to create it');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check .env file exists in backend/ directory');
    console.error('2. Verify DB_PASSWORD is correct');
    console.error('3. Make sure database exists');
    console.error('4. Check PostgreSQL is running');
    
    await pool.end();
    process.exit(1);
  }
}

verifyDatabase();



