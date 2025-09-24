# PowerShell script to fix ENOENT errors in Next.js development
# Run this script when you encounter persistent ENOENT errors

Write-Host "🔧 Fixing ENOENT errors..." -ForegroundColor Yellow

# Stop any running Node.js processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear Next.js build cache
Write-Host "Clearing .next directory..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ .next directory cleared" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next directory not found" -ForegroundColor Blue
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force

# Restart development server
Write-Host "Starting development server without Turbopack..." -ForegroundColor Cyan
Write-Host "This should eliminate ENOENT errors on Windows" -ForegroundColor Green
npm run dev
