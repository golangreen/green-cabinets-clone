# Visual Regression Testing Guide

This guide covers visual regression testing using Playwright's screenshot comparison feature to detect unintended UI changes.

## Overview

Visual regression testing compares screenshots of your application across test runs to detect visual changes. This helps catch:
- Unintended CSS changes
- Layout shifts
- Component styling issues
- Cross-browser rendering differences
- Responsive design problems

## Running Visual Tests

### Run all visual regression tests
```bash
npm run test:e2e e2e/gallery-visual-regression.spec.ts
```

### Run specific browser
```bash
npm run test:e2e e2e/gallery-visual-regression.spec.ts -- --project=chromium
```

### Update baseline screenshots
When you make intentional UI changes, update the baselines:
```bash
npm run test:e2e e2e/gallery-visual-regression.spec.ts -- --update-snapshots
```

### Run in headed mode to see changes
```bash
npm run test:e2e e2e/gallery-visual-regression.spec.ts -- --headed
```

## Screenshot Storage

Baseline screenshots are stored in:
```
e2e/gallery-visual-regression.spec.ts-snapshots/
├── chromium/
│   ├── gallery-initial-state.png
│   ├── upload-zone-normal.png
│   └── ...
├── firefox/
│   └── ...
└── webkit/
    └── ...
```

Failed comparison screenshots are stored in:
```
test-results/
└── gallery-visual-regression-test-name-chromium/
    ├── actual.png      # Current screenshot
    ├── expected.png    # Baseline screenshot
    └── diff.png        # Visual diff highlighting changes
```

## Configuration

Visual regression settings in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,        // Max pixels that can differ
    maxDiffPixelRatio: 0.01,   // Max 1% of pixels can differ
    threshold: 0.2,             // Pixel comparison sensitivity (0-1)
    animations: 'disabled',     // Disable animations
    scale: 'css',               // Use CSS scaling
  },
}
```

## Test Coverage

### Current Tests

1. **Initial State Tests**
   - Empty gallery appearance
   - Upload zone states (normal, hover)
   - Dark mode appearance

2. **Component Tests**
   - Image preview cards (normal, hover, selected)
   - Image grid layouts (different counts)
   - Selection controls
   - Upload controls
   - Batch edit modal
   - Compression dialog

3. **Responsive Tests**
   - Mobile layout (375x667)
   - Tablet layout (768x1024)
   - Desktop layout (default)

4. **State Tests**
   - Loading states
   - Error states
   - Empty states
   - Success states

5. **Cross-Browser Tests**
   - Chromium
   - Firefox
   - WebKit

## Writing Visual Regression Tests

### Basic Screenshot Test

```typescript
test('component appearance', async ({ page }) => {
  await page.goto('/gallery');
  
  // Wait for content to load
  await page.waitForSelector('[data-testid="component"]');
  
  // Take screenshot and compare
  await expect(page).toHaveScreenshot('component-name.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
```

### Element-Specific Screenshot

```typescript
test('button states', async ({ page }) => {
  const button = page.locator('[data-testid="upload-button"]');
  
  // Normal state
  await expect(button).toHaveScreenshot('button-normal.png');
  
  // Hover state
  await button.hover();
  await expect(button).toHaveScreenshot('button-hover.png');
});
```

### Responsive Screenshots

```typescript
test('mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/gallery');
  
  await expect(page).toHaveScreenshot('mobile-layout.png', {
    fullPage: true,
  });
});
```

### Cross-Browser Consistency

```typescript
test('cross-browser appearance', async ({ page, browserName }) => {
  await page.goto('/gallery');
  
  await expect(page).toHaveScreenshot(`layout-${browserName}.png`, {
    fullPage: true,
  });
});
```

## Best Practices

### 1. Wait for Content to Load

```typescript
// Wait for images
await page.evaluate(() => Promise.all(
  Array.from(document.images)
    .filter(img => !img.complete)
    .map(img => new Promise(resolve => {
      img.addEventListener('load', resolve);
      img.addEventListener('error', resolve);
    }))
));

// Wait for fonts
await page.evaluate(() => document.fonts.ready);
```

### 2. Disable Animations

```typescript
// In playwright.config.ts
toHaveScreenshot: {
  animations: 'disabled',
}

// Or programmatically
await page.addStyleTag({
  content: `
    * {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
  `,
});
```

### 3. Handle Dynamic Content

```typescript
// Hide timestamps or dynamic data
await page.locator('[data-testid="timestamp"]').evaluate(
  el => el.style.visibility = 'hidden'
);

// Or use masks in screenshot
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('[data-testid="timestamp"]')],
});
```

### 4. Set Consistent Viewport

```typescript
// In playwright.config.ts
use: {
  viewport: { width: 1280, height: 720 },
}

