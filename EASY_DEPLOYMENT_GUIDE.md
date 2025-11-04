# Easy Deployment Guide - Railway (Recommended)

This is the **easiest** way to deploy your HRMS project. Railway handles most of the setup automatically!

## Why Railway?

✅ **Free tier available**  
✅ **No server management needed**  
✅ **Automatic SSL certificates**  
✅ **One-click database setup**  
✅ **Auto-deploys from GitHub**  
✅ **Simple environment variable management**

---

## Step-by-Step Deployment

### Part 1: Deploy Backend

#### Step 1: Sign up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with GitHub (easiest option)

#### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your HRMS repository
4. Railway will auto-detect it's a Node.js project

#### Step 3: Configure Backend

1. Railway will ask "What to deploy?" - Select **`backend`** folder
2. Railway will automatically:
   - Detect Node.js
   - Run `npm install`
   - Start your server

#### Step 4: Add PostgreSQL Database

1. In your project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway creates a database automatically

#### Step 5: Set Environment Variables

Click on your backend service → **"Variables"** tab → Add these:

```env
NODE_ENV=production
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=<generate_random_secret>
PORT=5000
FRONTEND_URL=<your_frontend_url>
```

**To generate JWT_SECRET:**
- Go to: https://generate-secret.vercel.app/32
- Or run: `openssl rand -hex 32` (in terminal)

**Note:** Railway provides database connection variables automatically. Use `${{Postgres.PGHOST}}` format to reference them.

#### Step 6: Run Database Migrations

1. Click on your backend service
2. Go to **"Deployments"** tab
3. Click the **"..."** menu on latest deployment
4. Select **"Open Shell"**
5. Run:
   ```bash
   npm run migrate
   npm run seed
   ```

#### Step 7: Get Your Backend URL

1. Click on your backend service
2. Go to **"Settings"** tab
3. Under **"Domains"**, click **"Generate Domain"**
4. Copy the URL (e.g., `https://hrms-backend-production.up.railway.app`)

---

### Part 2: Deploy Frontend

#### Step 1: Create Frontend Service

1. In the same Railway project, click **"+ New"**
2. Select **"GitHub Repo"** (select same repo)
3. Select **`staff-verse`** folder

#### Step 2: Configure Build Settings

Click on frontend service → **"Settings"** → **"Build & Deploy"**:

- **Build Command:** `npm run build`
- **Start Command:** `npm run preview` (or use static file serving)
- **Root Directory:** `staff-verse`

**OR** use Railway's static site serving:

1. Go to **"Settings"** → **"Deploy"**
2. Select **"Static"** as deployment type
3. Set **Output Directory:** `dist`

#### Step 3: Set Frontend Environment Variables

Add in **"Variables"** tab:

```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

**Replace** `your-backend-url.railway.app` with your actual backend URL from Part 1.

#### Step 4: Get Frontend URL

1. Go to frontend service → **"Settings"**
2. Click **"Generate Domain"** under **"Domains"**
3. Copy the URL

#### Step 5: Update Backend CORS

Go back to backend service → **"Variables"** → Update:

```env
FRONTEND_URL=https://your-frontend-url.railway.app
```

---

## Alternative: Render (Also Easy!)

If Railway doesn't work, try Render:

### Backend on Render:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository
5. Settings:
   - **Name:** hrms-backend
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

6. **Add PostgreSQL:**
   - Click **"New +"** → **"PostgreSQL"**
   - Create database
   - Copy connection string

7. **Environment Variables:**
   ```env
   NODE_ENV=production
   DB_HOST=<from_render_database>
   DB_PORT=5432
   DB_NAME=<from_render_database>
   DB_USER=<from_render_database>
   DB_PASSWORD=<from_render_database>
   JWT_SECRET=<generate_random>
   PORT=10000
   FRONTEND_URL=<your_frontend_url>
   ```

### Frontend on Render:

1. **New +** → **"Static Site"**
2. Connect repository
3. Settings:
   - **Root Directory:** staff-verse
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** dist

4. **Environment Variables:**
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

---

## Quick Checklist

After deployment:

- [ ] Backend is running (check URL)
- [ ] Database migrations ran successfully
- [ ] Admin user created (username: `admin`, password: `admin123`)
- [ ] Frontend URL set in backend CORS
- [ ] Frontend API URL set correctly
- [ ] Can access frontend
- [ ] Can login with admin credentials

---

## Testing Your Deployment

1. **Test Backend:**
   - Visit: `https://your-backend.railway.app/api/health`
   - Should return: `{"status":"ok"}`

2. **Test Frontend:**
   - Visit your frontend URL
   - Should load the login page

3. **Test Login:**
   - Username: `admin`
   - Password: `admin123`
   - ⚠️ **Change password immediately after first login!**

---

## Troubleshooting

### Backend won't start

- Check **"Logs"** tab for errors
- Verify all environment variables are set
- Make sure database is connected

### Database connection error

- Check database service is running (green status)
- Verify DB variables use `${{Postgres.XXX}}` format on Railway
- On Render, use the connection string provided

### Frontend shows API errors

- Verify `VITE_API_URL` matches backend URL
- Check backend CORS includes frontend URL
- Open browser console to see specific errors

### Can't access admin

- Run migrations: `npm run migrate`
- Create admin: `npm run seed`
- Check logs for errors

---

## Cost Estimate

### Railway:
- **Free tier:** 500 hours/month
- **Hobby:** $5/month (unlimited)
- **Database:** Included

### Render:
- **Free tier:** Available (spins down after inactivity)
- **Starter:** $7/month per service
- **Database:** $7/month

---

## Need Help?

1. Check Railway/Render logs
2. Verify environment variables
3. Test backend API: `curl https://your-backend-url/api/health`
4. Check browser console for frontend errors

---

**That's it! Your HRMS system should be live in about 15-30 minutes! 🚀**
