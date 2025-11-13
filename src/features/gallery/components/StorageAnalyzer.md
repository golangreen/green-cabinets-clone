# Gallery Storage Analyzer

Intelligent storage analysis tool that scans existing gallery images and provides compression recommendations to optimize storage usage.

## Features

- **Automatic Analysis**: Scans all images in your gallery storage
- **Smart Recommendations**: Identifies images that would benefit from compression
- **Priority System**: High/Medium/Low priority based on potential savings
- **Storage Statistics**: Overview of total storage usage and potential savings
- **Multiple Views**: Recommendations, oversized files, and largest files tabs
- **Real-time Updates**: Refresh analysis at any time

## Components

### StorageAnalyzer

Main component that displays comprehensive storage analysis.

```typescript
import { StorageAnalyzer } from '@/features/gallery/components';

function MyPage() {
  return <StorageAnalyzer />;
}
```

The component automatically:
1. Fetches all images from gallery storage on mount
2. Analyzes each image for compression potential
3. Generates prioritized recommendations
4. Displays statistics and breakdowns

## Storage Analysis Service

### analyzeGalleryStorage

Performs comprehensive analysis of gallery storage.

```typescript
import { analyzeGalleryStorage } from '@/features/gallery/services';

const analysis = await analyzeGalleryStorage();

console.log('Total images:', analysis.totalImages);
console.log('Total size:', formatFileSize(analysis.totalSize));
console.log('Recommendations:', analysis.recommendations.length);
console.log('Potential savings:', formatFileSize(analysis.potentialTotalSavings));
```

**Returns:**
```typescript
interface StorageAnalysis {
  totalImages: number;
  totalSize: number;
  oversizedImages: StorageImage[];
  recommendations: CompressionRecommendation[];
  potentialTotalSavings: number;
  avgImageSize: number;
  largestImages: StorageImage[];
}
```

### generateRecommendation

Generates compression recommendation for a single image.

```typescript
import { generateRecommendation } from '@/features/gallery/services';

const recommendation = generateRecommendation(image);

if (recommendation) {
  console.log('Suggested quality:', recommendation.suggestedQuality);
  console.log('Potential savings:', recommendation.savingsPercent.toFixed(1) + '%');
  console.log('Priority:', recommendation.priority);
}
```

**Returns:**
```typescript
interface CompressionRecommendation {
  image: StorageImage;
  currentSize: number;
  suggestedQuality: 'high' | 'medium' | 'low';
  estimatedSize: number;
  potentialSavings: number;
  savingsPercent: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}
```

## Recommendation Logic

### Priority Levels

**High Priority:**
- Images exceeding 10MB size limit (must be compressed)
- Images with >50% compression potential

**Medium Priority:**
- Images with 30-50% compression potential
- Good candidates for optimization

**Low Priority:**
- Images with <30% compression potential
- Optional optimization

### Recommendation Threshold

Images are only recommended for compression if they are larger than 5MB. Smaller images are considered already optimized.

### Quality Suggestions

The analyzer suggests compression quality based on file size:

| File Size | Suggested Quality | Reasoning |
|-----------|------------------|-----------|
| > 20MB | Low | Aggressive compression needed |
| 15-20MB | Medium | Balanced approach |
| < 15MB | High | Minimal quality loss |

## Storage Statistics

### Size Categories

Images are categorized by size:
- **Small**: < 2MB
- **Medium**: 2-5MB
- **Large**: 5-10MB
- **Oversized**: > 10MB

### Calculations

```typescript
// Total storage used
const totalSize = images.reduce((sum, img) => sum + img.size, 0);

// Average image size
const avgSize = totalSize / images.length;

// Potential savings
const savings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0);

// Savings percentage
const savingsPercent = (savings / totalSize) * 100;
```

## Usage Examples

### Basic Implementation

```typescript
import { StorageAnalyzer } from '@/features/gallery/components';

function StorageManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Storage Management</h1>
      <StorageAnalyzer />
    </div>
  );
}
```

### Custom Analysis

```typescript
import { 
  fetchGalleryImages, 
  generateRecommendation,
  formatFileSize 
} from '@/features/gallery/services';

async function customAnalysis() {
  // Fetch images
  const images = await fetchGalleryImages();
  
  // Filter by size
  const largeImages = images.filter(img => img.size > 5 * 1024 * 1024);
  
  // Generate recommendations
  const recommendations = largeImages
    .map(generateRecommendation)
    .filter(rec => rec !== null);
  
  // Calculate total savings
  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0);
  
  console.log(`Could save ${formatFileSize(totalSavings)} by compressing ${recommendations.length} images`);
}
```

### Export Recommendations

```typescript
function exportRecommendations(analysis: StorageAnalysis) {
  const data = analysis.recommendations.map(rec => ({
    filename: rec.image.name,
    currentSize: formatFileSize(rec.currentSize),
    estimatedSize: formatFileSize(rec.estimatedSize),
    savings: `${rec.savingsPercent.toFixed(1)}%`,
    quality: rec.suggestedQuality,
    priority: rec.priority,
    reason: rec.reason,
  }));
  
  // Convert to CSV or JSON
  const csv = convertToCSV(data);
  downloadFile(csv, 'storage-analysis.csv');
}
```

## Integration with Compression Tool

The Storage Analyzer integrates seamlessly with the compression tool:

1. **Analyze**: Scan storage for optimization opportunities
2. **Download**: Download images that need compression
3. **Compress**: Use the compression dialog to optimize
4. **Re-upload**: Upload compressed versions
5. **Verify**: Run analysis again to confirm savings

## Supabase Storage Requirements

### Storage Bucket Setup

Ensure the `gallery` storage bucket exists:

```sql
-- Create gallery bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;
```

### RLS Policies

```sql
-- Allow authenticated users to read gallery
CREATE POLICY "Allow authenticated users to read gallery"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'gallery');

-- Allow authenticated users to list gallery
CREATE POLICY "Allow authenticated users to list gallery"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'gallery');
```

## Performance Considerations

- Analysis is performed client-side after fetching metadata
- Large galleries (>1000 images) may take longer to analyze
- Progress indicators keep users informed during long operations
- Results are cached until refresh is triggered

## Accessibility

- Keyboard navigation for all interactive elements
- Screen reader friendly with proper ARIA labels
- Color-blind friendly priority indicators
- Clear visual hierarchy and information structure

## Future Enhancements

Potential future features:
- Bulk compression directly from analyzer
- Scheduled automatic analysis
- Email notifications for storage threshold alerts
- Historical trend analysis
- Cost estimation based on storage pricing

## Troubleshooting

**No images found:**
- Verify gallery bucket exists in Supabase Storage
- Check RLS policies allow reading from bucket
- Ensure images were uploaded to correct bucket

**Incorrect file sizes:**
- Storage API returns sizes in bytes
- Use `formatFileSize()` utility for display
- Check metadata is being populated correctly

**Slow analysis:**
- Limit analysis to most recent images
- Implement pagination for large galleries
- Use Web Workers for processing (future enhancement)

## Related Features

- [Compression Tool](./CompressionDialog.md) - Compress oversized files
- [Validation](./ValidationErrorDisplay.md) - Validate uploads
- [Image Processing](../services/imageProcessingService.ts) - Core image operations
