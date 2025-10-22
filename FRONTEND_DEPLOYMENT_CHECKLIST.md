# 🚀 PetCare Frontend Deployment Checklist

## Pre-Deployment Checklist
- [ ] Code is committed to git
- [ ] Repository is pushed to GitHub
- [ ] Frontend folder contains package.json
- [ ] Build process works locally (`npm run build`)

## Vercel Deployment Steps

### 1. Create Vercel Account
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub account
- [ ] Authorize Vercel to access your repositories

### 2. Import Project
- [ ] Click "New Project" on Vercel dashboard
- [ ] Find your PetCare repository in the list
- [ ] Click "Import" next to your repository

### 3. Configure Project Settings
- [ ] **Project Name**: `petcare-frontend` (or your preference)
- [ ] **Root Directory**: Set to `frontend` (IMPORTANT!)
- [ ] **Framework**: Should auto-detect "Create React App"
- [ ] **Build Command**: `npm run build` (should be auto-detected)
- [ ] **Output Directory**: `build` (should be auto-detected)

### 4. Environment Variables
Add these environment variables:

```
REACT_APP_API_URL = http://petcare-production-2613.up.railway.app
```

*(Update this later when you deploy your backend)*

### 5. Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Note down your deployment URL

## Post-Deployment

### Test Your Deployment
- [ ] Visit your Vercel URL
- [ ] Check that the home page loads
- [ ] Verify navigation works
- [ ] Test responsive design on mobile

### Expected URL Format
Your frontend will be available at:
```
https://petcare-frontend-[random-string].vercel.app
```

## Troubleshooting

### Build Fails?
1. Check build logs in Vercel dashboard
2. Ensure `npm run build` works locally in the frontend folder
3. Check for TypeScript errors
4. Verify all dependencies are in package.json

### App Loads but API Calls Fail?
1. Check browser console for CORS errors
2. Verify REACT_APP_API_URL is set correctly
3. Backend needs to allow your Vercel domain in CORS settings

### Routing Issues (404 on refresh)?
- The vercel.json configuration should handle this
- All routes should redirect to index.html for React Router

## Next Steps After Deployment

1. **Deploy Backend**: Use the free hosting guide
2. **Update API URL**: Change REACT_APP_API_URL to your backend URL
3. **Custom Domain**: Add your own domain in Vercel settings
4. **Environment**: Set up production environment variables

## Quick Commands

```bash
# Test build locally first
cd frontend
npm run build
npx serve -s build

# Deploy with Vercel CLI (alternative method)
npm i -g vercel
cd frontend  
vercel --prod
```

## Support

If deployment fails:
1. Check Vercel build logs
2. Test `npm run build` locally
3. Ensure your GitHub repository is public
4. Verify root directory is set to `frontend`