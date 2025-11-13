/**
 * useImageManagement Hook
 * Manages image state and operations
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { ImagePreview } from '../types';
import { extractImageDimensions, analyzeImageQuality } from '../services/imageProcessingService';

export function useImageManagement() {
  const [images, setImages] = useState<ImagePreview[]>([]);

  const processFiles = useCallback(async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    for (const file of imageFiles) {
      try {
        const { width, height } = await extractImageDimensions(file);
        const preview = URL.createObjectURL(file);
        
        // Analyze image quality
        const quality = await analyzeImageQuality(file);
        
        // Show warnings if quality issues detected
        if (quality.issues.some(issue => issue !== 'none')) {
          toast.warning(`Quality issues detected in ${file.name}`, {
            description: `Image has ${quality.issues.filter(i => i !== 'none').join(', ')}`
          });
        }
        
        setImages(prev => [...prev, {
          file,
          preview,
          category: 'kitchens',
          displayName: file.name.replace(/\.[^/.]+$/, ''),
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          description: '',
          width,
          height,
          compressionQuality: 'medium',
          quality
        }]);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const updateImage = useCallback((index: number, updates: Partial<ImagePreview>) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    ));
  }, []);

  const updateMultipleImages = useCallback((indices: Set<number>, updates: Partial<ImagePreview>) => {
    setImages(prev => prev.map((img, i) => 
      indices.has(i) ? { ...img, ...updates } : img
    ));
  }, []);

  const clearImages = useCallback(() => {
    setImages(prev => {
      prev.forEach(img => URL.revokeObjectURL(img.preview));
      return [];
    });
  }, []);

  return {
    images,
    processFiles,
    removeImage,
    updateImage,
    updateMultipleImages,
    clearImages,
  };
}
