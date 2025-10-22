# Render.com build script for Laravel
composer install --no-dev --optimize-autoloader
php artisan config:cache  
php artisan route:cache
php artisan view:cache
php artisan migrate --force