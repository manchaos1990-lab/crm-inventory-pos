@echo off
echo Building APK for CRM POS Inventory App...
echo.

echo Step 1: Installing dependencies...
npm install

echo.
echo Step 2: Starting EAS Build...
npx @expo/eas-cli build --platform android --profile preview

echo.
echo Build process started! 
echo You will receive a download link when the build is complete.
echo.
pause
