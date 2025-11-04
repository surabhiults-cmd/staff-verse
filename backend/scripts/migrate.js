import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    // Test database connection first
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful\n');

    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    console.log('Starting database migrations...\n');

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
          const trimmedStatement = statement.trim();
          if (trimmedStatement) {
            try {
              await pool.query(trimmedStatement);
            } catch (error) {
              // Ignore "already exists" errors and extension errors
              if (error.message.includes('already exists') || 
                  error.message.includes('extension') ||
                  error.message.includes('duplicate key')) {
                console.log(`  ⚠ Skipped: ${error.message.split('\n')[0]}`);
              } else {
                console.error(`  ✗ Error: ${error.message}`);
                throw error;
              }
            }
          }
        }
        
        console.log(`✓ Completed: ${file}\n`);
      }
    }

    console.log('✅ All migrations completed successfully!');
    console.log('\nNext step: Run "npm run seed" to create admin user');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file has correct database credentials');
    console.error('3. Ensure database "hrms_db" exists');
    console.error('   Run: CREATE DATABASE hrms_db;');
    await pool.end();
    process.exit(1);
  }
}

runMigrations();
