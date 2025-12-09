# Build script that saves output to file
$buildLog = "build-output.log"
Write-Host "Starting Next.js build..."
Write-Host "Output will be saved to: $buildLog"
Write-Host ""

npx next build 2>&1 | Tee-Object -FilePath $buildLog

Write-Host ""
Write-Host "Build completed. Check $buildLog for full output."
