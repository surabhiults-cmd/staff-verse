# Deploy Your HRMS System Now! 🚀

Follow these **exact steps** to deploy your application. This guide assumes you're using **Railway** (easiest option).

---

## ⚡ Quick Deploy (Railway - 15 minutes)

### Step 1: Push Code to GitHub

1. **Create a GitHub repository** (if you haven't already)
2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HRMS System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Sign Up for Railway

1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)

### Step 3: Deploy Backend

1. In Railway, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Railway asks **"Configure Project"** → Select **"Deploy from subdirectory"**
5. Set **Root Directory:** `backend`
6. Railway auto-detects Node.js and starts building

### Step 4: Add Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for it to provision (about 1 minute)

### Step 5: Connect Database to Backend

1. Click on your **backend service**
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** for each of these:

```
NODE_ENV = production
DB_HOST = ${{Postgres.PGHOST}}
DB_PORT = ${{Postgres.PGPORT}}
DB_NAME = ${{Postgres.PGDATABASE}}
DB_USER = ${{Postgres.PGUSER}}
DB_PASSWORD = ${{Postgres.PGPASSWORD}}
JWT_SECRET = <paste_random_32_char_string_here>
PORT = 5000
```

**To generate JWT_SECRET:**
- Visit: https://generate-secret.vercel.app/32
- Copy the generated secret and paste it as the value

**Important:** Use the **exact format** `${{Postgres.XXX}}` for database variables - Railway will auto-replace these!

### Step 6: Get Backend URL

1. Click on **backend service**
2. Go to **"Settings"** tab
3. Under **"Domains"**, click **"Generate Domain"**
4. **Copy the URL** (e.g., `https://hrms-backend-production.up.railway.app`)
5. Save it somewhere - you'll need it for the frontend!

### Step 7: Run Database Migrations

1. In Railway, click on **backend service**
2. Go to **"Deployments"** tab
3. Click the **"..."** menu (three dots) on the latest deployment
4. Select **"Open Shell"**
5. In the terminal, run:
   ```bash
   npm run migrate
   npm run seed
   ```
6. Wait for completion (should see "✓ Admin user created successfully!")

### Step 8: Deploy Frontend

1. In the **same Railway project**, click **"+ New"**
2. Select **"GitHub Repo"** → Choose your same repository
3. Railway asks **"Configure Project"** → Select **"Deploy from subdirectory"**
4. Set **Root Directory:** `staff-verse`
5. Click on **frontend service** → **"Settings"** → **"Build & Deploy"**
6. Change **"Deploy Type"** to **"Static"**
7. Set **"Output Directory"** to: `dist`
8. Set **"Root Directory"** to: `staff-verse`

### Step 9: Configure Frontend Environment

1. Click on **frontend service** → **"Variables"** tab
2. Add:
   ```
   VITE_API_URL = https://YOUR-BACKEND-URL/api
   ```
   **Replace** `YOUR-BACKEND-URL` with your actual backend URL from Step 6!

### Step 10: Update Backend CORS

1. Go back to **backend service** → **"Variables"**
2. Add/Update:
   ```
   FRONTEND_URL = https://YOUR-FRONTEND-URL
   ```
   **Get frontend URL:**
   - Click on **frontend service** → **"Settings"**
   - Click **"Generate Domain"** under **"Domains"**
   - Copy the URL and use it here

### Step 11: Test Your Deployment! ✅

1. **Test Backend:**
   - Visit: `https://YOUR-BACKEND-URL/api/health`
   - Should see: `{"status":"OK","message":"HRMS Backend API is running"}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Should see the login page

3. **Test Login:**
   - Username: `admin`
   - Password: `admin123`
   - ⚠️ **Change password immediately!**

---

## 🐛 Troubleshooting

### Backend won't start
- Check **"Logs"** tab for errors
- Verify all environment variables are set correctly
- Make sure database variables use `${{Postgres.XXX}}` format

### Database connection error
- Verify PostgreSQL service is running (green status)
- Check database variables match the format above
- Wait a minute for database to fully provision

### Frontend shows blank page or errors
- Check browser console (F12) for errors
- Verify `VITE_API_URL` matches backend URL exactly
- Make sure backend CORS includes frontend URL

### Can't login
- Verify migrations ran successfully (`npm run migrate`)
- Check that seed script ran (`npm run seed`)
- Check backend logs for authentication errors

---

## 🎉 That's It!

Your HRMS system should now be live! Share the frontend URL with your team.

---

## 📝 Post-Deployment Checklist

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Can login with admin credentials
- [ ] Changed admin password
- [ ] Test creating an employee
- [ ] Test processing payroll
- [ ] Test generating reports

---

**Need help?** Check the `EASY_DEPLOYMENT_GUIDE.md` for more detailed information.
