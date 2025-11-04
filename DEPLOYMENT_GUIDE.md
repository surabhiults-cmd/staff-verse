# HRMS & Payroll System - Deployment Guide

This guide covers deploying the HRMS & Payroll Management System to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Deployment Options](#deployment-options)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Environment Configuration](#environment-configuration)
8. [Security Considerations](#security-considerations)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js** v18+ installed
- **PostgreSQL** v12+ database server
- **Domain name** (optional but recommended)
- **SSL certificate** (for HTTPS)
- **Server/VPS** with at least:
  - 2GB RAM
  - 2 CPU cores
  - 20GB storage

---

## Architecture Overview

```
┌─────────────────┐
│   React App     │  (Frontend - Static files)
│   (Vite Build)  │
└────────┬────────┘
         │ HTTPS
         │
┌────────▼────────┐
│  Nginx/Caddy    │  (Reverse Proxy/Web Server)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────────┐
│ Node  │ │ PostgreSQL│
│ Backend│ │ Database  │
└───────┘ └───────────┘
```

---

## Deployment Options

### Option 1: Traditional VPS/Server (Recommended)

**Platforms:** DigitalOcean, Linode, AWS EC2, Azure VM, Google Cloud Compute

**Pros:**
- Full control
- Cost-effective
- Good for production workloads

**Cons:**
- Requires server management
- Manual SSL setup

### Option 2: Platform as a Service (PaaS)

**Platforms:** Heroku, Railway, Render, Fly.io, AWS Elastic Beanstalk

**Pros:**
- Easy deployment
- Automatic scaling
- Built-in SSL

**Cons:**
- Higher cost
- Less control

### Option 3: Docker & Container Platforms

**Platforms:** Docker Compose, Kubernetes, AWS ECS, Google Cloud Run

**Pros:**
- Consistent environments
- Easy scaling
- Isolation

**Cons:**
- More complex setup
- Requires Docker knowledge

---

## Database Setup

### 1. Create Production Database

```sql
CREATE DATABASE hrms_production;
CREATE USER hrms_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE hrms_production TO hrms_user;
```

### 2. Run Migrations

```bash
# On your server
cd backend
npm install
npm run migrate
```

Or manually:

```bash
psql -U hrms_user -d hrms_production -f migrations/001_initial_schema.sql
```

### 3. Create Admin User

```bash
npm run seed
```

**⚠️ Change default admin password immediately after deployment!**

---

## Backend Deployment

### Step 1: Prepare Backend Environment

```bash
cd backend
npm install --production
```

### Step 2: Create Production .env

Create `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_production
DB_USER=hrms_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_very_secure_random_secret_key_minimum_32_characters

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Email Configuration (for payslip delivery)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Uploads
MAX_FILE_SIZE=10485760
```

### Step 3: Create Systemd Service (Linux)

Create `/etc/systemd/system/hrms-backend.service`:

```ini
[Unit]
Description=HRMS Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/hrms/backend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=hrms-backend

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable hrms-backend
sudo systemctl start hrms-backend
sudo systemctl status hrms-backend
```

### Step 4: Install PM2 (Alternative)

```bash
npm install -g pm2
pm2 start server.js --name hrms-backend
pm2 save
pm2 startup
```

### Step 5: Create Directories

```bash
mkdir -p /var/www/hrms/backend/payslips
mkdir -p /var/www/hrms/backend/reports
chown -R www-data:www-data /var/www/hrms/backend
```

---

## Frontend Deployment

### Step 1: Build Production Bundle

```bash
cd staff-verse
npm install
npm run build
```

This creates a `dist/` folder with optimized static files.

### Step 2: Configure API URL

Create `staff-verse/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

Rebuild:

```bash
npm run build
```

### Step 3: Deploy Static Files

#### Option A: Nginx (Recommended)

Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

Create `/etc/nginx/sites-available/hrms`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/hrms/staff-verse/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/hrms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Option B: Apache

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem

    DocumentRoot /var/www/hrms/staff-verse/dist

    <Directory /var/www/hrms/staff-verse/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API requests
    ProxyPreserveHost On
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
</VirtualHost>
```

---

## Environment Configuration

### Backend Production Variables

```env
# Required
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_production
DB_USER=hrms_user
DB_PASSWORD=<secure_password>
JWT_SECRET=<generate_with_openssl_rand_hex_32>
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Optional
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email>
EMAIL_PASSWORD=<app_password>
```

Generate JWT Secret:

```bash
openssl rand -hex 32
```

### Frontend Production Variables

```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## SSL Certificate (HTTPS)

### Using Let's Encrypt (Free)

```bash
sudo apt install certbot python3-certbot-nginx

# For Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Security Considerations

### 1. Firewall Configuration

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 2. Database Security

- Use strong passwords
- Restrict database access to localhost
- Regular backups
- Enable SSL for database connections

### 3. Application Security

- Keep dependencies updated: `npm audit fix`
- Use environment variables for secrets
- Enable rate limiting (add to backend)
- Regular security audits

### 4. File Permissions

```bash
# Restrict access to sensitive files
chmod 600 backend/.env
chmod 755 backend/payslips
chmod 755 backend/reports
```

---

## Deployment to Popular Platforms

### Heroku

**Backend:**

```bash
cd backend
heroku create hrms-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set NODE_ENV=production
git push heroku main
heroku run npm run migrate
```

**Frontend:**

```bash
cd staff-verse
heroku create hrms-frontend --buildpack https://github.com/mars/create-react-app-buildpack.git
heroku config:set VITE_API_URL=https://hrms-backend.herokuapp.com/api
git push heroku main
```

### Railway

1. Connect GitHub repository
2. Select backend folder
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

### Render

1. Create PostgreSQL database
2. Deploy backend from GitHub
3. Deploy frontend as static site
4. Configure environment variables

### Docker Deployment

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: hrms_production
      POSTGRES_USER: hrms_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: hrms_production
      DB_USER: hrms_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - db
    volumes:
      - ./backend/payslips:/app/payslips
      - ./backend/reports:/app/reports

  frontend:
    build:
      context: ./staff-verse
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Backend Dockerfile:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Monitoring & Maintenance

### 1. Log Management

```bash
# View backend logs (systemd)
sudo journalctl -u hrms-backend -f

# View logs (PM2)
pm2 logs hrms-backend
```

### 2. Database Backups

Create backup script `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U hrms_user hrms_production > /backups/hrms_$DATE.sql
# Keep only last 7 days
find /backups -name "hrms_*.sql" -mtime +7 -delete
```

Add to crontab:

```bash
0 2 * * * /path/to/backup.sh
```

### 3. Health Checks

Monitor these endpoints:

- Backend: `https://api.yourdomain.com/api/health`
- Frontend: `https://yourdomain.com`

### 4. Updates

```bash
# Backend
cd backend
git pull
npm install --production
npm run migrate  # If schema changed
sudo systemctl restart hrms-backend

# Frontend
cd staff-verse
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/hrms/staff-verse/dist/
```

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
sudo journalctl -u hrms-backend -n 50

# Check port
sudo netstat -tlnp | grep 5000

# Test database connection
psql -U hrms_user -d hrms_production -h localhost
```

### Frontend shows API errors

1. Check `VITE_API_URL` is correct
2. Verify backend is running
3. Check CORS settings
4. Check browser console for errors

### Database connection fails

1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Check credentials in `.env`
3. Test connection: `psql -U hrms_user -d hrms_production`
4. Check firewall rules

### Files not generating (payslips/reports)

1. Check directory permissions
2. Verify disk space: `df -h`
3. Check application logs

---

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Admin user created and password changed
- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Performance testing done
- [ ] Security audit completed
- [ ] Documentation updated

---

## Support

For issues or questions:

1. Check logs: `sudo journalctl -u hrms-backend`
2. Review this guide
3. Check API documentation: `https://api.yourdomain.com/api-docs`
4. Review server error logs

---

## Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Administration](https://www.postgresql.org/docs/current/admin.html)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [SSL/TLS Guide](https://letsencrypt.org/docs/)

---

**Last Updated:** 2024
**Version:** 1.0
