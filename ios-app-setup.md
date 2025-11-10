# iOS App Store Setup Guide

Your app is now configured for iOS with native styling and Capacitor integration.

## Prerequisites
- Mac with macOS (required for iOS development)
- Xcode 15+ installed
- Apple Developer Account ($99/year)

## Step 1: Export to GitHub
1. Click the GitHub button (top right in Lovable)
2. Connect your GitHub account
3. Create a new repository
4. Transfer your project

## Step 2: Clone and Setup Locally
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install

# Add iOS platform
npx cap add ios

# Update iOS platform
npx cap update ios

# Build your project
npm run build

# Sync with native platform
npx cap sync ios
```

## Step 3: Open in Xcode
```bash
npx cap open ios
```

## Step 4: Configure in Xcode

### App Identity
1. Select project in left sidebar
2. Select target under "TARGETS"
3. Go to "Signing & Capabilities"
4. Select your Team (Apple Developer Account)
5. Change Bundle Identifier to unique ID (e.g., com.yourcompany.greencabinets)

### App Icons
1. Navigate to: `ios/App/App/Assets.xcassets/AppIcon.appiconset`
2. Add your icons:
   - 1024x1024px (App Store)
   - 180x180px (iPhone)
   - 167x167px (iPad Pro)
   - 152x152px (iPad)
   - 120x120px (iPhone @2x)
   - 87x87px (iPhone @3x)
   - 76x76px (iPad)
   - 58x58px, 40x40px, 29x29px (Spotlight)

### Launch Screen
1. Navigate to: `ios/App/App/Base.lproj/LaunchScreen.storyboard`
2. Customize with your branding

### App Name
In `ios/App/App/Info.plist`, update:
```xml
<key>CFBundleDisplayName</key>
<string>Green Cabinets</string>
```

## Step 5: Test on Device/Simulator

### Simulator
1. In Xcode, select a simulator from top dropdown
2. Click Run (▶️) button
3. App launches in simulator

### Physical Device
1. Connect iPhone via USB
2. Trust computer on device
3. Select device in Xcode
4. Click Run (▶️)
5. On device: Settings > General > VPN & Device Management > Trust developer

## Step 6: Prepare for App Store

### Version & Build Numbers
In Xcode target settings:
- Version: 1.0.0 (increment for updates)
- Build: 1 (increment for each submission)

### Privacy Descriptions
Add to `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Take photos of your space for room scanning</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Save and share your cabinet designs</string>
```

### App Category
In App Store Connect, select: Shopping or Lifestyle

## Step 7: Archive and Submit

1. In Xcode: Product > Scheme > Edit Scheme
2. Set Build Configuration to "Release"
3. Product > Archive
4. Wait for archive to complete
5. Click "Distribute App"
6. Select "App Store Connect"
7. Follow wizard to upload

## Step 8: App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Fill in metadata:
   - App Name: Green Cabinets
   - Subtitle: Kitchen & Cabinet Designer
   - Description: Professional kitchen cabinet design tool
   - Keywords: kitchen, cabinets, design, remodel, home
   - Category: Shopping or Lifestyle
   - Screenshots (required):
     - 6.7" iPhone 15 Pro Max: 1290x2796
     - 6.5" iPhone: 1242x2688
     - 5.5" iPhone: 1242x2208
     - 12.9" iPad Pro: 2048x2732
4. Upload build
5. Submit for review

## Testing During Development

For hot-reload during development (changes reflect immediately):

1. Make sure `server.url` in `capacitor.config.ts` points to Lovable sandbox
2. Run: `npx cap sync ios`
3. Open in Xcode: `npx cap open ios`
4. Run on device/simulator
5. Changes in Lovable appear instantly on device

## Removing Hot-Reload for Production

Before App Store submission:

1. Comment out `server` section in `capacitor.config.ts`:
```typescript
// server: {
//   url: 'https://...',
//   cleartext: true
// }
```
2. Run: `npm run build && npx cap sync ios`
3. Archive and submit

## iOS-Specific Features Implemented

✅ Native iOS status bar styling
✅ Safe area support (notch & home indicator)
✅ iOS keyboard handling
✅ Haptic feedback
✅ iOS-style animations and transitions
✅ iOS modal presentations
✅ Native list styles
✅ iOS segmented controls
✅ Blur backgrounds
✅ Touch optimizations

## Support

For issues:
1. Check [Capacitor iOS Docs](https://capacitorjs.com/docs/ios)
2. Review [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
3. Test thoroughly before submission

## Cost Breakdown
- Apple Developer Account: $99/year
- App Store submission: Free (included in developer account)
- Updates: Free (unlimited)

Your app is fully configured and ready for iOS development! 🚀
