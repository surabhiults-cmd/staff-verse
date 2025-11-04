# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials and other settings:
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name (default: hrms_db)
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: Secret key for JWT tokens (change this!)
- `PORT`: Backend server port (default: 5000)
- `FRONTEND_URL`: Your React frontend URL (default: http://localhost:5173)

### 3. Create PostgreSQL Database
Connect to PostgreSQL and run:
```sql
CREATE DATABASE hrms_db;
```

### 4. Run Database Migrations
This will create all tables and seed initial data:
```bash
npm run migrate
```

### 5. Create Admin User (Optional)
Create an initial admin user:
```bash
npm run seed
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`

⚠️ **Change the password after first login!**

### 6. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will be available at `http://localhost:5000`

### 7. Test the API
Check if the server is running:
```bash
curl http://localhost:5000/api/health
```

## Testing API Endpoints

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

This will return a JWT token. Use this token for subsequent requests:
```bash
Authorization: Bearer <your-token>
```

### Get All Employees
```bash
curl http://localhost:5000/api/employees \
  -H "Authorization: Bearer <your-token>"
```

## Database Schema

The migrations will create:
- All required tables (employees, payroll_records, payslips, etc.)
- Initial seed data (roles, departments, job roles, employment types, categories)
- HRA and DA configurations for each category
- Default allowances and deductions

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure the database `hrms_db` exists

### Migration Errors
- If migrations fail, check PostgreSQL logs
- Some errors like "table already exists" are normal if re-running migrations
- You may need to manually drop and recreate the database

### Port Already in Use
- Change the `PORT` in `.env`
- Or stop the process using port 5000

### Module Not Found
- Make sure you ran `npm install`
- Check that you're in the `backend` directory

## Next Steps

1. Connect your React frontend to this backend API
2. Update API base URL in frontend to `http://localhost:5000/api`
3. Implement authentication in frontend using the JWT token
4. Start using the API endpoints for employee and payroll management

## Production Deployment

For production:
1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use environment-specific database credentials
6. Set up proper logging and monitoring
7. Configure email settings for payslip delivery


