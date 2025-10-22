#!/bin/bash

# PetCare Deployment Setup Script
# This script helps prepare your project for deployment

echo "🚀 PetCare Deployment Setup"
echo "=========================="

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the PetCare root directory"
    exit 1
fi

echo "📝 Setting up environment files..."

# Create frontend .env if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from example"
fi

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Update API URLs in frontend using the apiConfig.ts utility"
echo "2. Set up your GitHub repository"
echo "3. Deploy backend to Railway"
echo "4. Deploy frontend to Vercel"
echo "5. Update environment variables with production URLs"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "🎉 Setup complete! Ready for deployment."