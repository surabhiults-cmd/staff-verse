# ⚡ Quick Deploy Reference

**Stack:** Vercel (Frontend) + Render (Backend) + Neon (Database)

---

## 🗄️ 1. Database (Neon)

```bash
# 1. Create at: https://neon.tech
# 2. Get connection string
# 3. Run migrations locally:

cd backend
# Edit .env with Neon credentials
npm install
npm run migrate
npm run seed
```

**Neon Credentials Needed:**
- `DB_HOST` (e.g., `ep-xxx.region.aws.neon.tech`)
- `DB_PORT` (usually `5432`)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---

## 🔧 2. Backend (Render)

**Dashboard Setup:**
1. https://dashboard.render.com → New + → Web Service
2. Connect GitHub repo
3. Configure:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`

**Environment Variables (Render):**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate: openssl rand -hex 32>
DB_HOST=<neon-host>
DB_PORT=5432
DB_NAME=<neon-db>
DB_USER=<neon-user>
DB_PASSWORD=<neon-password>
FRONTEND_URL=<will-update-after-vercel>
```

**Get Backend URL:** `https://your-backend.onrender.com`

---

## 🎨 3. Frontend (Vercel)

**Via CLI:**
```bash
npm install -g vercel
cd staff-verse
vercel login
vercel
vercel env add VITE_API_URL production
# Enter: https://your-backend.onrender.com/api
vercel --prod
```

**Via Dashboard:**
1. https://vercel.com → Add New → Project
2. Import GitHub repo
3. Settings:
   - Framework: Vite
   - Root: `staff-verse`
   - Build: `npm run build`
   - Output: `dist`
4. Environment: `VITE_API_URL=https://your-backend.onrender.com/api`

**Get Frontend URL:** `https://your-frontend.vercel.app`

---

## 🔄 4. Connect Frontend → Backend

**Update Render CORS:**
1. Render Dashboard → Backend Service → Environment
2. Update: `FRONTEND_URL=https://your-frontend.vercel.app`
3. Auto-redeploys

---

## ✅ 5. Test

```bash
# Backend health check
curl https://your-backend.onrender.com/api/health

# Login credentials
Username: admin
Password: admin123
# ⚠️ Change immediately!
```

---

## 🚀 6. Update Deployment

```bash
# Both auto-deploy on git push:
git add .
git commit -m "Update"
git push

# Or manually:
vercel --prod  # Frontend only
```

---

## 📋 Checklist

### Neon
- [ ] Database created
- [ ] Connection string copied
- [ ] Migrations run (`npm run migrate`)
- [ ] Admin user created (`npm run seed`)

### Render
- [ ] Service created
- [ ] All env vars set (9 total)
- [ ] Health check works
- [ ] Backend URL copied

### Vercel
- [ ] Project created
- [ ] `VITE_API_URL` set
- [ ] Frontend URL copied
- [ ] Frontend loads

### Connection
- [ ] `FRONTEND_URL` updated in Render
- [ ] Can login
- [ ] Changed admin password

---

**📖 Full guide:** See `DEPLOY_COMMANDS.md`
