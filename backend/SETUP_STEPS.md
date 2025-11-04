# Setup Steps for hrms_database

## ✅ Step 1: Database Created
Database `hrms_database` has been created successfully!

## Step 2: Update .env File

Edit `backend/.env` file and make sure it contains:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_database
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

**⚠️ Important:** Replace `your_postgres_password` with your actual PostgreSQL password!

## Step 3: Run Setup SQL Script

You have two options:

### Option A: Command Line (Recommended)

```bash
psql -U postgres -d hrms_database -f backend/setup-any-db.sql
```

### Option B: psql Interactive Mode

```bash
psql -U postgres -d hrms_database
```

Then copy and paste the entire content from `backend/setup-any-db.sql` file and execute it.

### Option C: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Expand "Databases" → Right-click on `hrms_database`
4. Select "Query Tool"
5. Click "Open File" icon
6. Select `backend/setup-any-db.sql`
7. Click "Execute" (F5) or press F5

## Step 4: Verify Tables Were Created

To check if everything worked, run in psql:

```sql
\c hrms_database
\dt
```

You should see tables like:
- roles
- users
- employees
- departments
- payroll_records
- etc.

## Step 5: Create Admin User

After the SQL script runs successfully, create the admin user:

```bash
cd backend
npm run seed
```

Expected output:
```
✓ Admin user created successfully!

Login credentials:
  Username: admin
  Email: admin@hrms.com
  Password: admin123
```

## Step 6: Start Backend Server

```bash
npm run start:dev
```

You should see:
```
🚀 Server is running on http://localhost:5000
📊 API Health Check: http://localhost:5000/api/health
📋 API List: http://localhost:5000/api
📚 Swagger Docs: http://localhost:5000/api-docs
```

## Step 7: Test Login

1. Open your frontend application
2. Go to the login page
3. Enter:
   - **Username:** `admin`
   - **Password:** `admin123`
4. Click "Sign In"

## ✅ You're All Set!

Your HRMS & Payroll system is now ready to use!

---

## Troubleshooting

### Error: "relation 'roles' does not exist"
- The SQL script didn't run successfully
- Make sure you connected to the correct database (`hrms_database`)
- Re-run the setup SQL script

### Error: "database does not exist"
- Verify database name in `.env` matches: `hrms_database`
- Check database exists: `\l` in psql

### Connection refused errors
- Check PostgreSQL is running
- Verify password in `.env` is correct
- Check `DB_HOST` and `DB_PORT` in `.env`


