# 🚀 DEPLOY NOW - Exact Steps

## ✅ What's Done:
- ✅ Git initialized
- ✅ Code committed

---

## Step 1: Push to GitHub (1 minute)

### A. Create GitHub Repository
1. Open: **https://github.com/new**
2. Repository name: `hrms-system` (or any name)
3. Choose **Public** or **Private**
4. **DON'T** check any boxes
5. Click **"Create repository"**

### B. Copy the commands GitHub shows you
GitHub will show you commands like this - **COPY THEM AND RUN:**

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**Run these in your terminal!**

---

## Step 2: Setup Database on Neon (2 minutes)

### A. Go to Neon
1. Open: **https://neon.tech**
2. Click **"Sign up"** (use GitHub - fastest)
3. Click **"Create Project"**
4. Name: `hrms-database`
5. PostgreSQL: **15** or **16**
6. Region: **Choose closest to you**
7. Click **"Create Project"**

### B. Copy Database Info
After creation, you'll see a **connection string** like:
```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Extract these:**
- **DB_HOST:** `ep-xxx.region.aws.neon.tech` (the part after @)
- **DB_PORT:** `5432`
- **DB_NAME:** Usually `neondb` or shown separately
- **DB_USER:** Your username
- **DB_PASSWORD:** Your password

**SAVE THESE - You'll need them!**

### C. Run Migrations (In Terminal)
```bash
cd backend

# Create .env file (or edit if exists)
# Add these lines (replace with YOUR Neon values):
```

**Create/edit `backend/.env` file:**
```env
DB_HOST=ep-xxx.region.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your_username
DB_PASSWORD=your_password
NODE_ENV=production
JWT_SECRET=change-this-to-random-secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Then run:**
```bash
npm install
npm run migrate
npm run seed
```

**You should see:** ✅ Admin user created!

---

## Step 3: Deploy Backend on Render (2 minutes)

### A. Go to Render
1. Open: **https://dashboard.render.com**
2. Click **"Sign up"** (use GitHub - fastest)
3. Click **"New +"** button (top right)
4. Click **"Web Service"**
5. Click **"Connect GitHub"** (if first time)
6. **Select your repository** from the list
7. Click **"Connect"**

### B. Configure Backend
Fill in these **exact** settings:

- **Name:** `hrms-backend`
- **Region:** Choose closest
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ **IMPORTANT!**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free`

### C. Add Environment Variables
Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** for EACH of these (one at a time):

1. **Key:** `NODE_ENV` **Value:** `production`
2. **Key:** `PORT` **Value:** `10000`
3. **Key:** `JWT_SECRET` **Value:** `your-random-secret-here` 
   - Generate at: https://generate-secret.vercel.app/32
4. **Key:** `DB_HOST` **Value:** `your-neon-host` (from Step 2)
5. **Key:** `DB_PORT` **Value:** `5432`
6. **Key:** `DB_NAME` **Value:** `your-neon-db-name` (from Step 2)
7. **Key:** `DB_USER` **Value:** `your-neon-username` (from Step 2)
8. **Key:** `DB_PASSWORD` **Value:** `your-neon-password` (from Step 2)
9. **Key:** `FRONTEND_URL` **Value:** `https://placeholder.vercel.app` (we'll fix this later)

### D. Deploy
1. Scroll down
2. Click **"Create Web Service"**
3. **Wait 2-5 minutes** for deployment
4. When done, you'll see a URL like: `https://hrms-backend.onrender.com`
5. **COPY THIS URL** - You need it for frontend!

### E. Test Backend
Open this URL in browser:
```
https://your-backend-url.onrender.com/api/health
```

Should show: `{"status":"OK","message":"HRMS Backend API is running"}`

---

## Step 4: Deploy Frontend on Vercel (1 minute)

### A. Go to Vercel
1. Open: **https://vercel.com**
2. Click **"Sign up"** (use GitHub - fastest)
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. **Select your repository**
6. Click **"Import"**

### B. Configure Frontend
Change these settings:

- **Framework Preset:** `Vite` (should auto-detect)
- **Root Directory:** `staff-verse` ⚠️ **CHANGE THIS!** (Click "Edit" next to it)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### C. Add Environment Variable
1. Scroll to **"Environment Variables"**
2. Click **"Add"**
3. **Name:** `VITE_API_URL`
4. **Value:** `https://your-backend-url.onrender.com/api`
   - **Replace `your-backend-url` with YOUR Render backend URL from Step 3!**
5. Click **"Save"**

### D. Deploy
1. Scroll down
2. Click **"Deploy"**
3. **Wait 1-3 minutes**
4. When done, you'll see a URL like: `https://hrms-frontend.vercel.app`
5. **COPY THIS URL** - You need it for backend!

---

## Step 5: Connect Frontend & Backend (30 seconds)

### Update Render CORS
1. Go back to **Render dashboard**
2. Click on your **`hrms-backend`** service
3. Click **"Environment"** tab
4. Find **`FRONTEND_URL`** variable
5. Click the **pencil icon** (edit) or **"Update"**
6. Change value to: `https://your-frontend-url.vercel.app`
   - **Use YOUR Vercel URL from Step 4!**
7. Click **"Save Changes"**
8. Render will **auto-redeploy** (takes 1-2 minutes)

---

## ✅ DONE! Test Your App

1. **Open your Vercel frontend URL** in browser
2. You should see the **login page**
3. **Login with:**
   - Username: `admin`
   - Password: `admin123`
4. ⚠️ **Change password immediately after first login!**

---

## 🎉 Your App is LIVE!

**Frontend URL:** `https://your-frontend.vercel.app`
**Backend URL:** `https://your-backend.onrender.com`

Share the frontend URL with your team!

---

## 🆘 Problems?

- **Backend won't start?** Check Render logs
- **Frontend shows errors?** Check `VITE_API_URL` is correct
- **Can't login?** Make sure you ran `npm run seed` in Step 2
