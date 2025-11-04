# HRMS & Payroll System - API Integration Guide

This guide explains how the frontend React app integrates with the Node.js backend API.

## Overview

All static data has been removed from the frontend and replaced with API calls to the backend. The system uses:

- **Backend API**: Node.js + Express + PostgreSQL
- **Frontend**: React + TypeScript + React Query
- **Authentication**: JWT tokens stored in localStorage
- **API Documentation**: Swagger UI at `/api-docs`

## Setup

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. **Run database migrations:**
```bash
npm run migrate
npm run seed  # Creates admin user
```

4. **Start backend server:**
```bash
npm run start:dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd staff-verse
npm install
```

2. **Configure API URL (optional):**
```bash
cp .env.example .env
# Edit .env if backend is not on localhost:5000
```

3. **Start frontend:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or port 8080 as per vite config)

## API Integration

### API Client

The frontend uses a centralized API client (`src/lib/api.ts`) that:
- Manages JWT token storage and authentication headers
- Handles errors consistently
- Provides type-safe request methods

### Service Layer

API services are organized by domain:
- `authService.ts` - Authentication (login, register, profile)
- `employeeService.ts` - Employee CRUD operations
- `payrollService.ts` - Payroll processing and management
- `configService.ts` - System configuration (HRA, DA, etc.)
- `reportsService.ts` - Reports and analytics

### Data Fetching

All pages use React Query (`@tanstack/react-query`) for:
- Automatic caching
- Background refetching
- Loading and error states
- Optimistic updates

### Example: Fetching Employees

```typescript
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";

const { data, isLoading, error } = useQuery({
  queryKey: ['employees'],
  queryFn: () => employeeService.getAll({ is_active: true }),
});
```

## Pages Updated

### 1. Dashboard (`/pages/Dashboard.tsx`)
- **Removed**: Static stats and activity data
- **Added**: 
  - Real-time employee count from API
  - Current month payroll totals
  - Department distribution from actual data
  - Recent payroll activity

### 2. Employees (`/pages/Employees.tsx`)
- **Removed**: Static employee array
- **Added**:
  - Full CRUD operations via API
  - Create employee dialog with form
  - Delete functionality
  - Real-time search and filtering
  - Loading and error states

### 3. Payroll (`/pages/Payroll.tsx`)
- **Removed**: Static payroll history
- **Added**:
  - Fetch payroll records by month/year
  - Process payroll button (calls API)
  - Finalize payroll functionality
  - Real-time status updates
  - Month/year selector

### 4. Reports (`/pages/Reports.tsx`)
- **Removed**: Static report list
- **Added**:
  - Salary disbursement report API integration
  - Provident fund summary
  - Daily wage records
  - Salary distribution by department
  - Filterable by month/year

### 5. Settings (`/pages/Settings.tsx`)
- **Removed**: Static configuration form
- **Added**:
  - HRA configuration management (per category)
  - DA configuration management (per category)
  - Load current configurations from API
  - Update configurations via API

## Authentication Flow

1. User logs in via `/api/auth/login`
2. Backend returns JWT token
3. Token stored in localStorage
4. All subsequent requests include `Authorization: Bearer <token>` header
5. Backend validates token on protected routes

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user

### Employees
- `GET /api/employees` - List all employees (with filters)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Payroll
- `GET /api/payroll` - Get payroll records (with filters)
- `POST /api/payroll/calculate` - Calculate payroll for employee
- `POST /api/payroll/process` - Process monthly payroll
- `POST /api/payroll/finalize` - Finalize payroll
- `POST /api/payroll/working-days` - Update working days

### Configuration
- `GET /api/config/hra` - Get HRA configurations
- `POST /api/config/hra` - Update HRA configuration
- `GET /api/config/da` - Get DA configurations
- `POST /api/config/da` - Update DA configuration
- `GET /api/config/departments` - Get departments
- `GET /api/config/job-roles` - Get job roles
- `GET /api/config/employment-types` - Get employment types
- `GET /api/config/employee-categories` - Get categories

### Reports
- `GET /api/reports/salary-disbursement` - Salary disbursement report
- `GET /api/reports/provident-fund` - PF summary
- `GET /api/reports/daily-wage` - Daily wage records
- `GET /api/reports/salary-distribution` - Distribution by dept/category
- `GET /api/reports/annual-statement` - Annual salary statement

## Swagger Documentation

Once the backend is running, access Swagger UI at:
```
http://localhost:5000/api-docs
```

This provides interactive API documentation where you can:
- View all endpoints
- See request/response schemas
- Test API calls directly
- View authentication requirements

## Error Handling

The API client handles errors consistently:
- Network errors are caught and logged
- API error responses show user-friendly messages
- Toast notifications inform users of success/failure
- React Query handles retries and error states

## Environment Variables

### Backend (.env)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database config
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Backend server port (default: 5000)
- `FRONTEND_URL` - CORS origin (default: http://localhost:5173)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Testing the Integration

1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd staff-verse && npm run dev`
3. Open Swagger docs: `http://localhost:5000/api-docs`
4. Test login via Swagger or frontend
5. Create employees, process payroll, generate reports

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for specific CORS errors

### Authentication Errors
- Verify JWT token in localStorage
- Check token expiration
- Ensure backend `JWT_SECRET` is set

### API Connection Errors
- Verify backend is running on correct port
- Check `VITE_API_URL` in frontend
- Verify network connectivity

### Database Errors
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check migrations ran successfully

## Next Steps

1. Add authentication guards to frontend routes
2. Implement login page if not exists
3. Add form validation
4. Implement error boundaries
5. Add loading skeletons for better UX
6. Implement payslip generation UI
7. Add email functionality testing



