# Legal Documents Implementation Guide

This guide explains how to use and publish the legal documents required for Kitchen Designer Pro app store submissions.

## Documents Created

✅ **PRIVACY_POLICY.md** - Privacy Policy (required by both stores)  
✅ **TERMS_OF_SERVICE.md** - Terms of Service (required by both stores)  
✅ **EULA.md** - End User License Agreement (required by Apple)

---

## What You Need to Do

### 1. Review and Customize Documents

Before publishing, **update these placeholder values** in all documents:

#### Contact Information
Replace these placeholders:
- `privacy@greencabinets.com` → Your actual privacy email
- `legal@greencabinets.com` → Your actual legal email
- `support@greencabinets.com` → Your actual support email
- `(718) XXX-XXXX` → Your actual phone number
- `Brooklyn, NY 11201` → Your actual address
- `https://greencabinets.com` → Your actual website URL

#### Effective Dates
- Update `Effective Date: January 1, 2025` to your actual launch date
- Keep `Last Updated` current whenever you make changes

#### Business Details
- Verify company name is correct: "Green Cabinets"
- Verify app name is correct: "Kitchen Designer Pro"
- Add your business entity type if needed (LLC, Inc., etc.)

#### Legal Review
⚠️ **IMPORTANT:** Have these documents reviewed by a lawyer before publishing. These are templates and may need customization for your specific situation, jurisdiction, and business practices.

---

## 2. Convert to Web Pages (Recommended)

Both Apple and Google require **publicly accessible URLs** for legal documents.

### Option A: Create HTML Pages (Recommended)

Convert markdown files to HTML and host on your website:

```bash
# If you have a website, create these pages:
https://greencabinets.com/privacy
https://greencabinets.com/terms
https://greencabinets.com/eula
```

