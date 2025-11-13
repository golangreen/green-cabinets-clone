# Migration Scripts

## Gallery Image Migration

This script migrates all images from `src/assets/gallery/` to Lovable Cloud Storage.

### Prerequisites

1. Ensure you have the `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file
2. Install tsx if not already installed: `npm install -g tsx`

### Usage

```bash
npx tsx scripts/migrate-gallery-images.ts
```

### What it does

1. Reads all image files from `src/assets/gallery/`
2. Uploads each image to the `gallery-images` storage bucket
3. Creates metadata records in the `gallery_image_metadata` table
4. Generates a `gallery-url-mapping.json` file with old paths → new CDN URLs

### Output

- **Console**: Progress of each upload with ✓ or ✗ indicators
- **File**: `scripts/gallery-url-mapping.json` containing the complete mapping

### Example mapping output

```json
[
  {
    "originalPath": "src/assets/gallery/modern-kitchen.jpg",
    "cdnUrl": "https://mczagaaiyzbhjvtrojia.supabase.co/storage/v1/object/public/gallery-images/migrated/modern-kitchen.jpg",
    "filename": "modern-kitchen.jpg",
    "size": 524288,
    "uploaded": true
  }
]
```

### After migration

Use the automated replacement script to update your code:

```bash
npx tsx scripts/replace-image-imports.ts
```

This will automatically replace all local imports with CDN URLs:

**Before:**
```typescript
import modernKitchen from "@/assets/gallery/modern-kitchen.jpg";
```

**After:**
```typescript
const modernKitchen = "https://mczagaaiyzbhjvtrojia.supabase.co/storage/v1/object/public/gallery-images/migrated/modern-kitchen.jpg";
```

## Image Import Replacement

### What it does

1. Reads the `gallery-url-mapping.json` file
2. Scans all TypeScript/JavaScript files in `src/components`, `src/pages`, and `src/features`
3. Finds import statements like `import x from "@/assets/gallery/image.jpg"`
4. Replaces them with const declarations using CDN URLs
5. Preserves the variable name so your code continues to work

### Usage

```bash
npx tsx scripts/replace-image-imports.ts
```

### Output

- Console shows each replacement as it happens
- Summary statistics at the end
- List of all modified files

**Important**: Review changes and test your application after running the script!

### Troubleshooting

- **"SUPABASE_SERVICE_ROLE_KEY not found"**: Add the service role key to your `.env` file
- **Upload fails**: Check storage bucket permissions and RLS policies
- **Metadata insert fails**: Verify the `gallery_image_metadata` table exists
- **"Mapping file not found"**: Run `migrate-gallery-images.ts` first
- **No replacements**: Check that you have imports matching the pattern `@/assets/gallery/`
