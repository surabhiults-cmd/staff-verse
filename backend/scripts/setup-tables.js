import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupTables() {
  console.log('🔧 Setting up database tables...\n');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hrms_database',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Test connection
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✓ Connected to database:', process.env.DB_NAME || 'hrms_database\n');

    // Read and execute SQL file
    const sqlFilePath = path.join(__dirname, '../setup-any-db.sql');
    console.log('Reading SQL file...');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('\\'));

    console.log(`Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await pool.query(statement);
          process.stdout.write('.');
        } catch (error) {
          // Ignore errors for existing objects
          if (
            !error.message.includes('already exists') &&
            !error.message.includes('duplicate key') &&
            !error.message.includes('extension') &&
            !error.message.includes('cannot create index')
          ) {
            console.error(`\n\n✗ Error in statement ${i + 1}:`);
            console.error(error.message);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
            throw error;
          }
        }
      }
    }

    console.log('\n\n✅ All tables created successfully!\n');
    console.log('Next step: Run "npm run seed" to create admin user\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file has correct credentials:');
    console.error('   - DB_NAME=hrms_database');
    console.error('   - DB_USER=postgres');
    console.error('   - DB_PASSWORD=your_password');
    console.error('3. Ensure database "hrms_database" exists');
    
    await pool.end();
    process.exit(1);
  }
}

setupTables();


