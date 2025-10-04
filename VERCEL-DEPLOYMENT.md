# Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

1. **CSV File Location**: Ensure `sar_environmental_data_500_cities_5_years.csv` is in the `public/` folder
2. **Git Status**: Commit all changes including the public folder
3. **Build Test**: Run `npm run build` locally to verify it builds successfully

## 📦 Files Added for Deployment

- `public/sar_environmental_data_500_cities_5_years.csv` - Main data file (must be in public folder)
- `vercel.json` - Vercel configuration for proper routing and headers

## 🚀 Deployment Steps

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Click "Deploy"

## 🐛 Troubleshooting

### Issue: "Loading environmental data..." stuck
**Solutions:**
1. Check browser console for errors (F12)
2. Verify CSV file is in `public/` folder
3. Ensure the file was committed to git
4. Check Vercel build logs for errors

### Issue: 404 error on CSV file
**Solutions:**
1. Verify file path in code is `/sar_environmental_data_500_cities_5_years.csv`
2. Ensure `public/` folder is not in `.gitignore`
3. Check Vercel deployment files include the CSV

### Issue: Build fails
**Solutions:**
1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run build` locally to check for TypeScript errors
3. Check Vercel build logs for specific errors

## 📊 Expected Build Output

After successful deployment, you should see:
- Build time: 2-5 minutes
- CSV file size: ~50-100 MB
- Total deployment size: ~100-150 MB

## 🔍 Verification Steps

After deployment:
1. Open the deployed URL
2. Open browser console (F12)
3. Look for these logs:
   - "Loading CSV file..."
   - "Response status: 200 OK"
   - "CSV file loaded, size: XXXXX bytes"
   - "CSV parsed: 803442 valid rows"
4. Globe should display with data points

## 📝 Important Notes

- The CSV file is ~50MB, so first load might take 10-30 seconds
- Browser console will show progress
- If stuck, check Network tab in DevTools to see if CSV is loading
- The app requires the CSV to be served from the public folder

## 🔗 Useful Links

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Public Folder in Vite](https://vitejs.dev/guide/assets.html#the-public-directory)
