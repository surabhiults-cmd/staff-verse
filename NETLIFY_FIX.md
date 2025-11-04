# 🔧 Fix Netlify Deployment Issues

## Problems Fixed:
1. ✅ Navigation not working (SPA routing)
2. ✅ Functionalities not working (API connection)

## Step 1: Verify Netlify Build Settings

In Netlify Dashboard → Your Site → **Site settings** → **Build & deploy**:

### Build settings:
- **Base directory:** `staff-verse` (or leave empty if building from root)
- **Build command:** `npm run build`
- **Publish directory:** `staff-verse/dist` (or `dist` if base is `staff-verse`)

## Step 2: Set Environment Variables (CRITICAL!)

In Netlify Dashboard → Your Site → **Site settings** → **Environment variables**:

Add these variables:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Replace `your-backend-url.onrender.com` with your actual Render backend URL!**

### How to find your Render backend URL:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service
3. Copy the URL (e.g., `https://hrms-backend-xyz.onrender.com`)
4. Add `/api` at the end for the full API URL

## Step 3: Update Backend CORS (IMPORTANT!)

Your backend needs to allow requests from your Netlify domain.

### In Render Dashboard → Your Backend Service → Environment:

Add or update:
```
FRONTEND_URL=https://your-netlify-site.netlify.app
```

Or update `backend/server.js` to allow your Netlify domain:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://your-netlify-site.netlify.app', // Add your Netlify URL here
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000'
];
```

## Step 4: Verify Files Are Committed

Make sure these files are in your repository:

1. ✅ `netlify.toml` (at root)
2. ✅ `staff-verse/public/_redirects`

## Step 5: Trigger New Deployment

After making changes:

1. **In Netlify:** Go to **Deploys** tab → **Trigger deploy** → **Deploy site**
2. **Or push to GitHub:** Netlify will auto-deploy

## Step 6: Test Your Application

1. Open your Netlify URL
2. Check browser console (F12) for errors
3. Try logging in
4. Test navigation (refresh on different pages)
5. Test API calls (create employee, etc.)

## 🔍 Troubleshooting

### Issue: Still getting blank page on refresh
- ✅ Check that `_redirects` file exists in `staff-verse/public/`
- ✅ Verify `netlify.toml` has redirects section
- ✅ Check Netlify build logs for errors

### Issue: "API connection failed" or CORS errors
- ✅ Verify `VITE_API_URL` is set in Netlify environment variables
- ✅ Check backend CORS allows your Netlify domain
- ✅ Verify backend is running (check Render dashboard)
- ✅ Check browser console for specific error messages

### Issue: Build failing
- ✅ Check Netlify build logs
- ✅ Verify `package.json` exists in `staff-verse/`
- ✅ Verify Node version matches (use 18)

### Issue: Environment variables not working
- ✅ Redeploy after adding environment variables
- ✅ Variables must start with `VITE_` to be accessible in Vite
- ✅ Restart deployment after adding variables

## ✅ Checklist

- [ ] `netlify.toml` exists at root
- [ ] `staff-verse/public/_redirects` exists
- [ ] `VITE_API_URL` set in Netlify environment variables
- [ ] Backend CORS updated to allow Netlify domain
- [ ] Build settings configured correctly
- [ ] New deployment triggered
- [ ] Tested navigation (refresh on different routes)
- [ ] Tested API calls (login, fetch data)

## 🚀 Quick Commands

After making changes, commit and push:

```bash
git add netlify.toml staff-verse/public/_redirects
git commit -m "Fix Netlify deployment and navigation"
git push origin main
```

Netlify will automatically redeploy!
