import { createClient } from '@supabase/supabase-js';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Vanity-specific images to migrate
const VANITY_IMAGES = [
  'src/assets/walnut-wood-texture.jpg',
  'src/assets/finishes/egger-casella-oak.jpg',
  'src/assets/finishes/egger-walnut.jpg',
  'src/assets/finishes/egger-white-oak.jpg',
  'src/assets/finishes/tafisa-cream-puff.jpg',
  'src/assets/finishes/tafisa-milky-way-grey.jpg',
  'src/assets/finishes/tafisa-white.jpg',
];

interface ImageMapping {
  localPath: string;
  storagePath: string;
  cdnUrl: string;
  originalFilename: string;
  category: string;
}

async function uploadImage(localPath: string): Promise<ImageMapping> {
  const filename = basename(localPath);
  const category = localPath.includes('/finishes/') ? 'finishes' : 'textures';
  const storagePath = `vanity/${category}/${filename}`;

  console.log(`Uploading ${filename}...`);

  // Read the file
  const fileBuffer = await readFile(localPath);
  const contentType = filename.endsWith('.jpg') || filename.endsWith('.jpeg') 
    ? 'image/jpeg' 
    : 'image/png';

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('gallery-images')
    .upload(storagePath, fileBuffer, {
      contentType,
      cacheControl: '31536000', // 1 year
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload ${filename}: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('gallery-images')
    .getPublicUrl(storagePath);

  console.log(`✓ Uploaded ${filename} → ${publicUrl}`);

  return {
    localPath,
    storagePath,
    cdnUrl: publicUrl,
    originalFilename: filename,
    category,
  };
}

async function migrateVanityImages() {
  console.log('🚀 Starting vanity designer image migration...\n');

  const mappings: ImageMapping[] = [];

  for (const imagePath of VANITY_IMAGES) {
    try {
      const mapping = await uploadImage(imagePath);
      mappings.push(mapping);
    } catch (error) {
      console.error(`❌ Error uploading ${imagePath}:`, error);
    }
  }

  // Generate mapping file
  const mappingFile = {
    migrationDate: new Date().toISOString(),
    totalImages: mappings.length,
    mappings: mappings.reduce((acc, m) => {
      acc[m.localPath] = m.cdnUrl;
      return acc;
    }, {} as Record<string, string>),
  };

  await writeFile(
    'vanity-image-mappings.json',
    JSON.stringify(mappingFile, null, 2)
  );

  console.log(`\n✅ Migration complete!`);
  console.log(`   Total images migrated: ${mappings.length}`);
  console.log(`   Mapping file: vanity-image-mappings.json`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Update vanity designer code to use CDN URLs`);
  console.log(`   2. Test the application`);
  console.log(`   3. Delete local vanity images after confirmation`);
}

migrateVanityImages().catch(console.error);
