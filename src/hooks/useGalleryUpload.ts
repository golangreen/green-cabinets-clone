import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GalleryCategory } from '@/types/gallery';

interface ImageMetadata {
  file: File;
  preview: string;
  width: number;
  height: number;
  category: GalleryCategory;
  displayName: string;
  altText: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const useGalleryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);

  const extractImageMetadata = (file: File): Promise<{ width: number; height: number }> => {
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
  };

  const uploadImage = async (metadata: ImageMetadata): Promise<boolean> => {
    const fileName = `${Date.now()}-${metadata.file.name}`;
    const storagePath = `${metadata.category}/${fileName}`;

    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(storagePath, metadata.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save metadata to database
      const supabaseAny = supabase as any;
      const { error: dbError } = await supabaseAny
        .from('gallery_image_metadata')
        .insert({
          storage_path: storagePath,
          original_filename: metadata.file.name,
          display_name: metadata.displayName,
          category: metadata.category,
          alt_text: metadata.altText,
          width: metadata.width,
          height: metadata.height,
          file_size: metadata.file.size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const uploadImages = async (images: ImageMetadata[]) => {
    setUploading(true);
    setProgress(images.map(img => ({
      fileName: img.file.name,
      progress: 0,
      status: 'pending' as const
    })));

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      setProgress(prev => prev.map((p, idx) => 
        idx === i ? { ...p, status: 'uploading' as const, progress: 50 } : p
      ));

      try {
        await uploadImage(image);
        successCount++;
        
        setProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'success' as const, progress: 100 } : p
        ));
      } catch (error) {
        failCount++;
        
        setProgress(prev => prev.map((p, idx) => 
          idx === i ? { 
            ...p, 
            status: 'error' as const, 
            progress: 0,
            error: error instanceof Error ? error.message : 'Upload failed'
          } : p
        ));
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} image(s)`);
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} image(s)`);
    }

    return { successCount, failCount };
  };

  return {
    uploading,
    progress,
    extractImageMetadata,
    uploadImages
  };
};
