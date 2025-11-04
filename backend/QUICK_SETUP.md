# Quick Database Setup Guide

## Error: "relation 'roles' does not exist"

This means the database tables haven't been created yet. Follow these steps:

## Step-by-Step Setup

### 1. Ensure PostgreSQL is Running
Make sure PostgreSQL is installed and running on your system.

### 2. Create the Database
Connect to PostgreSQL using one of these methods:

**Using psql command line:**
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE hrms_db;
\q
```

**Or using pgAdmin:**
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Name: `hrms_db`
5. Click "Save"

### 3. Check Your .env File
Make sure `backend/.env` exists and has correct database settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 4. Run Migrations
In the backend directory, run:

```bash
cd backend
npm run migrate
```

This will create all tables including:
- roles
- users
- employees
- departments
- payroll_records
- and all other tables

### 5. Create Admin User
After migrations complete, create the admin user:

```bash
npm run seed
```

This creates:
- Username: `admin`
- Password: `admin123`

### 6. Restart Your Backend Server
```bash
npm run start:dev
```

Now you should be able to login!

## Troubleshooting

### "Connection refused" or "database does not exist"
- Check PostgreSQL is running
- Verify database name in .env matches the created database
- Check username/password are correct

### Migration errors
- Make sure you're in the `backend` directory
- Check that .env file exists with correct credentials
- Ensure database `hrms_db` exists before running migrations


