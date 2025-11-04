import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixMissingTables() {
  try {
    console.log('🔧 Fixing missing tables...\n');

    // Create allowances table
    console.log('Creating allowances table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS allowances (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_taxable BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Allowances table created');

    // Create deductions table
    console.log('Creating deductions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deductions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Deductions table created');

    // Create allowance_deduction_mappings table
    console.log('Creating allowance_deduction_mappings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS allowance_deduction_mappings (
        id SERIAL PRIMARY KEY,
        job_role_id INTEGER REFERENCES job_roles(id) ON DELETE CASCADE,
        employment_type_id INTEGER REFERENCES employment_types(id) ON DELETE CASCADE,
        allowance_id INTEGER REFERENCES allowances(id) ON DELETE CASCADE,
        deduction_id INTEGER REFERENCES deductions(id) ON DELETE CASCADE,
        default_amount DECIMAL(12, 2) DEFAULT 0,
        is_mandatory BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Allowance-deduction mappings table created');

    // Insert allowances
    await pool.query(`
      INSERT INTO allowances (name, description, is_taxable) VALUES
      ('Special Allowance', 'Special allowance component', true),
      ('Transport Allowance', 'Transportation allowance', true),
      ('Medical Allowance', 'Medical expenses allowance', true),
      ('Food Allowance', 'Food and meal allowance', false)
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✓ Allowances data inserted');

    // Insert deductions
    await pool.query(`
      INSERT INTO deductions (name, description) VALUES
      ('GPF & Recovery', 'General Provident Fund and Recovery'),
      ('SLI', 'State Life Insurance'),
      ('GIS', 'Group Insurance Scheme'),
      ('Festival Bonus', 'Festival Bonus deduction'),
      ('Home Building Advance', 'HBA deduction'),
      ('Income Tax', 'Tax deduction'),
      ('Rent Deduction', 'Housing rent deduction'),
      ('LIC Contribution', 'Life Insurance Corporation contribution'),
      ('Medisep', 'Medical Insurance'),
      ('Professional Tax', 'Professional tax deduction')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✓ Deductions data inserted');

    // Create payroll_components table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payroll_components (
        id SERIAL PRIMARY KEY,
        payroll_record_id INTEGER REFERENCES payroll_records(id) ON DELETE CASCADE,
        component_type VARCHAR(20) NOT NULL,
        component_name VARCHAR(100) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Payroll components table created\n');

    console.log('✅ All missing tables created!\n');
    console.log('Now you can run: npm run seed-payroll\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nMake sure basic tables exist first: npm run create-tables');
    await pool.end();
    process.exit(1);
  }
}

fixMissingTables();



