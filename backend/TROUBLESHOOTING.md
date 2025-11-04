# Troubleshooting: "roles does not exist" Error

## Issue
You're getting `{error: "relation \"roles\" does not exist"}` when trying to login.

## Root Cause
The server is connecting to a different database than where the tables were created, OR the `.env` file has incorrect database name.

## Solution Steps

### Step 1: Verify Which Database Server is Using

Run this command:
```bash
cd backend
npm run verify-db
```

This will show:
- Which database the server is connecting to
- If the roles table exists in that database
- All tables in that database

### Step 2: Check Your .env File

Make sure `backend/.env` file exists and has:

```env
DB_NAME=hrms_database
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_HOST=localhost
DB_PORT=5432
```

**⚠️ IMPORTANT:** 
- The `.env` file must be in the `backend/` directory
- The `DB_NAME` must match exactly: `hrms_database`
- Make sure there are no extra spaces or quotes

### Step 3: Create Tables in Correct Database

If `verify-db` shows the roles table doesn't exist, run:

```bash
npm run fix-roles
```

Then run:
```bash
npm run create-tables
```

### Step 4: Restart Server

After creating tables, **restart your backend server**:
1. Stop the server (Ctrl+C)
2. Start it again: `npm run start:dev`

### Step 5: Verify Tables Were Created

Run `npm run verify-db` again - you should see:
- ✅ Roles table EXISTS
- List of all tables

## Common Issues

### Issue 1: .env file missing
**Solution:** Create `backend/.env` with correct values

### Issue 2: Wrong database name in .env
**Solution:** Make sure `DB_NAME=hrms_database` (exact match)

### Issue 3: Server connected before tables created
**Solution:** Always restart server after creating tables

### Issue 4: Tables in different database
**Solution:** Check which database has tables, update .env to match

## Quick Check Commands

```bash
# Verify database connection
npm run verify-db

# Fix roles table if missing
npm run fix-roles

# Create all tables
npm run create-tables

# Create admin user
npm run seed
```

## Expected Output

When everything is working, `npm run verify-db` should show:
```
✅ Connection successful!
✅ Roles table EXISTS
📋 Tables in database:
  - roles
  - users
  - employees
  - departments
  ... (more tables)
```



