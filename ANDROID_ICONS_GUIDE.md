# Android App Icons & Adaptive Icons Guide

Complete guide for creating Android app icons and adaptive icons for Google Play Store submission.

---

## 📱 Android Icon Requirements

### Google Play Store Icon (Required)
- **Size**: 512×512 pixels
- **Format**: 32-bit PNG with alpha channel
- **Purpose**: Displayed in Play Store listing
- **Already created**: `public/icon-512.png` ✅

### Adaptive Icons (Android 8.0+)

Android uses a two-layer adaptive icon system:

#### Foreground Layer
- **Size**: 108×108dp (432×432px at xxxhdpi)
- **Safe Zone**: Center 72×72dp (288×288px at xxxhdpi)
- **Format**: PNG with transparency
- **Content**: Your logo/icon design

#### Background Layer
- **Size**: 108×108dp (432×432px at xxxhdpi)
- **Format**: PNG or XML color
- **Content**: Solid color or pattern

### Legacy Icons (Android 7.1 and below)

Standard launcher icons for older Android versions:

- **xxxhdpi**: 192×192px
- **xxhdpi**: 144×144px
- **xhdpi**: 96×96px
- **hdpi**: 72×72px
- **mdpi**: 48×48px

---

## 🎨 Adaptive Icon Design Guidelines

### The 108dp Canvas

```
┌─────────────────────────────┐
│         108 × 108            │  Full canvas
│  ┌─────────────────────┐    │
│  │                      │    │
│  │     72 × 72          │    │  Safe zone (your logo goes here)
│  │    (Safe Zone)       │    │
│  │                      │    │
│  └─────────────────────┘    │
│                              │
└─────────────────────────────┘
```

### Key Rules

✅ **DO:**
- Keep important content in the 72×72dp safe zone
- Use simple, recognizable shapes
- Ensure good contrast between layers
- Test on different device shapes (circle, squircle, rounded square)
- Use transparency in foreground layer

❌ **DON'T:**
- Put important content near edges (will be cropped)
- Use text that's too small
- Make foreground and background too similar
- Use gradients that rely on specific shapes

### Adaptive Icon Masks

Different Android devices use different shapes:

- **Circle**: Pixel phones
- **Squircle**: Samsung, OnePlus
- **Rounded Square**: Others
- **Square**: Some manufacturers

Your icon will be masked to these shapes, so keep content in the safe zone!

---

## 🛠️ How to Generate Android Icons

### Method 1: Android Studio (Recommended)

Once you have your project set up locally:

```bash
# Sync your project
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Right-click on `res` folder
2. Select **New → Image Asset**
3. Choose **Launcher Icons (Adaptive and Legacy)**
4. Upload your foreground image (512×512 recommended)
5. Set background color or image
6. Preview on different device shapes
7. Click **Next** then **Finish**

Android Studio will automatically generate all required sizes!

### Method 2: Online Tools

#### App Icon Generator
1. Visit https://appicon.co
2. Upload your 1024×1024 logo
3. Select "Android" platform
4. Download the generated icon pack
5. Extract to `android/app/src/main/res/`

#### Android Asset Studio
1. Visit https://romannurik.github.io/AndroidAssetStudio/
2. Go to "Launcher icon generator"
3. Upload your icon
4. Configure foreground and background
5. Preview adaptive icon shapes
6. Download and copy to project

### Method 3: Manual Creation

Use image editing software to create:

1. **Foreground Layer** (432×432px)
   - Your logo centered
   - Transparent background
   - Keep design in center 288×288px

2. **Background Layer** (432×432px)
   - Solid color matching your brand
   - Or subtle pattern
   - Full bleed (use entire canvas)

3. **Legacy Icons**
   - Resize logo to each required size
   - Add padding/background as needed

---

## 📁 Android Icon File Structure

After generation, your Android project should have this structure:

```
android/app/src/main/res/
├── mipmap-anydpi-v26/
│   ├── ic_launcher.xml          # Adaptive icon config
│   └── ic_launcher_round.xml    # Round adaptive icon config
├── mipmap-xxxhdpi/
│   ├── ic_launcher.png           # 192×192
│   ├── ic_launcher_round.png     # 192×192 (round)
│   ├── ic_launcher_foreground.png # Adaptive foreground
│   └── ic_launcher_background.png # Adaptive background
├── mipmap-xxhdpi/
│   ├── ic_launcher.png           # 144×144
│   └── ic_launcher_round.png     # 144×144
├── mipmap-xhdpi/
│   ├── ic_launcher.png           # 96×96
│   └── ic_launcher_round.png     # 96×96
├── mipmap-hdpi/
│   ├── ic_launcher.png           # 72×72
│   └── ic_launcher_round.png     # 72×72
└── mipmap-mdpi/
    ├── ic_launcher.png           # 48×48
    └── ic_launcher_round.png     # 48×48
