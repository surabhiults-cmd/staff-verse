import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('🔧 Fixing roles table issue...\n');
console.log('Checking .env configuration:');
console.log('DB_NAME:', process.env.DB_NAME || 'hrms_database');
console.log('DB_USER:', process.env.DB_USER || 'postgres');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hrms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function fixRolesTable() {
  try {
    // Test connection
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Connected to database:', process.env.DB_NAME || 'hrms_database');
    console.log('✓ Database time:', result.rows[0].now, '\n');

    // Check if roles table exists
    console.log('Checking if roles table exists...');
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('✓ Roles table already exists!\n');
      
      // Check if it has data
      const roleCount = await pool.query('SELECT COUNT(*) FROM roles');
      console.log('Roles count:', roleCount.rows[0].count);
      
      if (parseInt(roleCount.rows[0].count) === 0) {
        console.log('Inserting roles...');
        await pool.query(`
          INSERT INTO roles (name, description) VALUES
          ('administrator', 'Full system access, manages users and configurations'),
          ('payroll_officer', 'Processes payroll and generates payslips'),
          ('viewer', 'Read-only access to reports and employee data')
          ON CONFLICT (name) DO NOTHING;
        `);
        console.log('✓ Roles inserted');
      }
    } else {
      console.log('✗ Roles table does NOT exist');
      console.log('Creating roles table...\n');
      
      // Create roles table
      await pool.query(`
        CREATE TABLE roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✓ Roles table created');

      // Insert roles
      await pool.query(`
        INSERT INTO roles (name, description) VALUES
        ('administrator', 'Full system access, manages users and configurations'),
        ('payroll_officer', 'Processes payroll and generates payslips'),
        ('viewer', 'Read-only access to reports and employee data');
      `);
      console.log('✓ Roles data inserted');
    }

    // Check for users table
    console.log('\nChecking users table...');
    const checkUsers = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!checkUsers.rows[0].exists) {
      console.log('Creating users table...');
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✓ Users table created');
    } else {
      console.log('✓ Users table exists');
    }

    console.log('\n✅ Roles and Users tables are ready!\n');
    console.log('You can now login or run: npm run create-tables (for all tables)\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check .env file exists in backend/ directory');
    console.error('2. Verify DB_PASSWORD is correct');
    console.error('3. Make sure database "hrms_database" exists');
    console.error('4. Check PostgreSQL is running');
    
    await pool.end();
    process.exit(1);
  }
}

fixRolesTable();



