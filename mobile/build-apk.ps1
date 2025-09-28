Write-Host "Building APK for CRM POS Inventory App..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Step 2: Starting EAS Build..." -ForegroundColor Yellow
npx @expo/eas-cli build --platform android --profile preview

Write-Host ""
Write-Host "Build process started!" -ForegroundColor Green
Write-Host "You will receive a download link when the build is complete." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
