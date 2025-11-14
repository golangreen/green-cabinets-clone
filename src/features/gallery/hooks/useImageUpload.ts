/**
 * useImageUpload Hook
 * Manages image upload process using gallery services
 */

import { useState, useCallback } from 'react';
import { uploadImageWithMetadata } from '../services/imageService';
import { compressImage } from '../services/compression';
import type { ImagePreview, CompressionQuality } from '../types';
import { toast } from 'sonner';

interface UploadProgressItem {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgressItem[]>([]);

  const uploadAllImages = useCallback(async (
    images: ImagePreview[],
    compressionQuality: CompressionQuality,
    onSuccess: () => void
  ) => {
    if (images.length === 0) return;

    setUploading(true);
    setProgress(images.map(img => ({
      fileName: img.file.name,
      progress: 0,
      status: 'pending' as const,
    })));

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Update progress to uploading
      setProgress(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'uploading' as const, progress: 50 } : item
      ));

      try {
        // Compress if needed
        let fileToUpload = image.file;
        if (compressionQuality !== 'none') {
          const compressed = await compressImage(image.file, compressionQuality);
          fileToUpload = compressed;
        }

        // Upload with metadata
        const result = await uploadImageWithMetadata({
          ...image,
          file: fileToUpload,
          compressionQuality,
        });

        if (result.success) {
          successCount++;
          setProgress(prev => prev.map((item, idx) => 
            idx === i ? { ...item, status: 'success' as const, progress: 100 } : item
          ));
        } else {
          failCount++;
          setProgress(prev => prev.map((item, idx) => 
            idx === i ? { 
              ...item, 
              status: 'error' as const, 
              progress: 0,
              error: result.error 
            } : item
          ));
        }
      } catch (error) {
        failCount++;
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setProgress(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            status: 'error' as const, 
            progress: 0,
            error: errorMessage 
          } : item
        ));
      }
    }

    setUploading(false);

    // Show results
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} image(s)`);
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} image(s)`);
    }

    // Call success callback if all succeeded
    if (failCount === 0) {
      onSuccess();
    }
  }, []);

  return {
    uploading,
    progress,
    uploadAllImages,
  };
}
