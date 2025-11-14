# Gallery Components - Test Identifiers

This document tracks the test identifiers (`data-testid`) added to gallery components for E2E and visual regression testing.

## Implemented Test IDs

### ✅ GalleryUploadZone
- `data-testid="drop-zone"` - Main drop zone area for file uploads

### ✅ ImagePreviewList
- `data-testid="image-preview-list"` - Container card for image previews
- `data-testid="selection-controls"` - Selection control buttons (Select All, Batch Edit, etc.)

### ✅ ImagePreviewCard
- `data-testid="image-preview"` - Individual image preview card
- `data-testid="loading"` - Loading overlay when uploading
- `data-testid="upload-success"` - Success overlay after upload

### ✅ UploadControls
- `data-testid="upload-controls"` - Container for upload controls and settings

### ✅ CompressionSettings
- `data-testid="quality-slider"` - Quality slider/selector component

### ✅ CompressionDialog
- `data-testid="compression-dialog"` - Compression dialog for oversized files

### ✅ BulkCompressionDialog
- `data-testid="bulk-compression-dialog"` - Bulk compression dialog for storage analyzer

## Usage in Tests

```typescript
import { expect } from '@playwright/test';

// Wait for and interact with components
await page.waitForSelector('[data-testid="drop-zone"]');
const dropZone = page.locator('[data-testid="drop-zone"]');
await expect(dropZone).toBeVisible();

// Take screenshots for visual regression
await expect(dropZone).toHaveScreenshot('dropzone.png');

// Verify image previews
const previews = page.locator('[data-testid="image-preview"]');
await expect(previews).toHaveCount(3);
```

## Standard Selectors

Some components use standard accessibility attributes instead of custom test IDs:

- **Dialogs**: `[role="dialog"]`
- **Error Toasts**: `[role="alert"]`
- **Buttons**: `page.getByRole('button', { name: /button text/i })`
- **Form Inputs**: `page.getByLabel('Label Text')`

## Best Practices

1. **Prefer semantic selectors** when available (role, label, text content)
2. **Use data-testid** for complex components without clear semantic meaning
3. **Keep IDs stable** - avoid changing test IDs frequently
4. **Use descriptive names** - make it clear what the component is
5. **Document new IDs** - update this file when adding new test identifiers

## Component Status

| Component | Test IDs Added | Notes |
|-----------|---------------|-------|
| GalleryUploadZone | ✅ | Drop zone |
| ImagePreviewList | ✅ | List container and controls |
| ImagePreviewCard | ✅ | Card, loading, success states |
| UploadControls | ✅ | Container |
| CompressionSettings | ✅ | Quality selector |
| CompressionDialog | ✅ | Dialog container |
| BulkCompressionDialog | ✅ | Dialog container |
| GalleryFileSelector | N/A | Wrapper component |
| GalleryImageProcessor | N/A | Wrapper component |
| QualityWarnings | N/A | Uses standard elements |
| StorageAnalyzer | Future | TBD if needed |
| EditImageModal | Future | TBD if needed |
| MetadataEditModal | Future | TBD if needed |

## Related Documentation

- `VISUAL-TEST-ATTRIBUTES.md` - Complete test identifier reference
- `e2e/README.md` - E2E testing guide
- `VISUAL-REGRESSION.md` - Visual regression testing guide
