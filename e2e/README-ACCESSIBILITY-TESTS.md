# E2E Accessibility Testing Guide

This directory contains comprehensive End-to-End (E2E) accessibility tests using Playwright and Axe-core to verify WCAG 2.1 Level A & AA compliance.

## Test Files

### 1. `accessibility-axe.spec.ts`
**General accessibility test suite** covering all pages with:
- Full WCAG 2.1 Level A & AA scans
- Critical issues detection
- Keyboard navigation tests
- Color contrast validation
- ARIA attribute checks
- Form elements accessibility
- Heading hierarchy verification
- Landmark regions validation

### 2. `accessibility-wcag-fixes.spec.ts` (NEW)
**Verification tests for specific WCAG fixes** made on 2025-11-18:
- ✅ Skip navigation link functionality
- ✅ ARIA labels on navigation elements
- ✅ Form accessibility improvements
- ✅ Keyboard operability
- ✅ Semantic HTML & landmarks
- ✅ Mobile touch target sizes
- ✅ Comprehensive WCAG 2.1 AA compliance

## Running Tests

### Run All Accessibility Tests
```bash
# Run all E2E accessibility tests
npx playwright test accessibility

# Run with UI mode (recommended for debugging)
npx playwright test accessibility --ui

# Run in headed mode to see browser
npx playwright test accessibility --headed
```

### Run Specific Test Suites
```bash
# Run only WCAG fixes verification
npx playwright test e2e/accessibility-wcag-fixes.spec.ts

# Run only general Axe tests
npx playwright test e2e/accessibility-axe.spec.ts

# Run a specific test by name
npx playwright test -g "skip link"
```

### Run on Specific Browsers
```bash
# Run on Chrome only
npx playwright test accessibility --project=chromium

# Run on Firefox only
npx playwright test accessibility --project=firefox

# Run on mobile devices
npx playwright test accessibility --project="Mobile Chrome"
```

### Generate Reports
```bash
# Run tests and generate HTML report
npx playwright test accessibility --reporter=html

# View HTML report
npx playwright show-report

# Generate JSON report
npx playwright test accessibility --reporter=json
```

## Test Coverage

### Pages Tested
- ✅ Home page (`/`)
- ✅ Auth page (`/auth`)
- ✅ Vanity Designer (`/vanity-designer`)
- ✅ Admin Gallery (`/admin/gallery`)

### WCAG 2.1 Criteria Tested

#### Level A (Minimum)
- ✅ **1.1.1** Non-text Content - Alt text for images
- ✅ **2.1.1** Keyboard - All functionality keyboard accessible
- ✅ **2.4.1** Bypass Blocks - Skip navigation link
- ✅ **2.4.4** Link Purpose - Descriptive link text
- ✅ **3.1.1** Language of Page - HTML lang attribute
- ✅ **4.1.2** Name, Role, Value - ARIA labels

#### Level AA (Enhanced)
- ✅ **1.4.3** Contrast (Minimum) - 4.5:1 text, 3:1 UI
- ✅ **2.4.6** Headings and Labels - Descriptive labels
- ✅ **2.4.7** Focus Visible - Visible focus indicators
- ✅ **3.2.4** Consistent Identification - Consistent patterns

### Test Categories

1. **Skip Navigation**
   - Skip link presence and visibility
   - Keyboard focus behavior
   - Navigation to main content
   - First focusable element order

2. **ARIA Labels**
   - Header logo (`aria-label="Green Cabinets - Home"`)
   - Menu button (`aria-label="Open navigation menu"`)
   - Gallery buttons (kitchen, vanity, closet, design-to-reality)
   - Section links (suppliers, solutions, about, contact)
   - Form toggle button (dynamic label)

3. **Keyboard Navigation**
   - Tab order and focus management
   - Enter/Space key activation
   - Escape key for closing dialogs
   - Arrow keys for navigation (where applicable)
   - Focus visibility on all elements

4. **Semantic HTML**
   - Main landmark (`<main id="main-content">`)
   - Heading hierarchy (single h1, proper nesting)
   - Image alt text (all images)
   - Form labels (explicit associations)

