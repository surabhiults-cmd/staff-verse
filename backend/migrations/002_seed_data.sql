-- Seed initial data

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('administrator', 'Full system access, manages users and configurations'),
('payroll_officer', 'Processes payroll and generates payslips'),
('viewer', 'Read-only access to reports and employee data')
ON CONFLICT (name) DO NOTHING;

-- Insert Departments
INSERT INTO departments (name, description) VALUES
('Human Resources', 'HR Department'),
('Finance', 'Finance and Accounting Department'),
('IT', 'Information Technology Department'),
('Operations', 'Operations Department'),
('Sales', 'Sales and Marketing Department')
ON CONFLICT (name) DO NOTHING;

-- Insert Job Roles
INSERT INTO job_roles (name, description) VALUES
('Manager', 'Management role'),
('Executive', 'Executive role'),
('Associate', 'Associate role'),
('Senior Manager', 'Senior Management role'),
('Director', 'Director role')
ON CONFLICT (name) DO NOTHING;

-- Insert Employment Types
INSERT INTO employment_types (name, description) VALUES
('Permanent', 'Permanent employment'),
('Contractual', 'Contract-based employment'),
('Daily Wage', 'Daily wage worker')
ON CONFLICT (name) DO NOTHING;

-- Insert Employee Categories
INSERT INTO employee_categories (name, description) VALUES
('Category A', 'Senior staff category'),
('Category B', 'Mid-level staff category'),
('Category C', 'Junior staff category'),
('Category D', 'Daily wage category')
ON CONFLICT (name) DO NOTHING;

-- Insert HRA Configurations
INSERT INTO hra_configurations (employee_category_id, percentage) VALUES
((SELECT id FROM employee_categories WHERE name = 'Category A'), 25.00),
((SELECT id FROM employee_categories WHERE name = 'Category B'), 20.00),
((SELECT id FROM employee_categories WHERE name = 'Category C'), 15.00),
((SELECT id FROM employee_categories WHERE name = 'Category D'), 10.00)
ON CONFLICT (employee_category_id) DO NOTHING;

-- Insert DA Configurations
INSERT INTO da_configurations (employee_category_id, percentage) VALUES
((SELECT id FROM employee_categories WHERE name = 'Category A'), 15.00),
((SELECT id FROM employee_categories WHERE name = 'Category B'), 12.00),
((SELECT id FROM employee_categories WHERE name = 'Category C'), 10.00),
((SELECT id FROM employee_categories WHERE name = 'Category D'), 8.00)
ON CONFLICT (employee_category_id) DO NOTHING;

-- Insert Allowances
INSERT INTO allowances (name, description, is_taxable) VALUES
('Special Allowance', 'Special allowance component', true),
('Transport Allowance', 'Transportation allowance', true),
('Medical Allowance', 'Medical expenses allowance', true),
('Food Allowance', 'Food and meal allowance', false)
ON CONFLICT (name) DO NOTHING;

-- Insert Deductions
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



