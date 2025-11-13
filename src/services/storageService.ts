import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface GalleryImage {
  id: string;
  storage_path: string;
  original_filename: string;
  display_name?: string;
  category?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadImageParams {
  file: File;
  displayName?: string;
  category?: string;
  altText?: string;
}

const BUCKET_NAME = 'gallery-images';

export const storageService = {
  /**
   * Get public URL for an image
   */
  getImageUrl(storagePath: string): string {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  },

  /**
   * Upload image to storage and create metadata
   */
  async uploadImage(params: UploadImageParams): Promise<GalleryImage> {
    const { file, displayName, category, altText } = params;
    
    try {
      // Generate unique storage path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `uploads/${fileName}`;

      logger.info('Uploading image to storage', {
        fileName,
        fileSize: file.size,
        fileType: file.type
      });

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '31536000', // 1 year
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get image dimensions
      const dimensions = await getImageDimensions(file);

      // Create metadata record
      const { data: metadata, error: metadataError } = await supabase
        .from('gallery_image_metadata')
        .insert({
          storage_path: storagePath,
          original_filename: file.name,
          display_name: displayName || file.name,
          category: category || 'uncategorized',
          alt_text: altText,
          width: dimensions.width,
          height: dimensions.height,
          file_size: file.size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (metadataError) throw metadataError;

      logger.info('Image uploaded successfully', { id: metadata.id });
      return metadata as GalleryImage;

    } catch (error) {
      logger.error('Failed to upload image', { error });
      throw error;
    }
  },

  /**
   * List all images with metadata
   */
  async listImages(category?: string): Promise<GalleryImage[]> {
    try {
      let query = supabase
        .from('gallery_image_metadata')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as GalleryImage[];
    } catch (error) {
      logger.error('Failed to list images', { error });
      throw error;
    }
  },

  /**
   * Delete image from storage and metadata
   */
  async deleteImage(id: string): Promise<void> {
    try {
      // Get metadata to find storage path
      const { data: metadata, error: fetchError } = await supabase
        .from('gallery_image_metadata')
        .select('storage_path')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([metadata.storage_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: metadataError } = await supabase
        .from('gallery_image_metadata')
        .delete()
        .eq('id', id);

      if (metadataError) throw metadataError;

      logger.info('Image deleted successfully', { id });
    } catch (error) {
      logger.error('Failed to delete image', { error, id });
      throw error;
    }
  },

  /**
   * Update image metadata
   */
  async updateImageMetadata(
    id: string,
    updates: Partial<Pick<GalleryImage, 'display_name' | 'category' | 'alt_text'>>
  ): Promise<GalleryImage> {
    try {
      const { data, error } = await supabase
        .from('gallery_image_metadata')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info('Image metadata updated', { id });
      return data as GalleryImage;
    } catch (error) {
      logger.error('Failed to update image metadata', { error, id });
      throw error;
    }
  },

  /**
   * Get unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_image_metadata')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const categories = [...new Set(data.map(item => item.category))];
      return categories.filter(Boolean) as string[];
    } catch (error) {
      logger.error('Failed to get categories', { error });
      throw error;
    }
  }
};

/**
 * Get image dimensions from File object
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
