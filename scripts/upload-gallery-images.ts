/**
 * Upload Gallery Images to Supabase Storage
 * 
 * This script uploads all images from src/assets/gallery/ to Supabase Storage
 * and creates metadata records in the database.
 * 
 * Usage: npx tsx scripts/upload-gallery-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = 'gallery-images';
const GALLERY_PATH = 'src/assets/gallery';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Category mapping based on filename patterns
const getCategoryFromFilename = (filename: string): string => {
  const lower = filename.toLowerCase();
  if (lower.includes('design-render') || lower.includes('design-reality')) {
    return 'design-to-reality';
  }
  if (lower.includes('bathroom') || lower.includes('vanity')) {
    return 'vanities';
  }
  if (lower.includes('closet')) {
    return 'closets';
  }
  return 'kitchens'; // Default
};

const getDisplayName = (filename: string): string => {
  const base = basename(filename, extname(filename));
  return base
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getImageDimensions = (buffer: Buffer): { width: number; height: number } => {
  // JPEG
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
  
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  
  // WebP
  if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    // WebP is complex, return default
    return { width: 1920, height: 1080 };
  }
  
  return { width: 1920, height: 1080 };
};

async function uploadImage(filename: string): Promise<boolean> {
  try {
    const filePath = join(GALLERY_PATH, filename);
    const fileBuffer = await readFile(filePath);
    
    const ext = extname(filename).toLowerCase();
    const baseName = basename(filename, ext);
    const storagePath = `gallery/${baseName}${ext}`;
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeTypes[ext] || 'image/jpeg',
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) {
      console.error(`✗ Failed to upload ${filename}:`, uploadError.message);
      return false;
    }

    const dimensions = getImageDimensions(fileBuffer);
    const category = getCategoryFromFilename(filename);
    const displayName = getDisplayName(filename);

    // Create metadata
    const { error: metadataError } = await supabase
      .from('gallery_image_metadata')
      .upsert({
        storage_path: storagePath,
        original_filename: filename,
        display_name: displayName,
        category,
        alt_text: `${displayName} - ${category}`,
        width: dimensions.width,
        height: dimensions.height,
        file_size: fileBuffer.length,
      }, {
        onConflict: 'storage_path',
      });

    if (metadataError) {
      console.error(`✗ Failed to create metadata for ${filename}:`, metadataError.message);
      return false;
    }

    console.log(`✓ Uploaded: ${filename} → ${category}`);
    return true;
  } catch (error) {
    console.error(`✗ Error processing ${filename}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting gallery image upload...\n');

  try {
    const files = await readdir(GALLERY_PATH);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageFiles = files.filter(file => 
      imageExtensions.includes(extname(file).toLowerCase())
    );

    console.log(`Found ${imageFiles.length} images to upload\n`);

    let successCount = 0;
    let failCount = 0;

    for (const filename of imageFiles) {
      const success = await uploadImage(filename);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log('\n📊 Upload Summary:');
    console.log(`   Total: ${imageFiles.length}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${failCount}`);

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

main();
