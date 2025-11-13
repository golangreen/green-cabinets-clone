/**
 * Gallery Image Migration Script
 * 
 * This script automatically uploads all images from src/assets/gallery/
 * to Supabase Cloud Storage and generates a URL mapping file.
 * 
 * Usage: npx tsx scripts/migrate-gallery-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = 'gallery-images';
const GALLERY_PATH = 'src/assets/gallery';

// Create Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ImageMapping {
  originalPath: string;
  cdnUrl: string;
  filename: string;
  size: number;
  uploaded: boolean;
  error?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Get image dimensions from buffer
 */
function getImageDimensions(buffer: Buffer): ImageDimensions {
  // Simple JPEG dimension extraction
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xFF) break;
      
      const marker = buffer[offset + 1];
      offset += 2;
      
      if (marker === 0xC0 || marker === 0xC2) {
        const height = buffer.readUInt16BE(offset + 3);
        const width = buffer.readUInt16BE(offset + 5);
        return { width, height };
      }
      
      const segmentLength = buffer.readUInt16BE(offset);
      offset += segmentLength;
    }
  }
  
  // Simple PNG dimension extraction
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  
  // Default fallback
  return { width: 1920, height: 1080 };
}

/**
 * Upload a single image to Cloud Storage
 */
async function uploadImage(
  filePath: string,
  filename: string
): Promise<ImageMapping> {
  const mapping: ImageMapping = {
    originalPath: filePath,
    cdnUrl: '',
    filename,
    size: 0,
    uploaded: false,
  };

  try {
    // Read file
    const fileBuffer = await readFile(filePath);
    mapping.size = fileBuffer.length;

    // Generate storage path
    const ext = extname(filename);
    const baseName = basename(filename, ext);
    const storagePath = `migrated/${baseName}${ext}`;

    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext.toLowerCase()] || 'image/jpeg';

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType,
        cacheControl: '31536000', // 1 year
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    mapping.cdnUrl = urlData.publicUrl;

    // Get image dimensions
    const dimensions = getImageDimensions(fileBuffer);

    // Create metadata record
    const { error: metadataError } = await supabase
      .from('gallery_image_metadata')
      .insert({
        storage_path: storagePath,
        original_filename: filename,
        display_name: baseName.replace(/-/g, ' '),
        category: 'migrated',
        alt_text: `Gallery image: ${baseName.replace(/-/g, ' ')}`,
        width: dimensions.width,
        height: dimensions.height,
        file_size: mapping.size,
      });

    if (metadataError) throw metadataError;

    mapping.uploaded = true;
    console.log(`✓ Uploaded: ${filename} → ${mapping.cdnUrl}`);
  } catch (error) {
    mapping.error = error instanceof Error ? error.message : String(error);
    console.error(`✗ Failed: ${filename} - ${mapping.error}`);
  }

  return mapping;
}

/**
 * Main migration function
 */
async function migrateGalleryImages() {
  console.log('🚀 Starting gallery image migration...\n');

  try {
    // Check if gallery directory exists
    const files = await readdir(GALLERY_PATH);
    
    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const imageFiles = files.filter((file) =>
      imageExtensions.includes(extname(file).toLowerCase())
    );

    console.log(`Found ${imageFiles.length} images to migrate\n`);

    if (imageFiles.length === 0) {
      console.log('No images found to migrate.');
      return;
    }

    // Upload all images
    const mappings: ImageMapping[] = [];
    for (const filename of imageFiles) {
      const filePath = join(GALLERY_PATH, filename);
      const mapping = await uploadImage(filePath, filename);
      mappings.push(mapping);
    }

    // Generate summary
    const successful = mappings.filter((m) => m.uploaded).length;
    const failed = mappings.filter((m) => !m.uploaded).length;

    console.log('\n📊 Migration Summary:');
    console.log(`   Total: ${mappings.length}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);

    // Save mapping file
    const mappingFile = 'scripts/gallery-url-mapping.json';
    await writeFile(
      mappingFile,
      JSON.stringify(mappings, null, 2),
      'utf-8'
    );
    console.log(`\n💾 URL mapping saved to: ${mappingFile}`);

    // Generate replacement instructions
    console.log('\n📝 To update your code, replace:');
    console.log('   import imageName from "@/assets/gallery/image.jpg"');
    console.log('   with:');
    console.log('   const imageName = "CDN_URL_FROM_MAPPING"');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateGalleryImages().catch(console.error);
