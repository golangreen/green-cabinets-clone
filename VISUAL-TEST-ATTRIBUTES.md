# Visual Regression Test Attributes

This document lists the `data-testid` attributes needed for visual regression tests.

## Required Test Identifiers

### Gallery Components

#### GalleryFileSelector / GalleryUploadZone
```tsx
<div data-testid="drop-zone">
  {/* Upload zone content */}
</div>
```

#### ImagePreviewList
```tsx
<Card data-testid="image-preview-list">
  {/* Preview list content */}
</Card>

<div data-testid="selection-controls">
  {/* Selection control buttons */}
</div>
```

#### ImagePreviewCard
```tsx
<Card data-testid="image-preview">
  {/* Image preview content */}
</Card>
```

#### UploadControls
```tsx
<div data-testid="upload-controls">
  <div data-testid="quality-slider">
    {/* Quality slider */}
  </div>
  {/* Upload button and other controls */}
</div>
```

#### CompressionDialog
```tsx
<Dialog data-testid="compression-dialog">
  {/* Compression dialog content */}
</Dialog>
```

#### Loading Indicators
```tsx
<div data-testid="loading">
  {/* Loading spinner or progress */}
</div>

<div data-testid="processing-indicator">
  {/* Processing indicator */}
</div>
```

#### Success/Error States
```tsx
<div data-testid="upload-success">
  {/* Success message */}
</div>

<div role="alert">
  {/* Error toast - uses standard role */}
</div>
```

## Implementation Checklist

- [ ] Add `data-testid="drop-zone"` to GalleryUploadZone
- [ ] Add `data-testid="image-preview-list"` to ImagePreviewList Card
- [ ] Add `data-testid="selection-controls"` to selection button group
- [ ] Add `data-testid="image-preview"` to ImagePreviewCard
- [ ] Add `data-testid="upload-controls"` to UploadControls container
- [ ] Add `data-testid="quality-slider"` to quality slider component
- [ ] Add `data-testid="compression-dialog"` to CompressionDialog
- [ ] Add `data-testid="loading"` to loading indicators
- [ ] Add `data-testid="processing-indicator"` to processing indicators
- [ ] Add `data-testid="upload-success"` to success messages

## Usage in Tests

```typescript
// Wait for component
await page.waitForSelector('[data-testid="drop-zone"]');

// Take screenshot
const dropZone = page.locator('[data-testid="drop-zone"]');
await expect(dropZone).toHaveScreenshot('dropzone.png');

// Multiple elements
const previews = page.locator('[data-testid="image-preview"]');
await expect(previews).toHaveCount(3);
```

## Best Practices

1. **Use semantic selectors** when possible (role, label, text)
2. **Add data-testid** for complex or dynamic components
3. **Keep test IDs stable** - don't change them frequently
4. **Use descriptive names** - clear what component they identify
5. **Avoid IDs in production** - use only for testing

## Conditional Test IDs

Only add test IDs in test/development environments:

```tsx
const testId = process.env.NODE_ENV === 'test' ? { 'data-testid': 'component-id' } : {};

<div {...testId}>
  {/* Component content */}
</div>
```

Or use a helper:

```tsx
function getTestId(id: string) {
  return process.env.NODE_ENV === 'test' ? { 'data-testid': id } : {};
}
```
