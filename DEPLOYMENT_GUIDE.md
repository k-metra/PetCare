# PetCare Project Deployment Guide

## Overview
This guide covers deploying your PetCare application with:
- **Frontend**: React TypeScript app → Vercel
- **Backend**: Laravel PHP API → Railway/DigitalOcean

## Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (recommended for backend)

---

## Part 1: Frontend Deployment to Vercel

### Step 1: Prepare Your Repository
```bash
# Navigate to your project root
cd C:\Users\LenovO\Documents\OtherProjects\PetCare

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
# (Follow GitHub's instructions to create a new repo)
git remote add origin https://github.com/yourusername/petcare.git
git branch -M main
git push -u origin main
```

### Step 2: Update API URLs in Frontend
You need to replace all hardcoded `http://petcare-production-2613.up.railway.app` URLs with the new API utility.

**Example - Update a file:**
```typescript
// OLD:
const response = await fetch('http://petcare-production-2613.up.railway.app/api/appointments', {

// NEW:
import { apiUrl } from '../utils/apiConfig';
const response = await fetch(apiUrl.appointments(), {
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the Root Directory to `frontend`
5. Configure Environment Variables:
   - Add `REACT_APP_API_URL` = `https://your-backend-url.railway.app`
6. Deploy!

### Step 4: Configure Build Settings
Vercel should auto-detect React, but ensure these settings:
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

---

## Part 2: Backend Deployment to Railway

### Step 1: Prepare Laravel for Production

**Update `backend/.env` for production:**
```env
APP_NAME="PetCare API"
APP_ENV=production
APP_KEY=base64:your_generated_key
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://your-backend-url.railway.app

DB_CONNECTION=pgsql
DB_HOST=your_postgres_host
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

CORS_ALLOWED_ORIGINS="https://your-frontend-url.vercel.app,https://your-custom-domain.com"
```

### Step 2: Add Railway Configuration
Create `backend/railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT"

[env]
APP_ENV = "production"
APP_DEBUG = "false"
```

### Step 3: Update CORS Configuration
Update `backend/config/cors.php`:
```php
<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### Step 4: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Set root path to `backend`
7. Railway will auto-detect Laravel and deploy!

---

## Part 3: Database Migration

### For Railway (PostgreSQL):
```bash
# Railway will automatically run migrations via the startCommand
# But you can also run manually in Railway's terminal:
php artisan migrate --force
php artisan db:seed --class=ServiceSeeder
```

### For Production Database:
Consider migrating from SQLite to PostgreSQL for production:
1. Update database config in `.env`
2. Run migrations: `php artisan migrate`
3. Seed data: `php artisan db:seed`

---

## Part 4: Environment Variables Setup

### Frontend (Vercel):
```
REACT_APP_API_URL=https://petcare-backend.railway.app
```

### Backend (Railway):
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://petcare-backend.railway.app
DB_CONNECTION=pgsql
CORS_ALLOWED_ORIGINS=https://petcare-frontend.vercel.app
```

---

## Part 5: Custom Domains (Optional)

### Vercel Custom Domain:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Railway Custom Domain:
1. Go to Project → Settings → Domains
2. Add custom domain
3. Update DNS records

---

## Part 6: Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] API endpoints respond correctly
- [ ] CORS is configured properly
- [ ] Authentication works
- [ ] Database migrations completed
- [ ] SSL certificates are active
- [ ] Environment variables are set correctly

---

## Troubleshooting

### Common Issues:

**1. CORS Errors:**
- Check CORS_ALLOWED_ORIGINS in backend
- Verify frontend URL in backend config

**2. API Connection Failed:**
- Confirm REACT_APP_API_URL in Vercel
- Check backend deployment status

**3. Database Errors:**
- Verify database connection in Railway
- Run migrations: `php artisan migrate --force`

**4. Authentication Issues:**
- Check APP_KEY is set in backend
- Verify Sanctum configuration

---

## Alternative Backend Hosting Options

If Railway doesn't work for you:

### DigitalOcean App Platform:
1. Create new app
2. Connect GitHub repo
3. Select Laravel preset
4. Configure environment variables
5. Deploy

### Heroku:
1. Install Heroku CLI
2. `heroku create petcare-backend`
3. `git subtree push --prefix=backend heroku main`
4. Configure add-ons and environment variables

---

## Cost Estimates

### Free Tier (Recommended for testing):
- **Vercel**: Free (with usage limits)
- **Railway**: $5/month (includes PostgreSQL)
- **Total**: ~$5/month

### Production Tier:
- **Vercel Pro**: $20/month
- **Railway Pro**: $20/month + database costs
- **Custom Domain**: $10-15/year
- **Total**: ~$40-50/month

---

## Support

If you encounter issues:
1. Check deployment logs in Vercel/Railway dashboards
2. Test API endpoints manually using Postman
3. Verify environment variables are correctly set
4. Check CORS and authentication configurations

Happy deploying! 🚀