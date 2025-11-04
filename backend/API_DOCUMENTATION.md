# HRMS & Payroll Management System - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication APIs

### Register User
```
POST /api/auth/register
```
**Description:** Register a new user account

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role_id": 3  // Optional, defaults to viewer (3)
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role_id": 3
  }
}
```

---

### Login
```
POST /api/auth/login
```
**Description:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "username": "john_doe",  // or email
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role_id": 3,
    "role_name": "viewer"
  }
}
```

---

### Get Profile
```
GET /api/auth/profile
```
**Description:** Get current authenticated user's profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role_id": 3,
    "role_name": "viewer",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 👥 Employee Management APIs

### Get All Employees
```
GET /api/employees
```
**Description:** Get list of all employees with optional filters

**Query Parameters:**
- `department_id` (optional) - Filter by department
- `job_role_id` (optional) - Filter by job role
- `employment_type_id` (optional) - Filter by employment type
- `is_active` (optional) - Filter by active status (true/false)

**Example:**
```
GET /api/employees?department_id=1&is_active=true
```

**Response:**
```json
{
  "employees": [
    {
      "id": 1,
      "employee_id": "EMP001",
      "full_name": "John Doe",
      "date_of_birth": "1990-01-15",
      "contact_phone": "+1234567890",
      "contact_email": "john@example.com",
      "residential_address": "123 Main St",
      "date_of_joining": "2020-01-01",
      "department_id": 1,
      "job_role_id": 2,
      "employment_type_id": 1,
      "employee_category_id": 1,
      "bank_account_number": "123456789",
      "bank_ifsc_code": "BANK0000123",
      "bank_name": "Bank Name",
      "basic_pay": 50000,
      "is_active": true,
      "department_name": "Engineering",
      "job_role_name": "Senior Developer",
      "employment_type_name": "Permanent",
      "employee_category_name": "Category A"
    }
  ]
}
```

---

### Get Employee by ID
```
GET /api/employees/:id
```
**Description:** Get a specific employee by ID

**Example:**
```
GET /api/employees/1
```

**Response:**
```json
{
  "employee": {
    "id": 1,
    "employee_id": "EMP001",
    "full_name": "John Doe",
    // ... same structure as above
  }
}
```

---

