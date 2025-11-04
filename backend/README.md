# HRMS & Payroll Management System - Backend

Node.js backend API for the HRMS & Payroll Management System using Express.js and PostgreSQL.

## Features

- Employee Management (CRUD operations)
- Payroll Computation (automated salary calculation)
- Payslip Generation (PDF and Excel export)
- Configuration Management (HRA, DA, allowances, deductions)
- Reporting & Analytics (various payroll reports)
- Role-Based Access Control (RBAC)
- Audit Logging
- Authentication & Authorization (JWT)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database credentials
- JWT secret
- Email settings (for payslip delivery)
- Port and other configurations

3. **Create PostgreSQL database:**
```sql
CREATE DATABASE hrms_db;
```

4. **Run database migrations:**
```bash
npm run migrate
```

5. **Seed initial data (optional):**
The migration script already includes seed data for roles, departments, job roles, etc.

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Employees
- `GET /api/employees` - Get all employees (with filters)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee (Admin/Payroll Officer)
- `PUT /api/employees/:id` - Update employee (Admin/Payroll Officer)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Payroll
- `POST /api/payroll/calculate` - Calculate payroll for an employee
- `GET /api/payroll` - Get payroll records (with filters)
- `POST /api/payroll/process` - Process monthly payroll for all employees
- `POST /api/payroll/finalize` - Finalize payroll
- `POST /api/payroll/working-days` - Update working days for an employee

### Payslips
- `POST /api/payslips/generate` - Generate payslip (PDF and Excel)
- `POST /api/payslips/send-email` - Send payslip via email
- `GET /api/payslips/files/:filename` - Download payslip file

### Configuration
- `GET /api/config/hra` - Get HRA configurations
- `POST /api/config/hra` - Update HRA configuration (Admin)
- `GET /api/config/da` - Get DA configurations
- `POST /api/config/da` - Update DA configuration (Admin)
- `GET /api/config/departments` - Get all departments
- `GET /api/config/job-roles` - Get all job roles
- `GET /api/config/employment-types` - Get all employment types
- `GET /api/config/employee-categories` - Get all employee categories
- `GET /api/config/allowances` - Get all allowances
- `GET /api/config/deductions` - Get all deductions
- `GET /api/config/mappings` - Get allowance-deduction mappings
- `POST /api/config/mappings` - Create allowance-deduction mapping (Admin)

### Reports
- `GET /api/reports/salary-disbursement` - Salary disbursement report
- `GET /api/reports/provident-fund` - Provident fund summary
- `GET /api/reports/daily-wage` - Daily wage records
- `GET /api/reports/deduction-summary` - Deduction summary
- `GET /api/reports/salary-distribution` - Salary distribution by department/category
- `GET /api/reports/annual-statement` - Annual salary statement

## Database Schema

The database includes the following main tables:
- `users` - User authentication and roles
- `roles` - Role definitions
- `employees` - Employee master data
- `departments` - Department lookup
- `job_roles` - Job role/designation lookup
- `employment_types` - Employment type lookup
- `employee_categories` - Employee category lookup
- `payroll_records` - Monthly payroll records
- `working_days` - Employee attendance/working days
- `payslips` - Generated payslip records
- `hra_configurations` - HRA configuration by category
- `da_configurations` - DA configuration by category
- `allowances` - Allowance definitions
- `deductions` - Deduction definitions
- `allowance_deduction_mappings` - Mapping rules
- `audit_logs` - Audit trail

## Authentication

All endpoints (except `/api/auth/register` and `/api/auth/login`) require authentication via JWT token.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Roles

- **administrator**: Full system access
- **payroll_officer**: Can process payroll and generate payslips
- **viewer**: Read-only access to reports and employee data

## Payroll Calculation Logic

The system automatically calculates:
- **Basic Pay**: Pro-rated based on working days
- **Dearness Allowance (DA)**: Auto-calculated by employee category
- **House Rent Allowance (HRA)**: Configurable percentage by category
- **Special Allowance**: Default based on designation/type
- **Employer NPS Contribution**: 10% of basic pay (configurable)
- **Deductions**: Applied automatically based on designation and type

## Notes

- Working days can be entered manually or imported from biometric systems
- Payroll recalculation happens automatically when working days are updated
- Payslips are generated in both PDF and Excel formats
- Email delivery requires proper SMTP configuration in `.env`

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

- Use `nodemon` for auto-reload during development (`npm run dev`)
- Check logs for detailed error messages
- Database queries use parameterized statements to prevent SQL injection

## License

ISC


