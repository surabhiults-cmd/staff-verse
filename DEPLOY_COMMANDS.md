# Deployment Guide: Vercel + Render + Neon 🚀

**Best balance for beginners & pros:**
- ✅ Frontend → **Vercel** (Free, fast, easy)
- ✅ Backend → **Render** (Free tier, reliable)
- ✅ Database → **Neon** (Free PostgreSQL, serverless)

---

## Prerequisites

1. **GitHub account** (free)
2. **Vercel account** (free): https://vercel.com
3. **Render account** (free): https://render.com
4. **Neon account** (free): https://neon.tech
5. **Node.js installed locally** (for commands)
6. **Git installed**

---

## Part 1: Database Setup (Neon) 🗄️

### Step 1: Create Neon Database

1. Go to https://neon.tech and sign up
2. Click **"Create Project"**
3. Fill in:
   - **Project Name:** `hrms-database`
   - **PostgreSQL Version:** 15 or 16
   - **Region:** Choose closest to you
4. Click **"Create Project"**

### Step 2: Get Database Connection String

1. Once created, you'll see a **connection string** like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
2. **Copy this connection string** - you'll need it for Render!
3. Also note down these values separately:
   - `DB_HOST` - e.g., `ep-xxx.region.aws.neon.tech`
   - `DB_PORT` - usually `5432`
   - `DB_NAME` - database name
   - `DB_USER` - username
   - `DB_PASSWORD` - password

### Step 3: Run Database Migrations Locally

**Option A: Using Connection String**

```bash
# Install PostgreSQL client if needed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client
# Windows: Download from postgresql.org

# Connect to Neon database
psql "YOUR_NEON_CONNECTION_STRING"

# Run migrations (copy content from backend/setup-any-db.sql)
# Or use the migration script
```

**Option B: Using Migration Script (Recommended)**

1. Create a local `.env` file in `backend/`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` with your Neon credentials:
   ```env
   DB_HOST=ep-xxx.region.aws.neon.tech
   DB_PORT=5432
   DB_NAME=neondb
   DB_USER=your_username
   DB_PASSWORD=your_password
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here-change-this
   PORT=5000
   ```

3. Install dependencies and run migrations:
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   ```

   You should see:
   ```
   ✓ Database tables created successfully!
   ✓ Admin user created successfully!
   
   Login credentials:
     Username: admin
     Email: admin@hrms.com
     Password: admin123
   ```

---

## Part 2: Backend Deployment (Render) 🔧

### Step 1: Prepare Repository

```bash
# If not already a git repo
git init
git add .
git commit -m "Ready for deployment"

# Push to GitHub (create repo first on GitHub)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render

**Via Render Dashboard:**

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:
   - **Name:** `hrms-backend`
   - **Region:** Choose closest
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Starter for better performance)

5. **Environment Variables** - Click "Add Environment Variable" for each:

   ```
   NODE_ENV = production
   PORT = 10000
   JWT_SECRET = <generate-a-random-32-char-string>
   DB_HOST = <your-neon-host>
   DB_PORT = 5432
   DB_NAME = <your-neon-database-name>
   DB_USER = <your-neon-username>
   DB_PASSWORD = <your-neon-password>
   FRONTEND_URL = https://your-frontend.vercel.app
   ```

   **Generate JWT_SECRET:**
   ```bash
   # On Mac/Linux
   openssl rand -hex 32
   
   # Or use online: https://generate-secret.vercel.app/32
   ```

6. Click **"Create Web Service"**

### Step 3: Get Backend URL

1. Wait for deployment to complete (2-5 minutes)
2. Render provides a URL like: `https://hrms-backend.onrender.com`
3. **Copy this URL** - you'll need it for Vercel!

### Step 4: Test Backend

```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/api/health

# Should return:
# {"status":"OK","message":"HRMS Backend API is running"}
```

**Note:** Free tier on Render spins down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

---

## Part 3: Frontend Deployment (Vercel) 🎨

### Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `staff-verse`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables** - Add:
   ```
   VITE_API_URL = https://your-backend-url.onrender.com/api
   ```
   Replace with your actual Render backend URL!

6. Click **"Deploy"**

### Alternative: Deploy via CLI

```bash
cd staff-verse

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# When asked:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: hrms-frontend
# - Directory: ./
# - Override settings? No

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.onrender.com/api

# Redeploy with env var
vercel --prod
```