5. **Mobile Accessibility**
   - Touch target size (minimum 44x44px)
   - Mobile menu operability
   - Viewport scaling support

## Understanding Test Results

### Success Output
```
✓ accessibility-wcag-fixes.spec.ts:15:5 › Skip Navigation Link › should have skip link that is focusable
✓ accessibility-wcag-fixes.spec.ts:31:5 › Skip Navigation Link › skip link should navigate to main content
```

### Failure Output with Details
```
✗ home page should not have accessibility violations

WCAG Violations Found:

[serious] button-name
Description: Ensures buttons have discernible text
Help: https://dequeuniversity.com/rules/axe/4.8/button-name
Affected nodes: 2
  Node 1: <button class="menu-toggle">...</button>
    Failure: Element does not have inner text that is visible to screen readers
```

### Violation Severity Levels
- 🔴 **critical** - Must fix immediately (blocks core functionality)
- 🟠 **serious** - Should fix promptly (significant barrier)
- 🟡 **moderate** - Should address (noticeable issue)
- ⚪ **minor** - Fix when possible (enhancement)

## Generated Reports

Test execution generates detailed reports in:

### Axe Reports
- **Location**: `accessibility-reports/axe/`
- **Format**: JSON + HTML
- **Files**: 
  - `home.json` / `home.html`
  - `admin-gallery.json` / `admin-gallery.html`
  - `vanity-designer.json` / `vanity-designer.html`

### Playwright Reports
- **Location**: `test-results/`
- **Format**: HTML + JSON
- **View**: `npx playwright show-report`

## CI/CD Integration

Tests automatically run on:
- ✅ Pull requests to `main` or `develop`
- ✅ Push to main branch
- ✅ Manual workflow dispatch

### GitHub Actions Workflow
Results posted as PR comments with:
- Summary of violations by severity
- Detailed violation descriptions
- Links to remediation guides
- Downloadable artifacts

## Debugging Failed Tests

### 1. Run in UI Mode
```bash
npx playwright test accessibility --ui
```
Benefits:
- Visual test execution
- Step-by-step debugging
- DOM inspection
- Time travel debugging

### 2. Run in Debug Mode
```bash
npx playwright test accessibility --debug
```
Opens Playwright Inspector for:
- Breakpoints
- Console logs
- Network activity
- Screenshots

### 3. Check Screenshots/Videos
Failed tests automatically capture:
- Screenshots: `test-results/*/test-failed-1.png`
- Videos: `test-results/videos/*.webm`
- Traces: `test-results/*/trace.zip`

### 4. View Trace Files
```bash
npx playwright show-trace test-results/*/trace.zip
```

## Best Practices

### Writing New Accessibility Tests
1. **Test user journeys**, not just static pages
2. **Use real assistive technology patterns** (keyboard, screen readers)
3. **Include positive and negative test cases**
4. **Test across browsers** (Chromium, Firefox, WebKit)
5. **Test mobile viewports** for touch accessibility

### Maintaining Tests
1. Update tests when UI changes
2. Add tests for new features
3. Keep axe-core updated (`npm update @axe-core/playwright`)
4. Review and fix violations promptly
5. Document exceptions with comments

## Common Issues & Solutions

### Issue: Skip link not visible
**Solution**: Check CSS for `sr-only` and `focus:not-sr-only` classes

### Issue: ARIA label not found
**Solution**: Verify exact attribute spelling and value

### Issue: Timeout errors
**Solution**: Increase timeout or add explicit waits
```typescript
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000); // For heavy pages
```

### Issue: False positives
**Solution**: Use axe-core's `exclude` option
```typescript
new AxeBuilder({ page })
  .exclude('#known-decorative-element')
  .analyze()
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)
- [Lovable Security Docs](https://docs.lovable.dev/features/security)

## Support

For accessibility questions or issues:
1. Review `ACCESSIBILITY_FIXES.md` for recent changes
2. Check `ACCESSIBILITY.md` for general guidance
3. Contact the development team
4. File an issue with test results

---

**Last Updated**: 2025-11-18
**Test Framework**: Playwright + Axe-core
**WCAG Version**: 2.1 Level AA
