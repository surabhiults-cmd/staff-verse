import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hrms_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function createTables() {
  try {
    console.log('🔧 Creating database tables...\n');
    console.log('Database:', process.env.DB_NAME || 'hrms_database');
    console.log('User:', process.env.DB_USER || 'postgres');
    console.log('Host:', process.env.DB_HOST || 'localhost\n');

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✓ Connected to database\n');

    // Create roles table first
    console.log('Creating roles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
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
      ('viewer', 'Read-only access to reports and employee data')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✓ Roles data inserted\n');

    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
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
    console.log('✓ Users table created\n');

    // Create other essential tables
    console.log('Creating departments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Departments table created');

    console.log('Creating job_roles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Job roles table created');

    console.log('Creating employment_types table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employment_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Employment types table created');

    console.log('Creating employee_categories table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Employee categories table created');

    console.log('Creating employees table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        contact_phone VARCHAR(20),
        contact_email VARCHAR(255),
        residential_address TEXT,
        date_of_joining DATE NOT NULL,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        job_role_id INTEGER REFERENCES job_roles(id) ON DELETE SET NULL,
        employment_type_id INTEGER REFERENCES employment_types(id) ON DELETE SET NULL,
        employee_category_id INTEGER REFERENCES employee_categories(id) ON DELETE SET NULL,
        bank_account_number VARCHAR(50),
        bank_ifsc_code VARCHAR(20),
        bank_name VARCHAR(100),
        basic_pay DECIMAL(12, 2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Employees table created\n');

    // Create remaining essential tables for payroll
    console.log('Creating additional tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hra_configurations (
        id SERIAL PRIMARY KEY,
        employee_category_id INTEGER REFERENCES employee_categories(id) ON DELETE CASCADE,
        percentage DECIMAL(5, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_category_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS da_configurations (
        id SERIAL PRIMARY KEY,
        employee_category_id INTEGER REFERENCES employee_categories(id) ON DELETE CASCADE,
        percentage DECIMAL(5, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_category_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS working_days (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        days_worked DECIMAL(5, 2) NOT NULL,
        total_days DECIMAL(5, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, month, year)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payroll_records (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        basic_pay DECIMAL(12, 2) DEFAULT 0,
        dearness_allowance DECIMAL(12, 2) DEFAULT 0,
        house_rent_allowance DECIMAL(12, 2) DEFAULT 0,
        special_allowance DECIMAL(12, 2) DEFAULT 0,
        employer_nps_contribution DECIMAL(12, 2) DEFAULT 0,
        total_earnings DECIMAL(12, 2) DEFAULT 0,
        gpf_recovery DECIMAL(12, 2) DEFAULT 0,
        sli DECIMAL(12, 2) DEFAULT 0,
        gis DECIMAL(12, 2) DEFAULT 0,
        festival_bonus DECIMAL(12, 2) DEFAULT 0,
        home_building_advance DECIMAL(12, 2) DEFAULT 0,
        income_tax DECIMAL(12, 2) DEFAULT 0,
        rent_deduction DECIMAL(12, 2) DEFAULT 0,
        lic_contribution DECIMAL(12, 2) DEFAULT 0,
        medisep DECIMAL(12, 2) DEFAULT 0,
        additional_deductions DECIMAL(12, 2) DEFAULT 0,
        total_deductions DECIMAL(12, 2) DEFAULT 0,
        net_payable DECIMAL(12, 2) DEFAULT 0,
        days_worked DECIMAL(5, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, month, year)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payslips (
        id SERIAL PRIMARY KEY,
        payroll_record_id INTEGER UNIQUE REFERENCES payroll_records(id) ON DELETE CASCADE,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        pdf_path VARCHAR(500),
        excel_path VARCHAR(500),
        email_sent BOOLEAN DEFAULT false,
        email_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action_type VARCHAR(50) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Now create indexes AFTER tables exist
    console.log('Creating indexes...');
    try {
      await pool.query('CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_employees_job_role ON employees(job_role_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_employees_category ON employees(employee_category_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_payroll_employee_month_year ON payroll_records(employee_id, month, year)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_working_days_employee_month_year ON working_days(employee_id, month, year)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id)');
      console.log('✓ Indexes created');
    } catch (idxError) {
      // Index creation errors are not critical
      console.log('⚠ Some indexes may already exist');
    }

    // Insert HRA and DA configurations
    await pool.query(`
      INSERT INTO hra_configurations (employee_category_id, percentage) VALUES
      ((SELECT id FROM employee_categories WHERE name = 'Category A'), 25.00),
      ((SELECT id FROM employee_categories WHERE name = 'Category B'), 20.00),
      ((SELECT id FROM employee_categories WHERE name = 'Category C'), 15.00),
      ((SELECT id FROM employee_categories WHERE name = 'Category D'), 10.00)
      ON CONFLICT (employee_category_id) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO da_configurations (employee_category_id, percentage) VALUES
      ((SELECT id FROM employee_categories WHERE name = 'Category A'), 15.00),
      ((SELECT id FROM employee_categories WHERE name = 'Category B'), 12.00),
      ((SELECT id FROM employee_categories WHERE name = 'Category C'), 10.00),
      ((SELECT id FROM employee_categories WHERE name = 'Category D'), 8.00)
      ON CONFLICT (employee_category_id) DO NOTHING;
    `);

    // Create allowances and deductions tables
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

    // Insert allowances and deductions
    await pool.query(`
      INSERT INTO allowances (name, description, is_taxable) VALUES
      ('Special Allowance', 'Special allowance component', true),
      ('Transport Allowance', 'Transportation allowance', true),
      ('Medical Allowance', 'Medical expenses allowance', true),
      ('Food Allowance', 'Food and meal allowance', false)
      ON CONFLICT (name) DO NOTHING;
    `);

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

    console.log('✓ Allowances and deductions data inserted');

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

    console.log('✓ Additional tables created\n');

    // Insert seed data
    console.log('\nInserting seed data...');
    
    await pool.query(`
      INSERT INTO departments (name, description) VALUES
      ('Human Resources', 'HR Department'),
      ('Finance', 'Finance and Accounting Department'),
      ('IT', 'Information Technology Department'),
      ('Operations', 'Operations Department'),
      ('Sales', 'Sales and Marketing Department')
      ON CONFLICT (name) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO job_roles (name, description) VALUES
      ('Manager', 'Management role'),
      ('Executive', 'Executive role'),
      ('Associate', 'Associate role'),
      ('Senior Manager', 'Senior Management role'),
      ('Director', 'Director role')
      ON CONFLICT (name) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO employment_types (name, description) VALUES
      ('Permanent', 'Permanent employment'),
      ('Contractual', 'Contract-based employment'),
      ('Daily Wage', 'Daily wage worker')
      ON CONFLICT (name) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO employee_categories (name, description) VALUES
      ('Category A', 'Senior staff category'),
      ('Category B', 'Mid-level staff category'),
      ('Category C', 'Junior staff category'),
      ('Category D', 'Daily wage category')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✓ Seed data inserted\n');

    console.log('✅ All tables and indexes created successfully!\n');
    console.log('✅ You can now login!\n');
    console.log('Next: Run "npm run seed" to create admin user\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nCheck:');
    console.error('1. Database "hrms_database" exists');
    console.error('2. .env file has correct DB_PASSWORD');
    console.error('3. PostgreSQL is running');
    await pool.end();
    process.exit(1);
  }
}

createTables();
