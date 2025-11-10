# iOS App Icon Setup Guide

Your app is configured to use your logo as the app icon. Here's what you need to do before submitting to the App Store:

## Current Setup
- Base logo is at: `public/logo.png`
- App icons have been configured in the Capacitor config

## Required Icon Sizes for iOS App Store

Apple requires these specific icon sizes (all PNG format, no transparency):

### Primary Icons
- **1024×1024** - App Store (already created as `app-icon-1024.png`)
- **180×180** - iPhone 3x (already created as `icon-180.png`)
- **167×167** - iPad Pro
- **152×152** - iPad 2x & iPad Mini
- **120×120** - iPhone 2x

### Additional Sizes
- **87×87** - iPhone Settings 3x
- **80×80** - iPad Settings 2x
- **76×76** - iPad 1x
- **60×60** - iPhone Settings 2x
- **58×58** - iPad Settings
- **40×40** - iPad Spotlight
- **29×29** - Settings
- **20×20** - Notifications

## How to Generate All Required Sizes

### Option 1: Use Online Tool (Easiest)
1. Go to https://appicon.co or https://makeappicon.com
2. Upload your `public/logo.png` file
3. Download the iOS icon package
4. Copy all generated icons to your iOS project at:
   ```
   ios/App/App/Assets.xcassets/AppIcon.appiconset/
   ```

### Option 2: Use Xcode (Recommended)
1. Open your iOS project in Xcode: `ios/App/App.xcworkspace`
2. Select Assets.xcassets in the left sidebar
3. Click on AppIcon
4. Drag your 1024×1024 icon into the "App Store iOS 1024pt" slot
5. Xcode can auto-generate other sizes (right-click > "Generate All Sizes")

### Option 3: Manual Creation
Use an image editor (Photoshop, GIMP, etc.) to resize `public/logo.png` to each required size.

## Important Notes

### Design Guidelines
- ✅ Use a square image (1:1 aspect ratio)
- ✅ Fill the entire icon space (no transparency)
- ✅ Use simple, recognizable imagery
- ✅ Ensure visibility at small sizes (20×20)
- ❌ Don't include text that's hard to read
- ❌ Don't use Apple UI elements
- ❌ No transparency or rounded corners (iOS adds these automatically)

### Testing Your Icons
1. Build your iOS app: `npx cap sync ios`
2. Open in Xcode: `npx cap open ios`
3. Run on simulator or device to see how icons look
4. Check home screen, settings, notifications, and search

## Splash Screen Setup

iOS also requires launch screens. These are configured in:
- Storyboard: `ios/App/App/Base.lproj/LaunchScreen.storyboard`

You can customize this in Xcode:
1. Open the iOS project in Xcode
2. Click on `LaunchScreen.storyboard`
3. Add your logo and customize the appearance

## Next Steps

1. Generate all required icon sizes using one of the methods above
2. Add them to your iOS project in Xcode
3. Test on different devices (iPhone, iPad)
4. Verify icons look good at all sizes
5. Submit to App Store

## Current Capacitor Configuration

Your `capacitor.config.ts` is already set up with:
- App ID: `com.greencabinets.designer`
- App Name: `Kitchen Designer Pro`
- Hot-reload enabled for development

Good luck with your App Store submission! 🚀
