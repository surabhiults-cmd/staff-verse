# Test Data Seeding Guide

## Populate Database with 10 Sample Records

To test all APIs with sample data, run:

```bash
cd backend
npm run seed-test
```

## What This Creates

### ✅ 10 Employees
- Employee IDs: EMP001 through EMP010
- Various departments, roles, and employment types
- Sample contact information
- Different salary ranges (₹35,000 - ₹85,000)

### ✅ 10 Users
- Usernames: john_doe, jane_smith, mike_johnson, etc.
- Mixed roles (administrator, payroll_officer, viewer)
- All passwords: `password123`

### ✅ Working Days Records
- For current month (28-30 days worked)
- For previous month (30 days worked)
- For all 10 employees

### ✅ Payroll Records
- For current month
- Calculated using PayrollCalculator
- Mixed statuses (draft, processed, finalized)

### ✅ Audit Logs
- 10 sample audit log entries
- Various action types (create, update, delete)

## Test Credentials

### Admin User
- Username: `admin`
- Password: `admin123`

### Test Users (Created by seed-test)
- Username: `john_doe`, `jane_smith`, etc.
- Password: `password123`

## Testing APIs

After seeding, you can test:

1. **GET /api/employees** - Should return 10 employees
2. **GET /api/payroll** - Should return payroll records
3. **GET /api/reports/salary-disbursement** - Should show salary data
4. **POST /api/payroll/process** - Process payroll for all employees
5. And all other endpoints with real data

## Sample Employee List

After seeding, you'll have:
- EMP001 - Raj Kumar (Engineering, Manager, ₹75,000)
- EMP002 - Priya Sharma (HR, Executive, ₹65,000)
- EMP003 - Amit Patel (Finance, Associate, ₹45,000)
- EMP004 - Sneha Reddy (IT, Executive, ₹55,000)
- EMP005 - Vikram Singh (Operations, Senior Manager, ₹70,000)
- EMP006 - Anjali Desai (Sales, Associate, ₹48,000)
- EMP007 - Rohit Verma (Engineering, Director, ₹85,000)
- EMP008 - Kavita Nair (Finance, Executive, ₹58,000)
- EMP009 - Suresh Iyer (IT, Daily Wage, ₹35,000)
- EMP010 - Meera Joshi (Operations, Manager, ₹62,000)

## Running the Seed

```bash
npm run seed-test
```

Expected output:
```
🌱 Seeding test data (10 records for each table)...
Creating 10 employees...
✓ 10 employees created
Creating 10 users...
✓ 10 users created
Creating working days records...
✓ Working days records created
Creating payroll records...
✓ Payroll records created
Creating audit logs...
✓ Audit logs created
✅ Test data seeding completed!
```

## Important Notes

- This script creates sample data for testing
- Payroll records are calculated using the PayrollCalculator
- All employees have working days for current and previous month
- Users have different roles for testing RBAC
- Passwords are hashed using bcrypt


