# Building APK for CRM POS Inventory App

## Method 1: EAS Build (Recommended)

1. **Install EAS CLI:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Initialize EAS:**
   ```bash
   eas build:configure
   ```

4. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Download APK:**
   - The build will be uploaded to Expo's servers
   - You'll get a download link when complete
   - Download the APK file to your computer

## Method 2: Local Development Build

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development build:**
   ```bash
   npx expo run:android
   ```

3. **Find APK:**
   - The APK will be generated in `android/app/build/outputs/apk/`
   - Look for `app-debug.apk` or `app-release.apk`

## Method 3: Expo Go (Quick Test)

1. **Start development server:**
   ```bash
   npm start
   ```

2. **Scan QR code with Expo Go app:**
   - Install Expo Go on your Android device
   - Scan the QR code to test the app
   - This is for testing only, not a standalone APK

## Important Notes

- **EAS Build** requires an Expo account (free)
- **Local Build** requires Android Studio and Android SDK
- **Expo Go** is for testing only, not distribution

## Troubleshooting

- If you get permission errors, run PowerShell as Administrator
- Make sure you have Node.js and npm installed
- For local builds, ensure Android Studio is installed

## APK Location

After successful build:
- **EAS Build**: Download from Expo dashboard
- **Local Build**: `android/app/build/outputs/apk/`
- **Expo Go**: No APK (testing only)
