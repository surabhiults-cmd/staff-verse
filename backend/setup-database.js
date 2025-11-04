import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🔧 HRMS Database Setup\n');
  
  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found!');
    console.log('\nPlease create a .env file with the following content:');
    console.log(`
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
`);
    console.log('Then run this script again.\n');
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database first
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Step 1: Create database if it doesn't exist
    console.log('Step 1: Checking if database exists...');
    const dbName = process.env.DB_NAME || 'hrms_db';
    
    try {
      await pool.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
      console.log(`✓ Database '${dbName}' already exists`);
    } catch (error) {
      console.log(`Creating database '${dbName}'...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database '${dbName}' created successfully`);
    }

    // Step 2: Close connection to default database
    await pool.end();

    // Step 3: Connect to the new database
    console.log('\nStep 2: Connecting to database...');
    const appPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: dbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    await appPool.query('SELECT NOW()');
    console.log('✓ Connected to database\n');

    // Step 4: Run migrations
    console.log('Step 3: Running migrations...\n');
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = sql.split(';').filter(s => s.trim().length > 0);

      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed) {
          try {
            await appPool.query(trimmed);
          } catch (error) {
            if (!error.message.includes('already exists') && 
                !error.message.includes('duplicate key') &&
                !error.message.includes('extension')) {
              throw error;
            }
          }
        }
      }
      console.log(`✓ Completed: ${file}\n`);
    }

    console.log('✅ Database setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Run: npm run seed (to create admin user)');
    console.log('2. Start server: npm run start:dev\n');

    await appPool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file credentials are correct');
    console.error('3. Ensure PostgreSQL user has permission to create databases');
    process.exit(1);
  }
}

setupDatabase();


