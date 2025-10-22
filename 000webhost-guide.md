# 000webhost Laravel Deployment Guide

## Step 1: Create Account
1. Go to [000webhost.com](https://000webhost.com)
2. Sign up for free account
3. Create new website

## Step 2: Prepare Laravel Files
```bash
# In your backend folder
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Step 3: Upload Files
1. Use File Manager or FTP
2. Upload all files from `backend/` to `public_html/`
3. Move contents of `backend/public/` to website root
4. Update `index.php` to point to correct paths

## Step 4: Database Setup
1. Create MySQL database in cPanel
2. Update `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Step 5: Run Migrations
Use cPanel File Manager terminal or create migration script:
```php
<?php
// migrate.php - run once to setup database
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
Artisan::call('migrate', ['--force' => true]);
echo "Migration completed!";
?>
```

## Limitations
- 1-hour sleep after inactivity
- 1GB storage limit
- Limited bandwidth