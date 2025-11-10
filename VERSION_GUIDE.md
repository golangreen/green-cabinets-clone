# App Versioning Guide

App versioning configured for **Kitchen Designer Pro** iOS and Android releases.

## Current Version Configuration

### Capacitor Config (capacitor.config.ts)
- **iOS Build Number**: `1`
- **Android Version Code**: `1`
- **Android Version Name**: `1.0.0`

### Package.json (Update Locally)
When you pull this project locally, update `package.json`:
```json
{
  "name": "kitchen-designer-pro",
  "version": "1.0.0"
}
```

---

## Version Number Explained

### Semantic Versioning (Major.Minor.Patch)
- **1.0.0** - First public release
- **1.0.1** - Bug fixes only
- **1.1.0** - New features (backwards compatible)
- **2.0.0** - Breaking changes or major updates

### Platform-Specific Numbers

**iOS Build Number** (`buildNumber` in capacitor.config.ts)
- Increments with every App Store submission
- Can be any integer: 1, 2, 3... or 100, 101, 102...
- Must always increase for each submission
- Apple uses this internally (users don't see it)

**Android Version Code** (`versionCode` in capacitor.config.ts)
- Integer that must increase with each Play Store release
- Users never see this number
- Example: 1, 2, 3, 4...

**Android Version Name** (`versionName` in capacitor.config.ts)
- User-facing version string
- Typically matches semantic version: "1.0.0", "1.2.0", "2.0.0"

---

## How to Update for Each Release

### For Bug Fix Release (1.0.0 → 1.0.1)

1. **In capacitor.config.ts:**
```typescript
ios: {
  buildNumber: '2'  // Increment
},
android: {
  versionCode: 2,         // Increment
  versionName: '1.0.1'    // Update
}
```

2. **In package.json (locally):**
```json
"version": "1.0.1"
```

3. **Sync to native platforms:**
```bash
npx cap sync
```

### For Feature Release (1.0.0 → 1.1.0)

1. **In capacitor.config.ts:**
```typescript
ios: {
  buildNumber: '3'  // Increment
},
android: {
  versionCode: 3,         // Increment
  versionName: '1.1.0'    // Update
}
```

2. **In package.json (locally):**
```json
"version": "1.1.0"
```

3. **Sync to native platforms:**
```bash
npx cap sync
```

### For Major Release (1.0.0 → 2.0.0)

1. **In capacitor.config.ts:**
```typescript
ios: {
  buildNumber: '1'  // Can reset to 1 for major versions, or continue incrementing
},
android: {
  versionCode: 4,         // Must always increment (never reset)
  versionName: '2.0.0'    // Update
}
```

2. **In package.json (locally):**
```json
"version": "2.0.0"
```

3. **Sync to native platforms:**
```bash
npx cap sync
```

---

## Common Versioning Scenarios

### Beta/Testing Releases
- Use beta suffix: `1.0.0-beta.1`, `1.0.0-beta.2`
- Still increment version codes/build numbers
```typescript
android: {
  versionCode: 5,
  versionName: '1.0.0-beta.1'
}
```

### Hotfix After Production
If v1.0.0 is live and you need urgent fix:
```typescript
// Version 1.0.1 (hotfix)
ios: {
  buildNumber: '2'
},
android: {
  versionCode: 2,
  versionName: '1.0.1'
}
```

### Multiple Releases Same Day
Each submission needs unique numbers:
- Morning release: buildNumber: '5', versionCode: 5
- Afternoon hotfix: buildNumber: '6', versionCode: 6

---

## Version Checklist Before Release

- [ ] Update `capacitor.config.ts` with new version numbers
- [ ] Update `package.json` version (when working locally)
- [ ] Run `npx cap sync` to apply version changes to native projects
- [ ] Test on physical devices (not just emulators)
- [ ] Update app store changelogs with new features/fixes
- [ ] Git commit with version tag: `git tag v1.0.0`

---

## Automation Tips

### Using npm version command (locally)
```bash
# Patch release (1.0.0 → 1.0.1)
npm version patch

# Minor release (1.0.0 → 1.1.0)
npm version minor

# Major release (1.0.0 → 2.0.0)
npm version major
```
This updates package.json and creates a git tag automatically.

**Important:** After running npm version, manually update capacitor.config.ts to match!

### Build Script Example
Create a release script in package.json:
```json
"scripts": {
  "release:patch": "npm version patch && npx cap sync",
  "release:minor": "npm version minor && npx cap sync",
  "release:major": "npm version major && npx cap sync"
}
```

---

## Store Submission Requirements

### Apple App Store
- Build number must be unique
- Version number should follow semantic versioning
- First submission can be any version (typically 1.0.0)

### Google Play Store
- Version code must always increase
- Version code must be an integer
- Version name is shown to users (can be any string)
- Cannot reuse version codes (even for unpublished builds)

---

## Troubleshooting

**Error: "Version code must be greater than previous versions"**
- You forgot to increment versionCode in capacitor.config.ts
- Solution: Increment versionCode, run `npx cap sync`, rebuild

**Error: "CFBundleVersion must be unique"**
- You forgot to increment iOS buildNumber
- Solution: Increment buildNumber, run `npx cap sync`, rebuild in Xcode

**Rejected: "App uses same version as previous submission"**
- Common on both stores
- Solution: Always increment version numbers, even for minor fixes

---

## Quick Reference

| Release Type | Example | iOS Build | Android Code | Android Name |
|-------------|---------|-----------|--------------|--------------|
| Initial | 1.0.0 | 1 | 1 | 1.0.0 |
| Bug Fix | 1.0.1 | 2 | 2 | 1.0.1 |
| Feature | 1.1.0 | 3 | 3 | 1.1.0 |
| Major | 2.0.0 | 4 | 4 | 2.0.0 |
| Beta | 1.0.0-beta.1 | 5 | 5 | 1.0.0-beta.1 |

**Remember:** 
- iOS build numbers and Android version codes ALWAYS go up
- Never reuse a version number that's been submitted to stores
- Run `npx cap sync` after every version change