**HTML Template Example:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Kitchen Designer Pro</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #1e7b5f; }
        h2 { color: #333; margin-top: 30px; }
        a { color: #1e7b5f; }
    </style>
</head>
<body>
    <!-- Paste converted HTML from PRIVACY_POLICY.md here -->
</body>
</html>
```

### Option B: Use GitHub Pages (Free)

If you don't have a website:

1. Create a GitHub repository (e.g., `kitchen-designer-legal`)
2. Upload HTML versions of the documents
3. Enable GitHub Pages in repository settings
4. Use URLs like: `https://yourusername.github.io/kitchen-designer-legal/privacy.html`

### Option C: Use Static Hosting Services

Free options:
- **Netlify** (netlify.com) - Drag and drop HTML files
- **Vercel** (vercel.com) - Deploy from Git
- **GitHub Pages** (pages.github.com) - Host from repository
- **Cloudflare Pages** (pages.cloudflare.com) - Fast hosting

---

## 3. Add Links to Your App

Once published, add links to legal documents in your app:

### In App Settings
```typescript
// Example: Add to settings page or footer
<a href="https://greencabinets.com/privacy">Privacy Policy</a>
<a href="https://greencabinets.com/terms">Terms of Service</a>
<a href="https://greencabinets.com/eula">EULA</a>
```

### During Onboarding
```typescript
// Example: Signup/login screen
<p>
  By continuing, you agree to our 
  <a href="https://greencabinets.com/terms">Terms of Service</a> and 
  <a href="https://greencabinets.com/privacy">Privacy Policy</a>
</p>
```

---

## 4. Apple App Store Requirements

### App Store Connect Setup

When submitting to Apple App Store, you'll need to provide:

#### 1. Privacy Policy URL
- **Location:** App Store Connect → App Information → Privacy Policy URL
- **Required:** Yes, for all apps
- **Example:** `https://greencabinets.com/privacy`

#### 2. EULA (Optional but Recommended)
- **Location:** App Store Connect → App Information → License Agreement
- **Options:**
  - Use Apple's Standard License Agreement (default)
  - Upload custom EULA (recommended if you have specific terms)
- **If custom:** Upload EULA.md as text file

#### 3. App Privacy Details
You must fill out Apple's App Privacy questionnaire in App Store Connect:

**Data Collection Categories to Declare:**
Based on PRIVACY_POLICY.md, you should declare:
- **Contact Info:** Name, Email, Phone Number
- **User Content:** Photos or Videos (for room photos)
- **Identifiers:** Device ID
- **Usage Data:** Product Interaction, Crash Data
- **Diagnostics:** Performance Data

**For each category, specify:**
- ☑️ Data is collected
- ☐ Data is linked to user identity
- ☐ Data is used for tracking

**Purpose of Collection:**
- App Functionality
- Analytics
- Product Personalization
- Customer Support

#### 4. Support URL
- **Location:** App Store Connect → App Information → Support URL
- **Example:** `https://greencabinets.com/support`

---

## 5. Google Play Store Requirements

### Google Play Console Setup

When submitting to Google Play, you'll need:

#### 1. Privacy Policy URL
- **Location:** Play Console → Store Presence → App Content → Privacy Policy
- **Required:** Yes, for all apps
- **Example:** `https://greencabinets.com/privacy`

#### 2. Data Safety Section
You must complete Google's Data Safety form:

**Data Collected:**
Based on PRIVACY_POLICY.md, declare:
- **Personal Info:** Name, Email Address, Phone Number
- **Photos and Videos:** Photos (for room scanning)
- **App Activity:** App Interactions
- **Device or Other IDs:** Android Advertising ID (if using ads)

**For each data type:**
- ☑️ Is this data collected or shared?
- ☑️ Is this data processed ephemerally?
- ☑️ Is collection required or optional?
- ☑️ Why is this data collected? (Select purposes)

**Data Security:**
- ☑️ Data is encrypted in transit
- ☑️ Users can request data deletion
- ☑️ You follow Google Play's Families Policy (if applicable)

#### 3. Terms of Service (Optional)
- Not required by Google but recommended
- Can link in app description: `https://greencabinets.com/terms`

#### 4. Contact Information
- **Location:** Play Console → Store Presence → Store Listing → Contact Details
- **Email:** Required (e.g., support@greencabinets.com)
- **Website:** Optional but recommended
- **Phone:** Optional

---

## 6. In-App Implementation Checklist

Add legal document links to these locations in Kitchen Designer Pro:

### ✅ Required Locations
- [ ] **Login/Signup Screen** - Link to Terms and Privacy Policy with acceptance checkbox
- [ ] **Settings Screen** - Dedicated section for legal documents
- [ ] **Account Deletion** - Link to Privacy Policy explaining data deletion
- [ ] **Quote Request Form** - Link to Privacy Policy for data collection notice

### ✅ Recommended Locations
- [ ] **App Footer** - Links in footer component (if applicable)
- [ ] **About Screen** - Version info with legal links
- [ ] **First Launch** - Onboarding with legal acceptance
- [ ] **Camera Permission Request** - Explain why (link to Privacy Policy)

### Example Code for Settings
```typescript
// src/pages/Settings.tsx or similar
<Card>
  <CardHeader>
    <CardTitle>Legal & Privacy</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    <a 
      href="https://greencabinets.com/privacy" 
      className="flex items-center justify-between p-3 hover:bg-accent rounded-lg"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>Privacy Policy</span>
      <ExternalLink className="h-4 w-4" />
    </a>
    <a 
      href="https://greencabinets.com/terms" 
      className="flex items-center justify-between p-3 hover:bg-accent rounded-lg"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>Terms of Service</span>
      <ExternalLink className="h-4 w-4" />
    </a>
    <a 
      href="https://greencabinets.com/eula" 
      className="flex items-center justify-between p-3 hover:bg-accent rounded-lg"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>License Agreement</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  </CardContent>
</Card>
```

---

## 7. Ongoing Maintenance

### When to Update Documents

Update legal documents when you:
- Change data collection practices
- Add new features that affect privacy
- Change payment or subscription terms
- Expand to new countries/jurisdictions
- Receive legal advice requiring changes
- Update third-party integrations

### How to Update

1. **Edit the markdown files** in your project
2. **Increment the "Last Updated" date**
3. **Convert to HTML** and republish to your website
4. **Notify users** (if material changes)
   - In-app notification
   - Email to registered users
   - Prominent notice on first launch after update

### Version Control
Keep track of document versions:
```
PRIVACY_POLICY.md - Version 1.0 (Jan 1, 2025)
PRIVACY_POLICY.md - Version 1.1 (Mar 15, 2025) - Added analytics disclosure
PRIVACY_POLICY.md - Version 2.0 (Jun 1, 2025) - GDPR compliance updates
```

---

## 8. Compliance Checklist

Before submitting to app stores:

### General
- [ ] All documents reviewed by lawyer
- [ ] Placeholders (email, phone, address) updated with real information
- [ ] Effective dates set to actual launch date
- [ ] Documents converted to HTML and hosted on public URLs
- [ ] URLs tested and accessible without login

### Apple App Store
- [ ] Privacy Policy URL added to App Store Connect
- [ ] App Privacy questionnaire completed
- [ ] EULA uploaded (if using custom agreement)
- [ ] Support URL provided
- [ ] Data collection matches what's declared in App Privacy
- [ ] In-app links to legal documents implemented

### Google Play Store
- [ ] Privacy Policy URL added to Play Console
- [ ] Data Safety section completed
- [ ] Data collection types declared accurately
- [ ] Contact email provided
- [ ] In-app links to legal documents implemented

### In-App
- [ ] Legal links added to signup/login screens
- [ ] Legal links added to settings/about screens
- [ ] Terms acceptance checkbox on signup (if creating accounts)
- [ ] Privacy Policy linked when requesting permissions
- [ ] Legal documents accessible offline (or cached)

---

## 9. Common Rejection Reasons

Avoid these common app store rejections:

### ❌ Apple Rejections
1. **Privacy Policy URL not accessible** - Ensure URL doesn't require login
2. **App Privacy details don't match actual data collection** - Be accurate and complete
3. **Missing required privacy disclosures** - Disclose all data collection in Privacy Policy
4. **Terms not presented before account creation** - Show terms during signup

### ❌ Google Rejections
1. **Privacy Policy URL returns 404** - Test thoroughly before submission
2. **Data Safety declarations incomplete** - Declare all data types collected
3. **Privacy Policy doesn't match Data Safety form** - Keep them in sync
4. **Missing data deletion process** - Explain how users can delete their data

---

## 10. Quick Reference

### Document URLs Format
```
Privacy Policy:  https://yourdomain.com/privacy
Terms of Service: https://yourdomain.com/terms
EULA:            https://yourdomain.com/eula
Support:         https://yourdomain.com/support
```

### App Store Connect Fields
```
Privacy Policy URL:    [Your privacy URL]
License Agreement:     [Your EULA or use Apple's default]
Support URL:           [Your support page]
Marketing URL:         [Your app website]
```

### Play Console Fields
```
Privacy Policy:        [Your privacy URL]
Store Listing Email:   support@yourdomain.com
Website:              https://yourdomain.com
```

---

## Need Help?

**Legal Review:** Always have a lawyer review these documents before publishing.

**Conversion Tools:**
- Markdown to HTML: https://markdowntohtml.com/
- Markdown editor: https://dillinger.io/

**Hosting Services:**
- GitHub Pages: https://pages.github.com/
- Netlify: https://www.netlify.com/
- Vercel: https://vercel.com/

**App Store Resources:**
- Apple App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policies: https://play.google.com/about/developer-content-policy/

---

**Next Steps:**
1. ✅ Review and customize all three legal documents
2. ✅ Get legal review from attorney
3. ✅ Convert to HTML and publish on your website
4. ✅ Add URLs to App Store Connect and Play Console
5. ✅ Implement in-app links to legal documents
6. ✅ Test all links before submission
