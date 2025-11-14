/**
 * useGalleryActions Hook
 * Provides coordinated action handlers for gallery operations
 */

import { useCallback } from 'react';
import type { CompressionQuality } from '../types';
import type { GalleryCategory } from '@/types/gallery';

interface GalleryState {
  images: any[];
  compressionQuality: CompressionQuality;
  selectedIndices: Set<number>;
  modalState: { data?: any };
  removeImage: (index: number) => void;
  adjustSelectionAfterRemoval: (index: number) => void;
  uploadAllImages: (images: any[], quality: CompressionQuality, onSuccess: () => void) => Promise<void>;
  clearImages: () => void;
  updateImage: (index: number, updates: Partial<any>) => void;
  updateMultipleImages: (indices: Set<number>, updates: Partial<any>) => void;
  closeModal: () => void;
}

export function useGalleryActions(state: GalleryState) {
  const handleRemoveImage = useCallback((index: number) => {
    state.removeImage(index);
    state.adjustSelectionAfterRemoval(index);
  }, [state]);

  const handleUpload = useCallback(async () => {
    await state.uploadAllImages(
      state.images,
      state.compressionQuality,
      state.clearImages
    );
  }, [state]);

  const handleEditSave = useCallback((updates: Partial<any>) => {
    if (state.modalState.data?.imageIndex !== undefined) {
      state.updateImage(state.modalState.data.imageIndex, updates);
      state.closeModal();
    }
  }, [state]);

  const handleBatchEditSave = useCallback((updates: { 
    category?: GalleryCategory; 
    compressionQuality?: CompressionQuality 
  }) => {
    state.updateMultipleImages(state.selectedIndices, updates);
    state.closeModal();
  }, [state]);

  const handleMetadataSave = useCallback((updates: { 
    altText?: string; 
    description?: string; 
    displayName?: string 
  }) => {
    state.updateMultipleImages(state.selectedIndices, updates);
    state.closeModal();
  }, [state]);

  return {
    handleRemoveImage,
    handleUpload,
    handleEditSave,
    handleBatchEditSave,
    handleMetadataSave,
  };
}
