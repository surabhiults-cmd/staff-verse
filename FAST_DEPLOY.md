# ⚡ FAST DEPLOYMENT - 5 Minutes Setup

## 🚀 Quick Commands (Copy-Paste Ready)

### Step 1: Push to GitHub (30 seconds)

```bash
# If you haven't created GitHub repo yet, go to: https://github.com/new
# Create empty repo, then run:

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## Step 2: Database (Neon) - 2 minutes

1. **Go to:** https://neon.tech → Sign up → Create Project
2. **Copy connection string** and extract:
   - `DB_HOST` (ep-xxx.region.aws.neon.tech)
   - `DB_PORT` (5432)
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`

3. **Run migrations:**
```bash
cd backend
# Create .env file with Neon credentials, then:
npm install
npm run migrate
npm run seed
```

✅ **Done! Admin created: `admin` / `admin123`**

---

## Step 3: Backend (Render) - 2 minutes

1. **Go to:** https://dashboard.render.com → New + → Web Service
2. **Connect GitHub repo**
3. **Settings:**
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`

4. **Add ALL Environment Variables at once:**

```
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate: openssl rand -hex 32 or use https://generate-secret.vercel.app/32>
DB_HOST=<your-neon-host>
DB_PORT=5432
DB_NAME=<neon-db>
DB_USER=<neon-user>
DB_PASSWORD=<neon-password>
FRONTEND_URL=https://placeholder.vercel.app
```

5. **Copy backend URL:** `https://your-backend.onrender.com`

---

## Step 4: Frontend (Vercel) - 1 minute

1. **Go to:** https://vercel.com → Add New → Project
2. **Import GitHub repo**
3. **Settings:**
   - Root Directory: `staff-verse`
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`

4. **Add Environment Variable:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
   (Use your actual Render URL from Step 3)

5. **Deploy → Copy frontend URL**

---

## Step 5: Connect (30 seconds)

**Go back to Render → Environment → Update:**
```
FRONTEND_URL=https://your-frontend.vercel.app
```

**Done! ✅**

---

## 🎯 Quick Test

```bash
# Test backend
curl https://your-backend.onrender.com/api/health

# Login: admin / admin123
```

---

**Total Time: ~5 minutes! 🚀**