### Create Employee
```
POST /api/employees
```
**Required Role:** Administrator, Payroll Officer

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "date_of_birth": "1990-01-15",
  "contact_phone": "+1234567890",
  "contact_email": "john@example.com",
  "residential_address": "123 Main St",
  "date_of_joining": "2020-01-01",
  "department_id": 1,
  "job_role_id": 2,
  "employment_type_id": 1,
  "employee_category_id": 1,
  "bank_account_number": "123456789",
  "bank_ifsc_code": "BANK0000123",
  "bank_name": "Bank Name",
  "basic_pay": 50000
}
```

**Response:**
```json
{
  "employee": { /* created employee object */ },
  "message": "Employee created successfully"
}
```

---

### Update Employee
```
PUT /api/employees/:id
```
**Required Role:** Administrator, Payroll Officer

**Request Body:** (All fields optional - only send fields to update)
```json
{
  "full_name": "John Doe Updated",
  "basic_pay": 55000,
  "is_active": true
}
```

**Response:**
```json
{
  "employee": { /* updated employee object */ },
  "message": "Employee updated successfully"
}
```

---

### Delete Employee
```
DELETE /api/employees/:id
```
**Required Role:** Administrator

**Response:**
```json
{
  "message": "Employee deleted successfully"
}
```

---

## 💰 Payroll Management APIs

### Get Payroll Records
```
GET /api/payroll
```
**Description:** Get payroll records with optional filters

**Query Parameters:**
- `employee_id` (optional) - Filter by employee
- `month` (optional) - Filter by month (1-12)
- `year` (optional) - Filter by year

**Example:**
```
GET /api/payroll?month=11&year=2024
```

**Response:**
```json
{
  "payroll_records": [
    {
      "id": 1,
      "employee_id": 1,
      "month": 11,
      "year": 2024,
      "basic_pay": 50000,
      "dearness_allowance": 7500,
      "house_rent_allowance": 12500,
      "special_allowance": 5000,
      "employer_nps_contribution": 5000,
      "total_earnings": 80000,
      "gpf_recovery": 2500,
      "sli": 500,
      "gis": 300,
      "festival_bonus": 0,
      "home_building_advance": 0,
      "income_tax": 5000,
      "rent_deduction": 0,
      "lic_contribution": 0,
      "medisep": 500,
      "additional_deductions": 0,
      "total_deductions": 8800,
      "net_payable": 71200,
      "days_worked": 30,
      "status": "processed",
      "full_name": "John Doe",
      "department_name": "Engineering"
    }
  ]
}
```

---

### Calculate Payroll
```
POST /api/payroll/calculate
```
**Required Role:** Administrator, Payroll Officer

**Description:** Calculate payroll for a specific employee

**Request Body:**
```json
{
  "employee_id": 1,
  "month": 11,
  "year": 2024
}
```

**Response:**
```json
{
  "payroll": {
    "employee_id": 1,
    "month": 11,
    "year": 2024,
    "basic_pay": 50000,
    "dearness_allowance": 7500,
    // ... all payroll components
    "net_payable": 71200,
    "days_worked": 30,
    "total_days": 30
  }
}
```

---

### Process Monthly Payroll
```
POST /api/payroll/process
```
**Required Role:** Administrator, Payroll Officer

**Description:** Process payroll for all active employees for a given month

**Request Body:**
```json
{
  "month": 11,
  "year": 2024
}
```

**Response:**
```json
{
  "message": "Monthly payroll processed successfully",
  "success": true,
  "processed": 245,
  "errors": 3,
  "details": {
    "processedRecords": [
      { "employee_id": 1, "status": "success" }
    ],
    "errors": [
      { "employee_id": 2, "error": "Missing working days" }
    ]
  }
}
```

---

### Finalize Payroll
```
POST /api/payroll/finalize
```
**Required Role:** Administrator, Payroll Officer

**Description:** Change status of all processed payroll records to finalized

**Request Body:**
```json
{
  "month": 11,
  "year": 2024
}
```

**Response:**
```json
{
  "message": "Payroll finalized successfully",
  "records_finalized": 245
}
```

---

### Update Working Days
```
POST /api/payroll/working-days
```
**Required Role:** Administrator, Payroll Officer

**Description:** Update or create working days record for an employee

**Request Body:**
```json
{
  "employee_id": 1,
  "month": 11,
  "year": 2024,
  "days_worked": 28,
  "total_days": 30
}
```

**Response:**
```json
{
  "working_days": {
    "id": 1,
    "employee_id": 1,
    "month": 11,
    "year": 2024,
    "days_worked": 28,
    "total_days": 30
  },
  "message": "Working days updated successfully"
}
```

---

## 📄 Payslip APIs

### Generate Payslip
```
POST /api/payslips/generate
```
**Required Role:** Administrator, Payroll Officer

**Description:** Generate PDF and Excel payslip for a payroll record

**Request Body:**
```json
{
  "payroll_record_id": 1
}
```

**Response:**
```json
{
  "payslip": {
    "id": 1,
    "payroll_record_id": 1,
    "employee_id": 1,
    "month": 11,
    "year": 2024,
    "pdf_path": "/path/to/payslip.pdf",
    "excel_path": "/path/to/payslip.xlsx"
  },
  "pdf_url": "/payslips/payslip_EMP001_2024_11.pdf",
  "excel_url": "/payslips/payslip_EMP001_2024_11.xlsx",
  "message": "Payslip generated successfully"
}
```

---

### Send Payslip Email
```
POST /api/payslips/send-email
```
**Required Role:** Administrator, Payroll Officer

**Description:** Send payslip via email to employee

**Request Body:**
```json
{
  "payslip_id": 1
}
```

**Response:**
```json
{
  "message": "Payslip sent successfully"
}
```

---

### Download Payslip File
```
GET /api/payslips/files/:filename
```
**Description:** Download generated payslip file (PDF or Excel)

**Example:**
```
GET /api/payslips/files/payslip_EMP001_2024_11.pdf
```

---

## ⚙️ Configuration APIs

### Get HRA Configuration
```
GET /api/config/hra
```
**Description:** Get all HRA configurations by employee category

**Response:**
```json
{
  "hra_configs": [
    {
      "id": 1,
      "employee_category_id": 1,
      "percentage": 25.00,
      "category_name": "Category A"
    }
  ]
}
```

---

### Update HRA Configuration
```
POST /api/config/hra
```
**Required Role:** Administrator

**Request Body:**
```json
{
  "employee_category_id": 1,
  "percentage": 25.00
}
```

**Response:**
```json
{
  "hra_config": {
    "id": 1,
    "employee_category_id": 1,
    "percentage": 25.00
  },
  "message": "HRA configuration updated successfully"
}
```

---

### Get DA Configuration
```
GET /api/config/da
```
**Description:** Get all DA configurations by employee category

**Response:**
```json
{
  "da_configs": [
    {
      "id": 1,
      "employee_category_id": 1,
      "percentage": 15.00,
      "category_name": "Category A"
    }
  ]
}
```

---

### Update DA Configuration
```
POST /api/config/da
```
**Required Role:** Administrator

**Request Body:**
```json
{
  "employee_category_id": 1,
  "percentage": 15.00
}
```

**Response:**
```json
{
  "da_config": {
    "id": 1,
    "employee_category_id": 1,
    "percentage": 15.00
  },
  "message": "DA configuration updated successfully"
}
```

---

### Get Departments
```
GET /api/config/departments
```
**Description:** Get all departments

**Response:**
```json
{
  "departments": [
    {
      "id": 1,
      "name": "Engineering",
      "description": "Engineering Department"
    }
  ]
}
```

---

### Get Job Roles
```
GET /api/config/job-roles
```
**Description:** Get all job roles/designations

**Response:**
```json
{
  "job_roles": [
    {
      "id": 1,
      "name": "Manager",
      "description": "Management role"
    }
  ]
}
```

---

### Get Employment Types
```
GET /api/config/employment-types
```
**Description:** Get all employment types

**Response:**
```json
{
  "employment_types": [
    {
      "id": 1,
      "name": "Permanent",
      "description": "Permanent employment"
    }
  ]
}
```

---

### Get Employee Categories
```
GET /api/config/employee-categories
```
**Description:** Get all employee categories

**Response:**
```json
{
  "employee_categories": [
    {
      "id": 1,
      "name": "Category A",
      "description": "Senior staff category"
    }
  ]
}
```

---

### Get Allowances
```
GET /api/config/allowances
```
**Description:** Get all allowance definitions

**Response:**
```json
{
  "allowances": [
    {
      "id": 1,
      "name": "Special Allowance",
      "description": "Special allowance component",
      "is_taxable": true
    }
  ]
}
```

---

### Get Deductions
```
GET /api/config/deductions
```
**Description:** Get all deduction definitions

**Response:**
```json
{
  "deductions": [
    {
      "id": 1,
      "name": "GPF & Recovery",
      "description": "General Provident Fund and Recovery"
    }
  ]
}
```

---

### Get Allowance-Deduction Mappings
```
GET /api/config/mappings
```
**Description:** Get mappings of allowances/deductions by job role and employment type

**Query Parameters:**
- `job_role_id` (optional)
- `employment_type_id` (optional)

**Response:**
```json
{
  "mappings": [
    {
      "id": 1,
      "job_role_id": 1,
      "employment_type_id": 1,
      "allowance_id": 1,
      "deduction_id": 1,
      "default_amount": 5000,
      "is_mandatory": true,
      "allowance_name": "Special Allowance",
      "deduction_name": "GPF & Recovery"
    }
  ]
}
```

---

### Create Allowance-Deduction Mapping
```
POST /api/config/mappings
```
**Required Role:** Administrator

**Request Body:**
```json
{
  "job_role_id": 1,
  "employment_type_id": 1,
  "allowance_id": 1,
  "deduction_id": 1,
  "default_amount": 5000,
  "is_mandatory": true
}
```

**Response:**
```json
{
  "mapping": { /* created mapping object */ },
  "message": "Mapping created successfully"
}
```

---

## 📊 Reports & Analytics APIs

### Salary Disbursement Report
```
GET /api/reports/salary-disbursement
```
**Description:** Get salary disbursement summary

**Query Parameters:**
- `month` (optional)
- `year` (optional)
- `department_id` (optional)
- `category_id` (optional)

**Response:**
```json
{
  "report": [
    {
      "total_earnings": 2450000,
      "total_deductions": 215600,
      "total_net_payable": 2234400,
      "employee_count": 245,
      "month": 11,
      "year": 2024
    }
  ]
}
```

---

### Provident Fund Summary
```
GET /api/reports/provident-fund
```
**Description:** Get provident fund contribution summary

**Query Parameters:**
- `month` (optional)
- `year` (optional)

**Response:**
```json
{
  "report": [
    {
      "employee_id": "EMP001",
      "full_name": "John Doe",
      "month": 11,
      "year": 2024,
      "employee_contribution": 2500,
      "employer_contribution": 5000,
      "total_contribution": 7500
    }
  ]
}
```

---

### Daily Wage Records
```
GET /api/reports/daily-wage
```
**Description:** Get daily wage worker payment records

**Query Parameters:**
- `month` (optional)
- `year` (optional)

**Response:**
```json
{
  "report": [
    {
      "employee_id": "EMP001",
      "full_name": "John Doe",
      "month": 11,
      "year": 2024,
      "days_worked": 25,
      "net_payable": 12500,
      "status": "processed"
    }
  ]
}
```

---

### Deduction Summary
```
GET /api/reports/deduction-summary
```
**Description:** Get summary of deductions

**Query Parameters:**
- `month` (optional)
- `year` (optional)
- `deduction_type` (optional) - e.g., 'gpf_recovery', 'income_tax', etc.

**Response:**
```json
{
  "report": [
    {
      "total_amount": 245000,
      "month": 11,
      "year": 2024
    }
  ]
}
```

---

### Salary Distribution
```
GET /api/reports/salary-distribution
```
**Description:** Get salary distribution by department or category

**Query Parameters:**
- `month` (optional)
- `year` (optional)
- `group_by` (optional) - 'department' or 'category'

**Example:**
```
GET /api/reports/salary-distribution?month=11&year=2024&group_by=department
```

**Response:**
```json
{
  "report": [
    {
      "group_name": "Engineering",
      "employee_count": 85,
      "total_earnings": 850000,
      "total_deductions": 74800,
      "total_net_payable": 775200
    }
  ]
}
```

---

### Annual Salary Statement
```
GET /api/reports/annual-statement
```
**Description:** Get annual salary statement for an employee

**Query Parameters:**
- `employee_id` (required)
- `year` (required)

**Example:**
```
GET /api/reports/annual-statement?employee_id=1&year=2024
```

**Response:**
```json
{
  "employee_id": 1,
  "year": 2024,
  "monthly_records": [
    {
      "month": 1,
      "total_earnings": 80000,
      "total_deductions": 8800,
      "net_payable": 71200
    }
    // ... all 12 months
  ],
  "totals": {
    "total_earnings": 960000,
    "total_deductions": 105600,
    "total_net_payable": 854400
  }
}
```

---

## 🏥 Utility APIs

### Health Check
```
GET /api/health
```
**Description:** Check if API server is running

**Response:**
```json
{
  "status": "OK",
  "message": "HRMS Backend API is running"
}
```

---

### API List
```
GET /api
```
**Description:** Get list of all available API endpoints

**Response:**
```json
{
  "message": "HRMS & Payroll Management System API",
  "version": "1.0.0",
  "endpoints": {
    // Complete list of all endpoints
  },
  "documentation": "Visit http://localhost:5000/api-docs for Swagger documentation"
}
```

---

## 🔑 Role-Based Access Control

### Roles:
1. **Administrator** - Full system access
2. **Payroll Officer** - Can process payroll, generate payslips, manage employees
3. **Viewer** - Read-only access to reports and employee data

### Protected Endpoints:
- Most endpoints require authentication
- Some endpoints require specific roles (Administrator or Payroll Officer)
- Check individual endpoint documentation above

---

## 📚 Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:5000/api-docs
```

You can:
- View all endpoints
- Test API calls directly
- See request/response schemas
- Understand authentication requirements

---

## ❌ Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": "Specific validation message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notes

1. All dates should be in ISO format: `YYYY-MM-DD`
2. All monetary values are in INR (₹)
3. JWT tokens expire after 7 days (configurable)
4. Month values are 1-12 (January = 1, December = 12)
5. All timestamps are in UTC
6. Pagination can be added for large datasets in future updates

---

## 🔄 Example Workflow

1. **Login**: `POST /api/auth/login`
2. **Create Employee**: `POST /api/employees`
3. **Update Working Days**: `POST /api/payroll/working-days`
4. **Process Payroll**: `POST /api/payroll/process`
5. **Generate Payslip**: `POST /api/payslips/generate`
6. **View Reports**: `GET /api/reports/salary-disbursement`