```

---

## 🎨 Design Recommendations for Kitchen Designer Pro

### Foreground Layer Options

**Option 1: Logo Only**
- Use your Green Cabinets logo
- Center it in the safe zone
- Add subtle drop shadow for depth
- Transparent background

**Option 2: Icon + Symbol**
- Cabinet/kitchen icon in foreground
- Simplified, recognizable shape
- High contrast with background

**Option 3: Minimalist**
- Single letter "K" or "KD"
- Modern, bold typography
- Professional appearance

### Background Layer

**Recommended**: Solid color from your brand
- Primary Green: `#1e7b5f`
- Dark Background: `#030303`
- Light variant for contrast

**Alternative**: Subtle gradient
- Two-tone green gradient
- Adds depth without distraction
- Must work with any foreground

---

## 🧪 Testing Your Icons

### Preview on Different Shapes

1. **In Android Studio**:
   - Image Asset tool shows all shape previews
   - Test before generating

2. **On Device**:
   ```bash
   npx cap run android
   ```
   - Check home screen appearance
   - Verify in app drawer
   - Test on different Android versions

3. **Shape Testing Tools**:
   - https://adapticon.tooo.io/
   - Upload your icon layers
   - Preview all possible shapes

### Checklist
- [ ] Icon recognizable at 48×48px
- [ ] Logo stays in safe zone on all shapes
- [ ] Good contrast between layers
- [ ] Looks professional on circle shape
- [ ] Looks professional on squircle
- [ ] Looks professional on rounded square
- [ ] No important content gets cropped
- [ ] Colors match brand identity

---

## 📋 Android Icon Checklist

### Required Files
- [ ] Play Store icon (512×512) - `icon-512.png` ✅
- [ ] Adaptive icon foreground layer (432×432)
- [ ] Adaptive icon background layer (432×432 or XML color)
- [ ] Legacy icons (all densities: mdpi to xxxhdpi)
- [ ] Round icons (optional but recommended)

### Configuration Files
- [ ] `ic_launcher.xml` (adaptive icon manifest)
- [ ] `ic_launcher_round.xml` (round variant)
- [ ] All PNG files in correct mipmap folders
- [ ] Colors in `colors.xml` (if using color background)

### Quality Checks
- [ ] All images are PNG format
- [ ] Foreground has transparency
- [ ] No pixelation at any size
- [ ] Matches brand guidelines
- [ ] Tested on multiple device shapes
- [ ] Looks good on light and dark backgrounds

---

## 🚀 Integration with Capacitor

### Update capacitor.config.ts

Your config should include:

```typescript
android: {
  allowMixedContent: true,
  icon: 'public/logo.png', // Source for icon generation
  adaptiveIcon: {
    foreground: 'public/logo.png',
    background: '#1e7b5f' // Your brand green
  }
}
```

### Sync Changes

After generating icons:

```bash
# Sync all changes to Android project
npx cap sync android

# Test on emulator or device
npx cap run android
```

---

## 🎯 Next Steps

1. **Generate Icons**: Use Android Studio Image Asset tool
2. **Test Shapes**: Preview on different devices/shapes
3. **Update Manifest**: Ensure `AndroidManifest.xml` references correct icons
4. **Build APK/AAB**: Test final build before Play Store submission
5. **Upload to Play Console**: Submit 512×512 icon with app listing

---

## 💡 Pro Tips

### Icon Design
- **Simple is Better**: Complex designs don't scale well
- **Test in Grayscale**: Ensure icon works without color
- **Avoid Text**: Hard to read at small sizes
- **Use Vectors**: Scale perfectly to any size
- **Brand Consistency**: Match your web/iOS icons

### Technical
- **Use xxxhdpi**: Generate from highest resolution
- **Compress PNGs**: Use tools like TinyPNG for smaller file sizes
- **Version Control**: Keep source files (AI/SVG) in repo
- **Automate**: Use scripts to regenerate icons when logo changes

### Play Store Optimization
- **A/B Test**: Try different icon designs to see what converts
- **Seasonal**: Update icons for holidays (with caution)
- **Professional**: Invest in professional icon design if needed
- **Consistency**: Keep consistent with iOS icon design

---

## 📚 Resources

### Tools
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) - Official Google tool
- [App Icon Generator](https://appicon.co) - Multi-platform icon generator
- [Adapticon](https://adapticon.tooo.io/) - Preview adaptive icon shapes
- [Android Icon Animator](https://romannurik.github.io/AndroidIconAnimator/) - Create animated icons

### Documentation
- [Android Adaptive Icons Guide](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Material Design Icons](https://material.io/design/iconography/)
- [Play Store Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)

### Design Inspiration
- [Dribbble - App Icons](https://dribbble.com/search/app-icon)
- [Behance - Mobile App Icons](https://www.behance.net/search/projects?search=mobile%20app%20icons)

---

Good luck with your Android icon creation! 🤖
