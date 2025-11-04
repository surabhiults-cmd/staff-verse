# 🚀 Full Deployment Guide - Start Here!

Follow these steps **in order** to deploy your HRMS system.

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] GitHub account (create at: https://github.com/signup)
- [ ] Neon account (create at: https://neon.tech)
- [ ] Render account (create at: https://render.com)
- [ ] Vercel account (create at: https://vercel.com)
- [ ] Node.js installed (check with: `node --version`)

---

## Step 1: Prepare Your Code for GitHub 📦

### 1.1 Initialize Git (if not done)

```bash
# You're already in the project directory
git init
git add .
git commit -m "Initial commit - HRMS System ready for deployment"
```

### 1.2 Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `hrms-payroll-system` (or any name you like)
3. Make it **Public** or **Private** (your choice)
4. **DO NOT** check "Initialize with README"
5. Click **"Create repository"**

### 1.3 Push to GitHub

After creating the repo, GitHub will show you commands. Use these:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**Replace:**
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

---

## Step 2: Setup Database (Neon) 🗄️

### 2.1 Create Neon Database

1. Go to: https://neon.tech
2. Sign up (free account)
3. Click **"Create Project"**
4. Fill in:
   - **Project Name:** `hrms-database`
   - **PostgreSQL Version:** 15 or 16
   - **Region:** Choose closest to you
5. Click **"Create Project"**

### 2.2 Get Database Credentials

After creation, you'll see:
- **Connection String** (copy this!)
- Separate credentials (save these!)

**Extract these values:**
- `DB_HOST` - looks like: `ep-xxx.region.aws.neon.tech`
- `DB_PORT` - usually `5432`
- `DB_NAME` - your database name
- `DB_USER` - your username
- `DB_PASSWORD` - your password

### 2.3 Run Migrations Locally

1. **Create/Edit `.env` file in `backend/` folder:**

```bash
cd backend
```

Create or edit `backend/.env`:

```env
DB_HOST=ep-xxx.region.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your_username
DB_PASSWORD=your_password
NODE_ENV=production
JWT_SECRET=your-secret-key-change-this
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Replace with your actual Neon credentials!**

2. **Run migrations:**

```bash
npm install
npm run migrate
npm run seed
```

**Expected output:**
```
✓ Database tables created successfully!
✓ Admin user created successfully!

Login credentials:
  Username: admin
  Email: admin@hrms.com
  Password: admin123
```

✅ **Database is ready!**

---

## Step 3: Deploy Backend (Render) 🔧

### 3.1 Create Render Service

1. Go to: https://dashboard.render.com
2. Sign up/login (use GitHub for easy connection)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select your repository

### 3.2 Configure Backend Service

**Basic Settings:**
- **Name:** `hrms-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free

### 3.3 Add Environment Variables

Click **"Add Environment Variable"** and add these **ONE BY ONE**:

```
NODE_ENV = production
```

```
PORT = 10000
```

```
JWT_SECRET = <generate-random-32-chars>
```

**To generate JWT_SECRET:**
```bash
# On Windows PowerShell:
- [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
# Or use online: https://generate-secret.vercel.app/32
```

```
DB_HOST = <your-neon-host>
```

```
DB_PORT = 5432
```

```
DB_NAME = <your-neon-db-name>
```

```
DB_USER = <your-neon-username>
```

```
DB_PASSWORD = <your-neon-password>
```

```
FRONTEND_URL = https://placeholder.vercel.app
```
(We'll update this after frontend is deployed)

### 3.4 Deploy and Get URL

1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. Once deployed, you'll see a URL like: `https://hrms-backend.onrender.com`
4. **Copy this URL** - you need it for frontend!

### 3.5 Test Backend

Open this URL in browser:
```
https://your-backend-url.onrender.com/api/health
```

Should see:
```json
{"status":"OK","message":"HRMS Backend API is running"}
```

✅ **Backend is deployed!**

---

## Step 4: Deploy Frontend (Vercel) 🎨

### 4.1 Create Vercel Project

1. Go to: https://vercel.com
2. Sign up/login (use GitHub for easy connection)
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository
5. Select your repository

### 4.2 Configure Frontend

**Project Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `staff-verse` (IMPORTANT!)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4.3 Add Environment Variable

Click **"Environment Variables"** → **"Add"**:

**Variable Name:**
```
VITE_API_URL
```

**Value:**
```
https://your-backend-url.onrender.com/api
```

**Replace `your-backend-url` with your actual Render backend URL from Step 3!**

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait 1-3 minutes
3. Once deployed, you'll get a URL like: `https://hrms-frontend.vercel.app`
4. **Copy this URL** - you need it for backend CORS!

✅ **Frontend is deployed!**

---

## Step 5: Connect Frontend & Backend 🔗

### 5.1 Update Backend CORS

1. Go back to Render dashboard
2. Click on your `hrms-backend` service
3. Go to **"Environment"** tab
4. Find `FRONTEND_URL` variable
5. Click **"Edit"** or **"Update"**
6. Change value to your Vercel frontend URL:
   ```
   FRONTEND_URL = https://your-frontend-url.vercel.app
   ```
7. Click **"Save Changes"**
8. Render will automatically redeploy (takes 1-2 minutes)

✅ **Connection complete!**

---

## Step 6: Test Everything! ✅

### 6.1 Test Backend

Visit in browser:
```
https://your-backend.onrender.com/api/health
```

Should show:
```json
{"status":"OK","message":"HRMS Backend API is running"}
```

### 6.2 Test Frontend

1. Visit your Vercel URL: `https://your-frontend.vercel.app`
2. Should see the login page

### 6.3 Test Login

**Login Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change the password immediately after first login!

---

## 🎉 Deployment Complete!

Your HRMS system is now live! Share your frontend URL with your team.

**Frontend URL:** `https://your-frontend.vercel.app`

---

## 📋 Quick Reference

### Update Your Deployment

**Backend changes:**
```bash
git add .
git commit -m "Update backend"
git push
# Render auto-deploys
```

**Frontend changes:**
```bash
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys
```

### View Logs

**Render (Backend):**
- Dashboard → Service → Logs tab

**Vercel (Frontend):**
- Dashboard → Project → Deployments → Click deployment → View logs

---

## 🆘 Need Help?

### Common Issues:

1. **Backend won't start:**
   - Check Render logs
   - Verify all environment variables are set
   - Check database connection

2. **Frontend shows API errors:**
   - Verify `VITE_API_URL` is correct
   - Check backend is running
   - Update CORS in Render

3. **Can't login:**
   - Verify migrations ran: `npm run migrate`
   - Verify seed ran: `npm run seed`
   - Check backend logs

---

## 📝 Deployment Checklist

- [ ] Step 1: Code pushed to GitHub
- [ ] Step 2: Neon database created
- [ ] Step 2: Migrations run successfully
- [ ] Step 3: Backend deployed on Render
- [ ] Step 3: Backend health check works
- [ ] Step 4: Frontend deployed on Vercel
- [ ] Step 5: CORS updated in Render
- [ ] Step 6: Can access frontend
- [ ] Step 6: Can login successfully
- [ ] Step 6: Changed admin password

---

**Ready? Let's start! Follow Step 1 above.** 🚀
