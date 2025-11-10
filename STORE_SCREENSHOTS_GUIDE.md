# App Store Screenshots & Assets Guide

Complete guide for creating screenshots and store listing assets for both iOS App Store and Google Play Store.

---

## 📱 iOS App Store Requirements

### Screenshot Sizes (Required)

Apple requires screenshots for different device sizes:

#### iPhone (Required - at least 2 sizes)
- **6.7" Display** (iPhone 14 Pro Max, 15 Pro Max): 1290×2796 pixels
- **6.5" Display** (iPhone 11 Pro Max, XS Max): 1242×2688 pixels
- **5.5" Display** (iPhone 8 Plus): 1242×2208 pixels

#### iPad (Required if supporting iPad)
- **12.9" Display** (iPad Pro): 2048×2732 pixels
- **11" Display** (iPad Pro): 1668×2388 pixels

### Screenshot Specifications
- **Format**: PNG or JPG (no transparency)
- **Color Space**: RGB
- **Quantity**: 3-10 screenshots per device size
- **Order**: First screenshot is most important (appears in search)

### App Preview Videos (Optional)
- **Duration**: 15-30 seconds
- **Format**: .mov, .m4v, or .mp4
- **Orientation**: Portrait or Landscape (match device)
- **Preview Poster Frame**: Required

### Additional iOS Assets

#### App Store Icon
- **Size**: 1024×1024 pixels
- **Format**: PNG (no transparency)
- **Already created**: `public/app-icon-1024.png` ✅

#### Promotional Text (Optional)
- **Max**: 170 characters
- Appears above description
- Can be updated without new app version

#### Description
- **Max**: 4,000 characters
- Not updatable without review

#### Keywords
- **Max**: 100 characters (including commas)
- Critical for App Store search
- Cannot contain app name or category

---

## 🤖 Google Play Store Requirements

### Screenshot Sizes (Required)

#### Phone Screenshots (Required)
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots
- **Size**: 320px - 3,840px (16:9 to 2:1 aspect ratio)
- **Recommended**: 1080×1920 pixels (Portrait)

#### 7" Tablet Screenshots (Optional)
- **Recommended**: 1200×1920 pixels

#### 10" Tablet Screenshots (Optional)
- **Recommended**: 1600×2560 pixels

### Feature Graphic (Required)
- **Size**: 1024×500 pixels
- **Format**: PNG or JPG
- **Purpose**: Appears at top of store listing
- **Important**: No text allowed that duplicates title

### App Icon (Required)
- **Size**: 512×512 pixels
- **Format**: 32-bit PNG with alpha
- **Already created**: `public/icon-512.png` ✅

### Promo Video (Optional)
- **Format**: YouTube video URL
- **Duration**: 30 seconds to 2 minutes recommended

### Additional Play Store Assets

#### Short Description
- **Max**: 80 characters
- Critical for search results

#### Full Description
- **Max**: 4,000 characters
- Supports simple HTML formatting

#### Promo Text (Optional)
- **Max**: 80 characters
- Highlighted at top of description

---

## 🎨 Screenshot Best Practices

### Content Strategy
1. **First Screenshot**: Most important feature
2. **Next 2-3**: Core functionality and value props
3. **Remaining**: Additional features and use cases

### Design Tips
✅ Show actual app interface
✅ Use device frames for context
✅ Add captions to explain features
✅ Use consistent styling across all screenshots
✅ Show real kitchen designs from your app
✅ Highlight unique features (3D view, room scanner, etc.)
✅ Include before/after comparisons
✅ Show the design process

❌ Don't use generic stock photos
❌ Avoid cluttered or confusing layouts
❌ Don't show error states or bugs
❌ Avoid excessive text

### Recommended Screenshots for Kitchen Designer Pro

1. **Hero Shot**: Beautiful 3D kitchen render from the app
2. **Design Tools**: The designer interface with cabinets
3. **Material Selection**: Showing material/finish options
4. **Room Scanner**: AR/camera feature in action
5. **Templates**: Pre-made kitchen templates
6. **Measurements**: Precision measurement tools
7. **Export/Share**: Final design with pricing
8. **Success Story**: Beautiful completed kitchen

---

## 📸 How to Capture Screenshots

### Method 1: Device/Simulator (Recommended)

#### iOS
```bash
# Run app on simulator
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select device (iPhone 15 Pro Max, iPad Pro, etc.)
# 2. Run app (⌘R)
# 3. Navigate to screens you want to capture
# 4. Take screenshots (⌘S) or use iOS screenshot (⌘+Shift+S)
# 5. Screenshots saved to Desktop
```

#### Android
```bash
# Run app on emulator
npx cap sync android
npx cap open android

# In Android Studio:
# 1. Select device from AVD Manager
# 2. Run app
# 3. Navigate to desired screens
# 4. Click camera icon in emulator controls
# 5. Screenshots saved to project directory
```

