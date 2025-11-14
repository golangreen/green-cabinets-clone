# Accessibility Testing Guide

This project includes comprehensive accessibility testing to ensure WCAG 2.1 Level AA compliance.

## Overview

Three automated testing tools work together to catch accessibility issues:

1. **Axe-core** - Fast, accurate automated testing via Playwright
2. **Pa11y** - Additional checks with different engine
3. **Lighthouse** - Performance and accessibility audits

## Running Accessibility Tests

### Run All Accessibility Tests
```bash
npm run test:a11y
```

### Run Axe Tests Only
```bash
npx playwright test e2e/accessibility-axe.spec.ts
```

### Run Pa11y Tests
```bash
npm run test:pa11y
```

### Run Lighthouse Audit
```bash
npm run build
npx serve -s dist -l 8080
npm run lighthouse
```

## Test Coverage

### Pages Tested
- Home page (`/`)
- Admin Gallery (`/admin/gallery`)
- Vanity Designer (`/vanity-designer`)

### Checks Performed

#### WCAG 2.1 Level A & AA
- ✅ Color contrast (4.5:1 for text, 3:1 for UI)
- ✅ Keyboard navigation and focus
- ✅ Screen reader compatibility
- ✅ Alternative text for images
- ✅ Form labels and instructions
- ✅ Heading hierarchy
- ✅ ARIA attributes and roles
- ✅ Landmark regions
- ✅ Link and button names
- ✅ Focus indicators

#### Specific Tests

**Axe-core Tests:**
- Full page scans for all WCAG rules
- Critical issues (must fix before merge)
- Keyboard navigation checks
- Color contrast validation
- ARIA attribute validation
- Form accessibility
- Interactive element testing
- Heading hierarchy
- Landmark regions

**Pa11y Tests:**
- Additional automated checks
- Screenshots for visual verification
- Cross-validation with different engine

**Lighthouse Tests:**
- Accessibility score (target: 90+)
- Best practices
- SEO checks

## CI/CD Integration

Accessibility tests run automatically on every PR:

### GitHub Actions Workflow
- Runs on PR to `main` or `develop`
- Tests all pages across tools
- Posts detailed results as PR comments
- Uploads artifacts for review
- **Fails PR if critical issues found**

### PR Comment Format

```markdown
## ✅ Accessibility Test Results - Passed

### 📊 Summary
| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 Serious | 0 |
| 🟡 Moderate | 2 |
| ⚪ Minor | 1 |

### 🔍 Issues Found
- 2 moderate issues (see details below)
- 1 minor issue

### 📚 How to Fix
1. Download artifacts from workflow run
2. Review detailed JSON reports
3. Fix identified issues
4. Run tests locally to verify
```

## Interpreting Results

### Issue Severity Levels

**🔴 Critical**
- Blocks basic functionality
- Must be fixed before merge
- Examples: Missing form labels, no keyboard access

**🟠 Serious**
- Significant barrier for users
- Should be fixed promptly
- Examples: Poor color contrast, missing alt text

**🟡 Moderate**
- Noticeable issue but has workarounds
- Should be addressed
- Examples: Improper heading order, minor ARIA issues

**⚪ Minor**
- Small enhancement opportunities
- Fix when possible
- Examples: Missing lang attribute, best practice violations

## Common Issues and Fixes

### 1. Missing Alt Text

**Issue:**
```tsx
<img src="image.jpg" />
```

**Fix:**
```tsx
<img src="image.jpg" alt="Descriptive text" />
```

### 2. Poor Color Contrast

**Issue:**
```css
.text { color: #999; background: #fff; } /* Contrast: 2.8:1 */
```

**Fix:**
```css
.text { color: #666; background: #fff; } /* Contrast: 5.7:1 */
```

### 3. Missing Form Labels

**Issue:**
```tsx
<input type="text" placeholder="Name" />
```

**Fix:**
```tsx
<Label htmlFor="name">Name</Label>
<Input id="name" type="text" />
```