### Step 3: Get Frontend URL

1. After deployment, Vercel provides a URL like: `https://hrms-frontend.vercel.app`
2. **Copy this URL**
3. Go back to Render and update `FRONTEND_URL` environment variable

---

## Part 4: Update CORS on Render

1. Go back to Render dashboard
2. Click on your backend service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://your-frontend-url.vercel.app
   ```
5. Render will automatically redeploy

---

## Part 5: Verify Deployment ✅

### Test Backend
```bash
curl https://your-backend.onrender.com/api/health
```

### Test Frontend
1. Visit your Vercel URL
2. Should see login page

### Test Login
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change password immediately!**

---

## Quick Command Reference

### Database Migrations (Neon)
```bash
cd backend

# Update .env with Neon credentials first
npm run migrate    # Create tables
npm run seed       # Create admin user
```

### Backend (Render)
```bash
# View logs (via Render dashboard)
# Or check deployment status

# Manual redeploy
git commit --allow-empty -m "Redeploy"
git push
```

### Frontend (Vercel)
```bash
cd staff-verse

# Deploy
vercel --prod

# View logs
vercel logs

# Update environment variable
vercel env add VITE_API_URL production
# Then redeploy
vercel --prod
```

---

## Troubleshooting

### Backend Connection Issues

**Problem:** Can't connect to Neon database from Render

**Solution:**
1. Check Neon allows connections from Render IPs (should be automatic)
2. Verify environment variables match Neon connection string exactly
3. Test connection string locally first

```bash
# Test connection locally
psql "YOUR_NEON_CONNECTION_STRING"
```

### Frontend API Errors

**Problem:** Frontend shows "Failed to fetch" errors

**Solution:**
1. Verify `VITE_API_URL` in Vercel matches Render backend URL
2. Check Render backend is running (visit health endpoint)
3. Update CORS in Render to include Vercel URL
4. Rebuild frontend after changing env vars:
   ```bash
   vercel --prod
   ```

### Render Cold Starts

**Problem:** First request after inactivity is slow

**Solution:**
- This is normal on free tier (15min inactivity timeout)
- Consider upgrading to Starter plan ($7/month) for always-on
- Or use a service like UptimeRobot to ping your backend every 10 minutes

### Database Migration Issues

**Problem:** Tables not created

**Solution:**
1. Connect directly to Neon:
   ```bash
   psql "YOUR_NEON_CONNECTION_STRING"
   ```
2. Check if tables exist:
   ```sql
   \dt
   ```
3. If not, run setup script manually or re-run migrations

---

## Cost Summary

| Service | Free Tier | Paid Option |
|---------|-----------|-------------|
| **Vercel** | Unlimited (for personal) | $20/month (Pro) |
| **Render** | Free (spins down) | $7/month (Starter) |
| **Neon** | 0.5 GB storage | $19/month (Launch) |
| **Total** | **$0/month** | **$46/month** |

---

## Environment Variables Checklist

### Render (Backend)
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `JWT_SECRET=<32-char-random-string>`
- [ ] `DB_HOST=<neon-host>`
- [ ] `DB_PORT=5432`
- [ ] `DB_NAME=<neon-db-name>`
- [ ] `DB_USER=<neon-username>`
- [ ] `DB_PASSWORD=<neon-password>`
- [ ] `FRONTEND_URL=<vercel-url>`

### Vercel (Frontend)
- [ ] `VITE_API_URL=<render-backend-url>/api`

---

## Post-Deployment Tasks

1. ✅ Test health endpoint
2. ✅ Test frontend loads
3. ✅ Login with admin credentials
4. ✅ **Change admin password immediately!**
5. ✅ Create test employee
6. ✅ Test payroll processing
7. ✅ Test report generation

---

## Updating Your Deployment

### Backend Updates
```bash
git add .
git commit -m "Update backend"
git push
# Render auto-deploys
```

### Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys
```

### Environment Variable Changes

**Render:**
- Dashboard → Service → Environment → Update → Save (auto-redeploys)

**Vercel:**
```bash
vercel env add VARIABLE_NAME production
vercel --prod
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Project Issues:** Check `DEPLOY_NOW.md` for more help

---

**🎉 Your HRMS system is now live on the cloud!**

Share your frontend URL with your team: `https://your-frontend.vercel.app`
