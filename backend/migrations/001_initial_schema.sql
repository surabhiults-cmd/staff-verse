-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
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

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Roles/Designations table
CREATE TABLE IF NOT EXISTS job_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employment Types table
CREATE TABLE IF NOT EXISTS employment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Categories table (for DA calculation)
CREATE TABLE IF NOT EXISTS employee_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table (Master Employee Form)
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

-- HRA Configuration table
CREATE TABLE IF NOT EXISTS hra_configurations (
    id SERIAL PRIMARY KEY,
    employee_category_id INTEGER REFERENCES employee_categories(id) ON DELETE CASCADE,
    percentage DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_category_id)
);

-- DA Configuration table
CREATE TABLE IF NOT EXISTS da_configurations (
    id SERIAL PRIMARY KEY,
    employee_category_id INTEGER REFERENCES employee_categories(id) ON DELETE CASCADE,
    percentage DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_category_id)
);

-- Allowances table
CREATE TABLE IF NOT EXISTS allowances (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_taxable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deductions table
CREATE TABLE IF NOT EXISTS deductions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allowance-Deduction Mapping table (by designation/type)
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

-- Working Days table
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

-- Payroll Records table
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
    status VARCHAR(20) DEFAULT 'draft', -- draft, processed, finalized
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month, year)
);

-- Additional Allowances/Deductions in Payroll (for flexibility)
CREATE TABLE IF NOT EXISTS payroll_components (
    id SERIAL PRIMARY KEY,
    payroll_record_id INTEGER REFERENCES payroll_records(id) ON DELETE CASCADE,
    component_type VARCHAR(20) NOT NULL, -- 'allowance' or 'deduction'
    component_name VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payslips table
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

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_job_role ON employees(job_role_id);
CREATE INDEX idx_employees_employment_type ON employees(employment_type_id);
CREATE INDEX idx_employees_category ON employees(employee_category_id);
CREATE INDEX idx_payroll_employee_month_year ON payroll_records(employee_id, month, year);
CREATE INDEX idx_working_days_employee_month_year ON working_days(employee_id, month, year);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
