@echo off
echo 🆓 PetCare Free Deployment Setup
echo ================================

echo.
echo 📝 Generating Laravel application key...
cd backend
php artisan key:generate --show > temp_key.txt
set /p APP_KEY=<temp_key.txt
del temp_key.txt

echo.
echo 📋 Your Laravel APP_KEY is: %APP_KEY%
echo.
echo 🎯 Next Steps:
echo 1. Create account at render.com
echo 2. Connect your GitHub repository  
echo 3. Create new Web Service with these settings:
echo    - Root Directory: backend
echo    - Build Command: ./render-build.sh
echo    - Start Command: php artisan serve --host=0.0.0.0 --port=$PORT
echo.
echo 4. Create PostgreSQL database on Render
echo 5. Set environment variables using .env.render template
echo 6. Use the APP_KEY generated above
echo.
echo 📖 Full guide: FREE_BACKEND_HOSTING.md
echo.
echo ✅ Ready for FREE deployment!
pause