// Or per test
await page.setViewportSize({ width: 1280, height: 720 });
```

### 5. Use Tolerance for Minor Differences

```typescript
await expect(page).toHaveScreenshot('page.png', {
  maxDiffPixelRatio: 0.01, // Allow 1% difference
  threshold: 0.2,           // Pixel sensitivity
});
```

## Troubleshooting

### Flaky Visual Tests

**Problem**: Tests pass sometimes but fail other times

**Solutions**:
1. Disable animations: `animations: 'disabled'`
2. Wait for all content: fonts, images, network requests
3. Use `waitForLoadState('networkidle')`
4. Add small tolerance: `maxDiffPixelRatio: 0.01`

### Font Rendering Differences

**Problem**: Different font rendering across systems

**Solutions**:
1. Use web fonts with font-display: block
2. Increase threshold slightly
3. Run tests in Docker for consistency

### Different Screenshot Sizes

**Problem**: Screenshots have different dimensions

**Solutions**:
1. Set explicit viewport size
2. Use `fullPage: true` for consistency
3. Wait for layout shifts to complete

### Color Differences

**Problem**: Slight color variations across runs

**Solutions**:
1. Increase `threshold` value (0.2-0.3)
2. Check for system-level color adjustments
3. Ensure consistent color scheme (light/dark)

## Helper Functions

The `e2e/helpers/visual-regression.ts` file provides utilities:

```typescript
import {
  compareScreenshot,
  waitForImages,
  disableAnimations,
  compareColorSchemes,
  maskDynamicContent,
} from './helpers/visual-regression';

// Take screenshot with defaults
await compareScreenshot(page, 'component.png');

// Wait for images before screenshot
await waitForImages(page);

// Compare light and dark modes
await compareColorSchemes(page, 'gallery');

// Hide dynamic content
await maskDynamicContent(page, ['[data-testid="timestamp"]']);
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run visual tests
  run: npm run test:e2e e2e/gallery-visual-regression.spec.ts

- name: Upload diff artifacts
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: visual-diffs
    path: test-results/**/*-diff.png
```

### Review Visual Changes

1. Check CI artifacts for diff images
2. Review actual vs expected screenshots
3. If changes are intentional:
   ```bash
   npm run test:e2e -- --update-snapshots
   git add e2e/**/*-snapshots/
   git commit -m "Update visual baselines"
   ```

## Maintenance

### Update Baselines After UI Changes

When making intentional UI changes:

```bash
# Run tests to see failures
npm run test:e2e e2e/gallery-visual-regression.spec.ts

# Update baselines
npm run test:e2e e2e/gallery-visual-regression.spec.ts -- --update-snapshots

# Commit new baselines
git add e2e/**/*-snapshots/
git commit -m "Update visual baselines for [feature]"
```

### Regular Baseline Reviews

Schedule periodic reviews of baselines:
1. Check for unnecessary screenshots
2. Remove outdated baselines
3. Update for new features
4. Verify cross-browser consistency

## Performance Tips

### Parallel Execution

```typescript
// playwright.config.ts
fullyParallel: true,
workers: process.env.CI ? 1 : undefined,
```

### Selective Testing

```bash
# Test only changed components
npm run test:e2e e2e/gallery-visual-regression.spec.ts -- --grep "upload zone"
```

### Screenshot Optimization

```typescript
// Use CSS scale for smaller files
toHaveScreenshot: {
  scale: 'css',
}

// Only capture visible area
await expect(page).toHaveScreenshot('page.png', {
  fullPage: false,
});
```

## Resources

- [Playwright Screenshots Documentation](https://playwright.dev/docs/screenshots)
- [Visual Comparisons Guide](https://playwright.dev/docs/test-snapshots)
- [CI/CD Integration](https://playwright.dev/docs/ci)