### Method 2: Physical Device

#### iOS
1. Connect iPhone/iPad via USB
2. Open app in Xcode and deploy
3. Take screenshots using device buttons (Power + Volume Up)
4. Transfer via AirDrop or Photos app

#### Android
1. Connect device via USB
2. Enable USB debugging
3. Deploy from Android Studio
4. Take screenshots (Power + Volume Down)
4. Transfer via USB file browser

### Method 3: Browser Screenshot (For Web Preview)
1. Navigate to `/designer` route in preview
2. Use browser dev tools (F12)
3. Toggle device toolbar (iPhone/Android sizes)
4. Take screenshots or use extensions

---

## 🛠️ Screenshot Design Tools

### Recommended Tools

1. **Screenshot.rocks** (https://screenshot.rocks)
   - Add device frames
   - Free and easy to use

2. **Figma** (https://figma.com)
   - Professional design tool
   - Device mockup plugins available

3. **Canva** (https://canva.com)
   - Easy drag-and-drop
   - App screenshot templates

4. **App Launchpad** (https://theapplaunchpad.com)
   - Specialized for app screenshots
   - Device frames and captions

5. **Previewed** (https://previewed.app)
   - Beautiful device mockups
   - Animated previews

---

## 📝 Store Listing Copy Template

### App Name
**Kitchen Designer Pro**

### Subtitle/Short Description (80 chars max)
"Design custom kitchens with 2D/3D tools & real measurements"

### Full Description (4000 chars max)

**Transform Your Kitchen Design Process**

Kitchen Designer Pro is the ultimate tool for designing custom kitchens, bathrooms, and cabinets. Whether you're a homeowner planning a renovation or a professional designer, our powerful yet intuitive app makes it easy to create stunning, functional spaces.

**KEY FEATURES:**

🏠 **Professional Design Tools**
- 2D floor planning with precise measurements
- Real-time 3D visualization of your design
- Extensive cabinet library with real products
- Custom dimensions for any space

📐 **Accurate Measurements**
- Room scanning with AR camera (iOS)
- Manual input with imperial/metric units
- Automatic dimension calculations
- Export measurements for contractors

🎨 **Premium Materials & Finishes**
- Real cabinet materials from leading brands (Egger, Tafisa, Shinnoki)
- Hardware options from Blum and Richelieu
- Countertop materials and finishes
- Door styles and configurations

💡 **Smart Design Features**
- Pre-designed kitchen templates
- Drag-and-drop cabinet placement
- Automatic collision detection
- Undo/redo with complete history

💾 **Save & Share**
- Save unlimited design projects
- Export high-quality renderings
- Share designs via email or social media
- Generate detailed quote documents

📱 **Works Everywhere**
- Native iOS app for iPhone and iPad
- Optimized for all screen sizes
- Offline mode available
- Cloud sync across devices

**WHO IT'S FOR:**
- Homeowners planning kitchen renovations
- Interior designers and architects
- Contractors and cabinet makers
- Real estate professionals staging properties

**WHY CHOOSE KITCHEN DESIGNER PRO:**
Unlike basic room planners, Kitchen Designer Pro uses real cabinet specifications, accurate pricing, and professional-grade 3D rendering. Design with confidence knowing your vision matches reality.

**PRICING & SUPPORT:**
- Free to download and explore
- In-app purchases for premium features
- Email support: [your-email]
- Website: [your-website]

Start designing your dream kitchen today!

### Keywords (100 chars, comma-separated)
kitchen,cabinet,design,3d,planner,renovation,interior,home,remodel,blueprint

### Promo Text (170 chars - iOS only)
Design your dream kitchen in minutes! Professional 2D/3D tools, real materials, accurate measurements. Perfect for homeowners and designers. Try it free today!

---

## ✅ Pre-Submission Checklist

### iOS App Store
- [ ] 3-10 screenshots per required device size
- [ ] 1024×1024 app icon (no transparency)
- [ ] App Store description (max 4000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Support URL
- [ ] Privacy policy URL (if collecting data)
- [ ] App category selection
- [ ] Content rating
- [ ] Copyright information

### Google Play Store
- [ ] 2-8 phone screenshots (1080×1920 recommended)
- [ ] Feature graphic (1024×500)
- [ ] 512×512 app icon
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] App category
- [ ] Content rating questionnaire
- [ ] Privacy policy URL (if collecting data)
- [ ] Developer contact information

---

## 🚀 Next Steps

1. **Capture Screenshots**: Use the methods above to get all required sizes
2. **Design Feature Graphic**: Create the 1024×500 Play Store banner
3. **Write Copy**: Use the templates above as a starting point
4. **Review & Edit**: Test different versions to optimize conversions
5. **Localize** (Optional): Translate for international markets
6. **A/B Test**: After launch, try different screenshots to improve downloads

Good luck with your app store submissions! 🎉
