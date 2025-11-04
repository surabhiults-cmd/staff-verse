# Database Setup Guide

## Choose Your Database Name

You can use any database name you prefer. Common options:
- `hrms_db`
- `payroll_db`
- `hrms_payroll`
- `company_hrms`
- Or any name you like!

## Setup Steps

### Step 1: Create the Database

**Using psql command line:**
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE your_database_name;
\q
```

**Using pgAdmin:**
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Enter your database name
5. Click "Save"

### Step 2: Update .env File

Edit `backend/.env` and set your database name:

```env
DB_NAME=your_database_name
```

Replace `your_database_name` with your chosen database name.

### Step 3: Run the Setup SQL

**Option A: Using psql**
```bash
psql -U postgres -d your_database_name -f backend/setup.sql
```

**Option B: Using pgAdmin**
1. Open Query Tool for your database
2. Open `backend/setup.sql` file
3. Execute it (F5)

**Option C: Copy and paste in psql**
```bash
psql -U postgres -d your_database_name
```
Then copy-paste the entire `setup.sql` content and run it.

### Step 4: Create Admin User

After tables are created, run:
```bash
cd backend
npm run seed
```

This creates:
- Username: `admin`
- Password: `admin123`

### Step 5: Restart Server

```bash
npm run start:dev
```

## Example with Custom Database Name

If you want to use `company_payroll`:

1. **Create database:**
   ```sql
   CREATE DATABASE company_payroll;
   ```

2. **Update .env:**
   ```env
   DB_NAME=company_payroll
   ```

3. **Run setup:**
   ```bash
   psql -U postgres -d company_payroll -f backend/setup.sql
   ```

4. **Create admin:**
   ```bash
   npm run seed
   ```

That's it! Your database is ready.


