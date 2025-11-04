# Backend Project Structure

```
backend/
├── config/
│   └── database.js              # PostgreSQL connection pool
├── controllers/
│   ├── authController.js        # Authentication (login, register, profile)
│   ├── employeeController.js     # Employee CRUD operations
│   ├── payrollController.js      # Payroll computation and processing
│   ├── payslipController.js      # Payslip generation (PDF/Excel) and email
│   ├── configController.js       # Configuration management (HRA, DA, mappings)
│   └── reportsController.js      # Various payroll reports
├── middleware/
│   ├── auth.js                   # JWT authentication and authorization
│   └── errorHandler.js           # Error handling middleware
├── migrations/
│   ├── 001_initial_schema.sql   # Database schema (all tables)
│   └── 002_seed_data.sql         # Initial seed data (roles, departments, etc.)
├── routes/
│   ├── authRoutes.js             # Auth endpoints
│   ├── employeeRoutes.js         # Employee endpoints
│   ├── payrollRoutes.js          # Payroll endpoints
│   ├── payslipRoutes.js          # Payslip endpoints
│   ├── configRoutes.js           # Configuration endpoints
│   └── reportsRoutes.js          # Reports endpoints
├── scripts/
│   ├── migrate.js                # Database migration runner
│   └── seed.js                   # Admin user seeding
├── utils/
│   └── payrollCalculator.js      # Payroll calculation logic
├── payslips/                     # Generated payslip files (created at runtime)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
├── server.js                     # Main Express server
├── README.md                     # Detailed documentation
├── SETUP.md                      # Setup instructions
└── PROJECT_STRUCTURE.md          # This file
```

## Key Components

### Database (PostgreSQL)
- **Tables**: 20+ tables including employees, payroll_records, payslips, configurations, audit logs
- **Relationships**: Foreign keys for data integrity
- **Indexes**: Performance optimization for common queries

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Three roles: Administrator, Payroll Officer, Viewer

### Payroll Calculation
- Automated salary computation
- Pro-rated calculations based on working days
- Auto-calculated DA by employee category
- Configurable HRA percentage
- Automatic deduction application

### Payslip Generation
- PDF generation using PDFKit
- Excel export using XLSX
- Email delivery via Nodemailer

### API Endpoints
- RESTful API design
- Standard HTTP status codes
- JSON request/response format
- Comprehensive error handling

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Audit logging for all changes
- Parameterized queries (SQL injection prevention)

## Data Flow

1. **Employee Management**: Create/update employee records with all master data
2. **Working Days Input**: Enter or import working days for each month
3. **Payroll Processing**: System calculates payroll automatically
4. **Payroll Finalization**: Lock payroll after verification
5. **Payslip Generation**: Generate PDF and Excel files
6. **Email Delivery**: Send payslips to employees automatically
7. **Reporting**: Generate various analytical reports

## Configuration

The system is highly configurable:
- HRA percentage per employee category
- DA percentage per employee category
- Allowance/deduction mappings by designation and employment type
- Default amounts for each component

All configurations can be updated through the API (admin access required).


