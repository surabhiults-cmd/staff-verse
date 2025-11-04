# Quick Fix: Push to GitHub

## Option 1: Use Personal Access Token (Fastest - 2 minutes)

1. **Create Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `hrms-deploy`
   - Select scope: `repo` (check the box)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Push with Token:**
   ```bash
   git push https://YOUR_TOKEN@github.com/surabhiults-cmd/staff-verse.git main
   ```
   Replace `YOUR_TOKEN` with your actual token.

---

## Option 2: Update Windows Credentials (Quick)

1. Press `Windows Key + R`
2. Type: `control /name Microsoft.CredentialManager`
3. Go to "Windows Credentials"
4. Find any `github.com` entries
5. Click "Remove" or "Edit"
6. Try pushing again - Windows will ask for credentials
7. Enter username: `surabhiults-cmd` and use Personal Access Token as password

---

## Option 3: Use GitHub Desktop (Easiest)

1. Download: https://desktop.github.com
2. Sign in with `surabhiults-cmd` account
3. Add repository → Push

---

**Try Option 1 first - it's the fastest!**
