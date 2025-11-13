# Automatic Compression Tool

Intelligent image compression system that detects oversized files and offers compression before upload.

## Features

- **Automatic Detection**: Instantly identifies files exceeding 10MB limit
- **Size Estimation**: Shows estimated file sizes for each compression level
- **Visual Feedback**: Clear UI showing current size, target size, and compression options
- **Batch Processing**: Handles multiple oversized files simultaneously
- **Progress Tracking**: Real-time compression progress indicator
- **Smart Recommendations**: Highlights optimal compression levels

## Components

### CompressionDialog

Modal dialog that appears when oversized files are detected, offering compression options.

**Props:**
```typescript
interface CompressionDialogProps {
  open: boolean;                    // Dialog visibility
  onOpenChange: (open: boolean) => void;  // Toggle visibility
  oversizedFiles: OversizedFile[];  // Files exceeding limit
  onCompress: (quality: CompressionQuality) => Promise<void>;  // Compress action
  onSkip: () => void;              // Skip oversized files
}
```

## Hooks

### useAutoCompression

Manages the automatic compression workflow.

```typescript
const {
  oversizedFiles,           // Files that exceed the limit
  isCompressing,           // Compression in progress
  compressionProgress,     // { current: number, total: number }
  checkForOversizedFiles,  // Check and analyze files
  compressOversizedFiles,  // Compress with selected quality
  clearOversizedFiles,     // Clear oversized files
  hasOversizedFiles,       // Quick check for oversized
} = useAutoCompression();
```

## Integration Example

```typescript
import { useState } from 'react';
import { CompressionDialog } from '@/features/gallery/components';
import { useAutoCompression } from '@/features/gallery/hooks';

function MyUploadComponent() {
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);
  const {
    oversizedFiles,
    checkForOversizedFiles,
    compressOversizedFiles,
    clearOversizedFiles,
  } = useAutoCompression();

  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check for oversized files
    const result = await checkForOversizedFiles(fileArray);
    
    if (result.needsCompression) {
      // Show compression dialog
      setShowCompressionDialog(true);
    } else {
      // All files are acceptable, proceed directly
      processFiles(result.acceptable);
    }
  };

  const handleCompress = async (quality: CompressionQuality) => {
    try {
      // Compress oversized files
      const compressed = await compressOversizedFiles(quality);
      
      // Process compressed files
      processFiles(compressed);
      
      setShowCompressionDialog(false);
    } catch (error) {
      console.error('Compression failed:', error);
    }
  };

  const handleSkip = () => {
    clearOversizedFiles();
    setShowCompressionDialog(false);
    // Continue with only acceptable files
  };

  return (
    <>
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
      />

      <CompressionDialog
        open={showCompressionDialog}
        onOpenChange={setShowCompressionDialog}
        oversizedFiles={oversizedFiles}
        onCompress={handleCompress}
        onSkip={handleSkip}
      />
    </>
  );
}
```

## Compression Service

Utility functions for compression operations.

### Detection Functions

```typescript
import {
  isOversized,              // Check if single file is oversized
  detectOversizedFiles,     // Filter oversized from array
  separateFilesBySize,      // Split into oversized/acceptable
} from '@/features/gallery/services';

// Example
const files = Array.from(fileList);
const { oversized, acceptable } = separateFilesBySize(files);
```

### Size Estimation

```typescript
import {
  estimateCompressedSize,      // Estimate size for one quality level
  estimateAllCompressionSizes, // Estimate for all quality levels
} from '@/features/gallery/services';

// Example
const estimates = estimateAllCompressionSizes(file.size);
console.log(`High: ${estimates.high}, Medium: ${estimates.medium}`);
```

### Compression Operations

```typescript
import {
  compressFiles,              // Compress multiple files
  compressFilesWithResults,   // Compress with detailed results
} from '@/features/gallery/services';

// Example with progress tracking
const { compressed, results } = await compressFilesWithResults(
  files,
  'medium',
  (current, total) => {
    console.log(`Compressing: ${current}/${total}`);
  }
);

// Check compression results
results.forEach(result => {
  console.log(`${result.original.name}: ${result.reduction.toFixed(1)}% reduction`);
});
```

### Smart Recommendations

```typescript
import {
  suggestCompressionQuality,    // Get optimal quality level
  getCompressionRecommendation, // Get human-readable advice
} from '@/features/gallery/services';

// Example
const quality = suggestCompressionQuality(file.size);
const advice = getCompressionRecommendation(file.size);
console.log(`Recommended: ${quality} - ${advice}`);
```

## Compression Levels

### Quality Settings

| Quality | Compression Ratio | Use Case | File Size |
|---------|------------------|----------|-----------|
| **High** | ~70% of original | Minimal quality loss, important images | Larger |
| **Medium** | ~50% of original | Balanced approach (Recommended) | Medium |
| **Low** | ~30% of original | Maximum compression, less critical images | Smallest |
| **None** | 100% (no change) | No compression applied | Original |

### Estimation Accuracy

Size estimations are approximate and based on typical JPEG compression ratios:
- Actual results vary based on image content and complexity
- Photos with fine details compress less efficiently
- Simple graphics/screenshots compress more efficiently
- Use estimations as guidelines, not guarantees

## User Experience Flow

1. **Upload**: User selects files for upload
2. **Detection**: System automatically checks file sizes
3. **Alert**: If oversized files detected, dialog appears
4. **Options**: User sees current size, estimated compressed sizes, and quality options
5. **Selection**: User chooses compression level or skips oversized files
6. **Processing**: Files compress with progress indicator
7. **Completion**: Compressed files ready for upload, oversized files removed if skipped

## Configuration

Compression settings are centralized in `src/features/gallery/config/constants.ts`:

```typescript
// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Compression quality mapping
export const COMPRESSION_QUALITY_MAP = {
  none: 1.0,
  high: 0.9,
  medium: 0.7,
  low: 0.5,
};
```

## Best Practices

1. **Always check for oversized files** before validation to avoid validation errors
2. **Show compression estimates** so users can make informed decisions
3. **Allow skipping** oversized files instead of forcing compression
4. **Provide progress feedback** during compression operations
5. **Log compression results** to help users understand size reductions
6. **Handle errors gracefully** - keep original file if compression fails

## Accessibility

- Clear visual indicators (icons, badges) for file status
- Progress announcements for screen readers
- Keyboard navigation support in dialog
- Descriptive labels and ARIA attributes
- Color-blind friendly status indicators

## Examples

See `src/features/gallery/examples/CompressionExample.tsx` for a complete working demonstration.
