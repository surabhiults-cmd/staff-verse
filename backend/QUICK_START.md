# Quick Start Guide - Using hrms_databae Database

## Step 1: Database Created ✅
You've created the database: `hrms_databae`

## Step 2: Update .env File

Make sure your `backend/.env` file has:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_databae
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password!

## Step 3: Run Setup SQL

Connect to your database and run the setup script:

### Option A: Using psql command line
```bash
psql -U postgres -d hrms_databae -f backend/setup-any-db.sql
```

### Option B: Using psql interactive mode
```bash
psql -U postgres -d hrms_databae
```
Then copy and paste the contents of `backend/setup-any-db.sql` and execute it.

### Option C: Using pgAdmin
1. Open pgAdmin
2. Connect to your server
3. Expand Databases → hrms_databae
4. Right-click → Query Tool
5. Open `backend/setup-any-db.sql` file
6. Click Execute (F5)

## Step 4: Create Admin User

After the SQL script runs successfully, create the admin user:

```bash
cd backend
npm run seed
```

This will create:
- **Username:** `admin`
- **Password:** `admin123`

## Step 5: Start the Server

```bash
npm run start:dev
```

## Step 6: Test Login

Open your frontend and login with:
- Username: `admin`
- Password: `admin123`

## Verification

To verify tables were created, run in psql:

```sql
\c hrms_databae
\dt
```

You should see all tables listed (roles, users, employees, etc.)

---

## Troubleshooting

### If you get "database does not exist" error:
- Make sure you spelled it correctly: `hrms_databae`
- Check your `.env` file has `DB_NAME=hrms_databae`

### If you get connection errors:
- Verify PostgreSQL is running
- Check your password in `.env` is correct
- Make sure the database exists: `\l` in psql to list databases


