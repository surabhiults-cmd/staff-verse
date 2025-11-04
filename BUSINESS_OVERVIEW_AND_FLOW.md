# HRMS & Payroll Management System
## Business Overview & System Flow

---

## ðŸ“‹ Business Overview

### What is This System?

The **HRMS & Payroll Management System** is a comprehensive web-based application designed to automate and manage human resource operations and payroll processing for organizations. It streamlines employee management, automates salary calculations, generates payslips, and provides detailed reports for decision-making.

### Business Purpose

**Primary Objectives:**
1. **Employee Data Management**: Centralized repository for all employee information
2. **Automated Payroll Processing**: Eliminates manual calculations, reduces errors
3. **Compliance & Accuracy**: Ensures accurate salary calculations with proper handling of allowances, deductions, taxes
4. **Document Management**: Automated payslip generation in PDF and Excel formats
5. **Analytics & Reporting**: Provides insights into salary distribution and financial analytics

### Target Users

- **Administrators**: Full system access, user management, configuration control
- **Payroll Officers**: Process payroll, generate payslips, manage employee records
- **Viewers/Managers**: Read-only access to reports and employee data

---

## ðŸ”„ Complete System Flow

### Flow 1: User Authentication & Authorization

1. User accesses login page
2. Enters credentials (username/email + password)
3. Backend validates credentials
4. JWT token generated and stored
5. User redirected to Dashboard
6. All API requests include JWT token
7. Protected routes validate token

### Flow 2: Employee Onboarding

1. Admin/Payroll Officer navigates to Employees page
2. Clicks Add Employee button
3. Fills employee form (personal info, department, designation, salary)
4. Submits form â†’ API creates employee record
5. Employee appears in employee list

### Flow 3: Monthly Payroll Processing

**STEP 1: Enter Working Days**
- Payroll Officer enters working days for each employee
- Data stored in working_days table

**STEP 2: Process Payroll**
- Click Process Payroll button
- System calculates for all employees:
  - Basic Pay (pro-rated based on working days)
  - DA (Dearness Allowance) by category
  - HRA (House Rent Allowance) by category
  - Special Allowances
  - Employer NPS Contribution
  - All Deductions (Tax, PF, etc.)
  - Net Payable
- Payroll status: processed

**STEP 3: Review & Finalize**
- Review calculated payroll
- Finalize payroll (locks records)
- Status: finalized

### Flow 4: Payslip Generation & Distribution

1. After finalization, generate payslips
2. System creates PDF and Excel files
3. Files saved to database
4. Optional: Send via email to employees
5. Employees receive payslip in inbox

---

## ðŸ—„ï¸ Technology Stack

**Frontend**: React + TypeScript + Vite  
**Backend**: Node.js + Express  
**Database**: PostgreSQL (Neon Cloud)  
**Authentication**: JWT  
**File Generation**: PDFKit (PDF), XLSX (Excel)  
**Email**: Nodemailer

---

## ðŸ“Š Key Features

1. Automated Payroll Calculation
2. Pro-rata Salary Handling
3. Multi-category Employee Support
4. Configurable Allowances (HRA, DA)
5. Comprehensive Deductions
6. Digital Payslips (PDF/Excel)
7. Email Integration
8. Role-based Access Control
9. Audit Trail
10. Reporting Suite

---

## ðŸ” Security & Access Control

**Roles:**
- Administrator: Full access
- Payroll Officer: Payroll operations
- Viewer: Read-only access

**Authentication**: JWT tokens with 7-day expiry

---

## ðŸ“ˆ Business Benefits

- Automated salary calculations (saves 80% time)
- Error-free payroll processing
- Compliance with tax regulations
- Digital payslip distribution
- Real-time insights through reports
- Reduced paperwork

