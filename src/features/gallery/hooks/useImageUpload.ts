/**
 * useImageUpload Hook
 * Manages image upload process
 */

import { useCallback } from 'react';
import { useGalleryUpload, type CompressionQuality } from '@/hooks/useGalleryUpload';
import type { ImagePreview } from '../types';

export function useImageUpload() {
  const { uploading, progress, uploadImages } = useGalleryUpload();

  const uploadAllImages = useCallback(async (
    images: ImagePreview[],
    compressionQuality: CompressionQuality,
    onSuccess: () => void
  ) => {
    if (images.length === 0) return;

    const imagesWithCompression = images.map(img => ({
      ...img,
      compressionQuality
    }));

    await uploadImages(imagesWithCompression);
    onSuccess();
  }, [uploadImages]);

  return {
    uploading,
    progress,
    uploadAllImages,
  };
}
