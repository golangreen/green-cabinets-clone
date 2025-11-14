# E2E Testing with Playwright

Comprehensive end-to-end tests for the gallery feature using Playwright.

## Test Suites

### Gallery Upload (`gallery-upload.spec.ts`)
Tests basic file upload functionality:
- Single and multiple file uploads
- Image preview generation
- File metadata display
- Image removal
- Complete upload workflow

### Drag and Drop (`gallery-drag-drop.spec.ts`)
Tests drag-and-drop file upload:
- Drop zone highlighting
- Accepting dropped files
- Multiple file drops
- Visual feedback during processing
- Drop zone state management

### Compression Workflow (`gallery-compression.spec.ts`)
Tests automatic compression detection and workflows:
- Compression dialog for large files
- Quality selection (low, medium, high)
- Size estimation display
- Compression progress
- Skip compression option
- Multiple file compression

### Batch Operations (`gallery-batch-operations.spec.ts`)
Tests multi-image selection and batch editing:
- Single and multiple image selection
- Select all / Clear selection
- Batch edit modal
- Metadata editing
- Selection persistence
- Visual indicators

## Running Tests

### Run All E2E Tests
```bash
npx playwright test
```

### Run Specific Test Suite
```bash
npx playwright test e2e/gallery-upload.spec.ts
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Tests on Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug Tests
```bash
npx playwright test --debug
```

### Generate Test Report
```bash
npx playwright show-report
```

## Test Configuration

### Browsers Tested
- Desktop Chrome
- Desktop Firefox
- Desktop Safari (WebKit)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Screenshots
- Taken automatically on failure
- Located in `test-results/` directory

### Videos
- Recorded on first retry in CI
- Located in `test-results/` directory

### Traces
- Captured on first retry
- View with `npx playwright show-trace trace.zip`

## Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { navigateToGallery, uploadFiles } from './helpers/gallery';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToGallery(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Using Test Helpers
```typescript
import {
  createTestImage,
  uploadFiles,
  waitForImageProcessing,
  selectImages,
  openBatchEditModal,
} from './helpers/gallery';

// Create test image
const image = createTestImage('test.jpg', 1920, 1080, 500);

// Upload files
await uploadFiles(page, [
  { name: 'test.jpg', mimeType: 'image/jpeg', buffer: image },
]);

// Wait for processing
await waitForImageProcessing(page, 1);

// Select images
await selectImages(page, [0, 1, 2]);
```

## Test Data Attributes

Tests use data-testid attributes for reliable element selection:

- `data-testid="drop-zone"` - File drop zone
- `data-testid="image-preview"` - Image preview cards
- `data-testid="compression-dialog"` - Compression dialog
- `data-testid="processing-indicator"` - Loading indicator
- `data-testid="upload-success"` - Success indicator

## Best Practices

### ✅ DO
- Use data-testid for reliable selectors
- Wait for elements to be visible before interacting
- Use helper functions for common operations
- Test user flows, not implementation details
- Add meaningful test descriptions
- Take screenshots on important steps
- Test on multiple browsers

### ❌ DON'T
- Rely on CSS classes for selectors
- Use hardcoded timeouts (use waitFor instead)
- Test internal state directly
- Create brittle tests that break on UI changes
- Skip error scenarios
- Ignore mobile testing

## Visual Testing

### Taking Screenshots
```typescript
await page.screenshot({
  path: 'screenshots/gallery-upload.png',
  fullPage: true,
});
```

### Visual Comparisons
```typescript
await expect(page).toHaveScreenshot('gallery-view.png');
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Failing Locally
1. Ensure dev server is running: `npm run dev`
2. Check browser is installed: `npx playwright install chromium`
3. Clear test results: `rm -rf test-results/`
4. Run with UI mode to debug: `npx playwright test --ui`

### Timeout Errors
- Increase timeout in test: `test.setTimeout(60000);`
- Check network requests in trace viewer
- Verify elements exist with correct selectors

### Flaky Tests
- Add proper wait conditions
- Use `waitForLoadState('networkidle')`
- Avoid hardcoded timeouts
- Check for race conditions

### Element Not Found
- Verify data-testid is present in code
- Check if element is inside an iframe
- Ensure element is visible and not hidden
- Use `page.pause()` to inspect page state

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen) - `npx playwright codegen`
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [VS Code Extension](https://playwright.dev/docs/getting-started-vscode)

## Test Coverage

Current E2E test coverage for gallery features:

| Feature | Coverage | Tests |
|---------|----------|-------|
| File Upload | ✅ Complete | 10 tests |
| Drag & Drop | ✅ Complete | 9 tests |
| Compression | ✅ Complete | 10 tests |
| Batch Ops | ✅ Complete | 17 tests |
| **Total** | **46 tests** | **All passing** |

## Adding New Test Suites

1. Create new spec file: `e2e/feature-name.spec.ts`
2. Import test helpers from `./helpers/gallery`
3. Follow existing patterns for consistency
4. Add documentation to this README
5. Update test coverage table

## Next Steps

- [ ] Add visual regression tests
- [ ] Test authentication flows
- [ ] Add API mocking for offline testing
- [ ] Test error recovery scenarios
- [ ] Add performance monitoring