### 4. Improper Heading Hierarchy

**Issue:**
```tsx
<h1>Page Title</h1>
<h3>Section</h3> {/* Skipped h2 */}
```

**Fix:**
```tsx
<h1>Page Title</h1>
<h2>Section</h2>
```

### 5. Missing Button Labels

**Issue:**
```tsx
<Button><Icon /></Button>
```

**Fix:**
```tsx
<Button aria-label="Close dialog">
  <Icon />
</Button>
```

### 6. Non-Keyboard Accessible Elements

**Issue:**
```tsx
<div onClick={handleClick}>Click me</div>
```

**Fix:**
```tsx
<Button onClick={handleClick}>Click me</Button>
```

### 7. Missing Focus Indicators

**Issue:**
```css
button:focus { outline: none; }
```

**Fix:**
```css
button:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

### 8. Missing ARIA Landmarks

**Issue:**
```tsx
<div>
  <div>Navigation</div>
  <div>Main content</div>
</div>
```

**Fix:**
```tsx
<>
  <nav>Navigation</nav>
  <main>Main content</main>
</>
```

## Testing Manually

### Keyboard Navigation
1. Tab through all interactive elements
2. Verify visible focus indicators
3. Test Enter/Space on buttons
4. Test Escape to close modals
5. Verify skip links work

### Screen Reader Testing

**NVDA (Windows - Free)**
```bash
# Download from https://www.nvaccess.org/
# Test page navigation, forms, and interactive elements
```

**JAWS (Windows - Commercial)**
```bash
# Popular commercial screen reader
# Test if NVDA works, JAWS should too
```

**VoiceOver (macOS - Built-in)**
```bash
# Enable: System Preferences > Accessibility > VoiceOver
# Test with Cmd+F5
```

### Browser DevTools

**Chrome DevTools**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Run audit

**Firefox Accessibility Inspector**
1. Open DevTools
2. Go to Accessibility tab
3. Enable accessibility features
4. Inspect element accessibility

**Safari Web Inspector**
1. Enable Develop menu
2. Inspect element
3. Check accessibility properties

## Best Practices

### Design
- Maintain 4.5:1 contrast for text
- 3:1 contrast for UI components
- Use semantic HTML elements
- Provide sufficient touch/click targets (44x44px minimum)

### Development
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Include proper ARIA attributes when needed
- Ensure keyboard accessibility
- Test with actual assistive technologies
- Don't rely on color alone to convey information

### Testing
- Run tests locally before committing
- Fix critical issues immediately
- Address serious issues in same PR
- Plan for moderate/minor issues
- Test with keyboard only
- Test with screen reader

## Resources

### WCAG Guidelines
- [WCAG 2.1 Overview](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.1 Level AA Checklist](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)

### Testing Tools
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [Pa11y](https://pa11y.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### ARIA Resources
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) - Free Windows screen reader
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Commercial Windows screen reader
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built-in macOS/iOS

### Learning
- [WebAIM](https://webaim.org/) - Web accessibility in mind
- [A11y Project](https://www.a11yproject.com/) - Community-driven accessibility checklist
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Troubleshooting

### Tests Failing Locally

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Run specific test
npx playwright test e2e/accessibility-axe.spec.ts --headed

# Debug mode
npx playwright test --debug
```

### Different Results in CI

- Ensure same Node version
- Check viewport sizes match
- Wait for content to load fully
- Disable animations for consistent results

### False Positives

If you believe a violation is a false positive:
1. Verify with manual testing
2. Test with actual screen reader
3. Document why it's not an issue
4. Consider excluding specific rules if justified

## Contributing

When adding new features:
1. Run accessibility tests locally
2. Fix any violations before committing
3. Test with keyboard navigation
4. Add test coverage for new pages/components
5. Update this guide if needed

## Support

For accessibility questions:
1. Check this documentation
2. Review WCAG guidelines
3. Test with assistive technologies
4. Open an issue with "a11y:" prefix
