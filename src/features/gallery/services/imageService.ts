/**
 * Image Service
 * Handles all backend operations for image management
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type {
  GalleryCategory,
  AIGeneratedMetadata,
  ImageMetadata,
} from '../types';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_BUCKET = 'gallery-images';

// ============================================================================
// Types
// ============================================================================

interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

interface MetadataRecord {
  id: string;
  storage_path: string;
  original_filename: string;
  display_name: string | null;
  alt_text: string | null;
  description: string | null;
  category: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  uploaded_by: string | null;
}

// ============================================================================
// Upload Operations
// ============================================================================

/**
 * Upload an image file to Supabase storage
 */
export async function uploadImageToStorage(
  file: File,
  category: GalleryCategory
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${category}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      logger.error('Storage upload error', uploadError, { service: 'ImageService' });
      return {
        success: false,
        error: uploadError.message,
      };
    }

    return {
      success: true,
      path: filePath,
    };
  } catch (error) {
    logger.error('Upload error', error, { service: 'ImageService' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Save image metadata to the database
 */
export async function saveImageMetadata(
  metadata: ImageMetadata,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('gallery_image_metadata' as any).insert({
      storage_path: storagePath,
      original_filename: metadata.file.name,
      display_name: metadata.displayName,
      alt_text: metadata.altText,
      description: metadata.description,
      category: metadata.category,
      width: metadata.width,
      height: metadata.height,
      file_size: metadata.file.size,
      uploaded_by: user?.id || null,
    });

    if (error) {
      logger.error('Metadata save error', error, { service: 'ImageService' });
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Save metadata error', error, { service: 'ImageService' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload image with metadata (combined operation)
 */
export async function uploadImageWithMetadata(
  metadata: ImageMetadata
): Promise<{ success: boolean; error?: string }> {
  // Upload to storage
  const uploadResult = await uploadImageToStorage(
    metadata.file,
    metadata.category
  );

  if (!uploadResult.success || !uploadResult.path) {
    return {
      success: false,
      error: uploadResult.error || 'Upload failed',
    };
  }

  // Save metadata
  const metadataResult = await saveImageMetadata(metadata, uploadResult.path);

  if (!metadataResult.success) {
    // Attempt to clean up uploaded file
    await deleteImageFromStorage(uploadResult.path);
    return metadataResult;
  }

  return { success: true };
}

// ============================================================================
// AI Metadata Generation
// ============================================================================

/**
 * Generate AI metadata for an image
 */
export async function generateAIMetadata(
  imageBase64: string,
  category: GalleryCategory
): Promise<{ success: boolean; metadata?: AIGeneratedMetadata; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'generate-image-metadata',
      {
        body: {
          imageBase64,
          category,
        },
      }
    );

    if (error) {
      logger.error('AI generation error', error, { service: 'ImageService' });
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data || !data.metadata) {
      return {
        success: false,
        error: 'No metadata returned from AI',
      };
    }

    return {
      success: true,
      metadata: data.metadata,
    };
  } catch (error) {
    logger.error('AI metadata generation error', error, { service: 'ImageService' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown AI error',
    };
  }
}

// ============================================================================
// Delete Operations
// ============================================================================

/**
 * Delete an image from storage
 */
export async function deleteImageFromStorage(
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      logger.error('Storage delete error', error, { service: 'ImageService' });
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Delete error', error, { service: 'ImageService' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error',
    };
  }
}

/**
 * Delete image metadata from database
 */
export async function deleteImageMetadata(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_image_metadata' as any)
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Metadata delete error', error, { service: 'ImageService' });
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Delete metadata error', error, { service: 'ImageService' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Fetch all gallery images with metadata
 */
export async function fetchGalleryImages(
  category?: GalleryCategory
): Promise<{ success: boolean; data?: MetadataRecord[]; error?: string }> {
  try {
    let query = supabase
      .from('gallery_image_metadata' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Fetch images error', error, { service: 'ImageService' });
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: (data || []) as unknown as MetadataRecord[],
    };
  } catch (error) {
    logger.error('Fetch error', error, { service: 'ImageService' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown fetch error',
    };
  }
}

/**
 * Get public URL for an image
 */
export function getImagePublicUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ============================================================================
// Update Operations
// ============================================================================

/**
 * Update image metadata
 */
export async function updateImageMetadata(
  id: string,
  updates: {
    display_name?: string;
    alt_text?: string;
    description?: string;
    category?: GalleryCategory;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_image_metadata' as any)
      .update(updates)
      .eq('id', id);

    if (error) {
      logger.error('Metadata update error', error, { service: 'ImageService' });
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Update error', error, { service: 'ImageService' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown update error',
    };
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Batch update multiple images
 */
export async function batchUpdateImages(
  imageIds: string[],
  updates: {
    category?: GalleryCategory;
    alt_text?: string;
    description?: string;
    display_name?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_image_metadata' as any)
      .update(updates)
      .in('id', imageIds);

    if (error) {
      logger.error('Batch update error', error, { service: 'ImageService' });
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Batch update error', error, { service: 'ImageService' });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch delete multiple images
 */
export async function batchDeleteImages(
  images: Array<{ id: string; storage_path: string }>
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Delete from storage
  const storagePaths = images.map((img) => img.storage_path);
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove(storagePaths);

  if (storageError) {
    errors.push(`Storage: ${storageError.message}`);
  }

  // Delete from database
  const imageIds = images.map((img) => img.id);
  const { error: dbError } = await supabase
    .from('gallery_image_metadata' as any)
    .delete()
    .in('id', imageIds);

  if (dbError) {
    errors.push(`Database: ${dbError.message}`);
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
