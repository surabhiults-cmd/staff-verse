# 🔴 URGENT: Fix API URL Configuration

## Problem:
Your Netlify frontend is trying to connect to `localhost:5000` instead of your deployed backend. The console shows:
```
ERR_CONNECTION_REFUSED: localhost:5000/api/auth/login
```

## Solution: Set Environment Variable in Netlify

### Step 1: Get Your Backend URL
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service
3. Copy the URL (e.g., `https://hrms-backend-xyz.onrender.com`)

### Step 2: Set Environment Variable in Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable**
5. Enter:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api`
     - Replace `your-backend-url.onrender.com` with your actual Render URL
     - **IMPORTANT:** Include `/api` at the end!
6. Click **Save**

### Step 3: Redeploy (CRITICAL!)
After setting the environment variable, you **MUST** trigger a new deployment:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
   - Using "Clear cache" ensures the new environment variable is picked up

### Step 4: Verify
After deployment completes:
1. Open your Netlify site
2. Open browser console (F12)
3. Try logging in
4. Check console - you should see requests to your Render backend, not localhost

---

## 🔍 How to Verify Environment Variable

### Option 1: Check Build Logs
In Netlify deploy logs, you should see the build using the correct API URL.

### Option 2: Add Temporary Debug Code
Add this to `frontend/src/App.tsx` temporarily:
```typescript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

After deployment, check browser console to see if it shows your Render URL.

### Option 3: Check Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try logging in
4. You should see requests to `your-backend.onrender.com`, not `localhost:5000`

---

## ⚠️ Common Mistakes:

1. **Wrong URL format:**
   - ❌ `https://backend.onrender.com` (missing `/api`)
   - ✅ `https://backend.onrender.com/api`

2. **Not redeploying after adding variable:**
   - Environment variables are only available in NEW builds
   - You MUST redeploy after adding/changing variables

3. **Wrong variable name:**
   - ❌ `API_URL` or `REACT_APP_API_URL`
   - ✅ `VITE_API_URL` (Vite requires `VITE_` prefix)

4. **HTTP vs HTTPS:**
   - ❌ `http://backend.onrender.com/api` (Render uses HTTPS)
   - ✅ `https://backend.onrender.com/api`

---

## ✅ Quick Checklist:

- [ ] Backend deployed on Render
- [ ] Have Render backend URL (e.g., `https://xxx.onrender.com`)
- [ ] Set `VITE_API_URL` in Netlify environment variables
- [ ] Value includes `/api` at the end
- [ ] Used "Clear cache and deploy" after setting variable
- [ ] Verified in browser console (no localhost errors)
- [ ] Login works correctly

---

## 🚨 Still Not Working?

If you've set the environment variable and redeployed but still see localhost:

1. **Double-check the variable name** - must be exactly `VITE_API_URL`
2. **Check the value** - should be `https://your-backend.onrender.com/api`
3. **Clear browser cache** - hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check build logs** - verify the variable is being used during build
5. **Verify backend is running** - check Render dashboard that backend is "Live"

---

**After fixing this, your login should work correctly!** 🎉
