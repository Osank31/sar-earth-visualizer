# Deployment Pre-Check Script
# Run this before deploying to Vercel

Write-Host "🔍 SAR Earth Visualizer - Deployment Check" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Check if public folder exists
if (Test-Path "public") {
    Write-Host "✅ public/ folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ public/ folder missing! Creating it..." -ForegroundColor Red
    New-Item -ItemType Directory -Path "public"
}

# Check if CSV is in public folder
if (Test-Path "public\sar_environmental_data_500_cities_5_years.csv") {
    $fileSize = (Get-Item "public\sar_environmental_data_500_cities_5_years.csv").Length / 1MB
    Write-Host "✅ CSV file in public folder (Size: $([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ CSV file missing in public folder!" -ForegroundColor Red
    if (Test-Path "sar_environmental_data_500_cities_5_years.csv") {
        Write-Host "   Found CSV in root, copying to public..." -ForegroundColor Yellow
        Copy-Item "sar_environmental_data_500_cities_5_years.csv" -Destination "public\" -Force
        Write-Host "✅ CSV copied to public folder" -ForegroundColor Green
    } else {
        Write-Host "   CSV file not found anywhere!" -ForegroundColor Red
        exit 1
    }
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules/ exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules/ missing. Run: npm install" -ForegroundColor Yellow
}

# Check if vercel.json exists
if (Test-Path "vercel.json") {
    Write-Host "✅ vercel.json exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  vercel.json missing (optional)" -ForegroundColor Yellow
}

# Test build
Write-Host "`n🔨 Testing build..." -ForegroundColor Cyan
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed! Check errors above." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build error: $_" -ForegroundColor Red
    exit 1
}

# Check dist folder
if (Test-Path "dist") {
    $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "✅ dist/ folder created (Size: $([math]::Round($distSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ dist/ folder not created" -ForegroundColor Red
}

Write-Host "`n✨ Pre-deployment check complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Commit all changes: git add . && git commit -m 'Ready for deployment'" -ForegroundColor White
Write-Host "   2. Push to GitHub: git push" -ForegroundColor White
Write-Host "   3. Deploy on Vercel dashboard or run: vercel --prod" -ForegroundColor White
Write-Host "`n🌍 Your app is ready to deploy!" -ForegroundColor Green
