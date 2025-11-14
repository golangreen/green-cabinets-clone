/**
 * useGalleryManager Hook
 * Facade hook that combines all gallery management hooks into a single interface
 */

import { useState, useCallback } from 'react';
import { useImageManagement } from './useImageManagement';
import { useImageSelection } from './useImageSelection';
import { useImageUpload } from './useImageUpload';
import { useModalManager } from './useModalManager';
import { useAutoCompression } from './useAutoCompression';
import type { CompressionQuality } from '../types';
import type { GalleryCategory } from '@/types/gallery';

export function useGalleryManager() {
  const [compressionQuality, setCompressionQuality] = useState<CompressionQuality>('medium');

  // Combine all sub-hooks
  const imageManagement = useImageManagement();
  const imageSelection = useImageSelection();
  const imageUpload = useImageUpload();
  const modalManager = useModalManager();
  const autoCompression = useAutoCompression();

  // Coordinated actions
  const handleRemoveImage = useCallback((index: number) => {
    imageManagement.removeImage(index);
    imageSelection.adjustSelectionAfterRemoval(index);
  }, [imageManagement, imageSelection]);

  const handleUpload = useCallback(async () => {
    await imageUpload.uploadAllImages(
      imageManagement.images,
      compressionQuality,
      imageManagement.clearImages
    );
  }, [imageUpload, imageManagement, compressionQuality]);

  const handleEditSave = useCallback((updates: Partial<any>) => {
    if (modalManager.modalState.data?.imageIndex !== undefined) {
      imageManagement.updateImage(modalManager.modalState.data.imageIndex, updates);
      modalManager.closeModal();
    }
  }, [modalManager, imageManagement]);

  const handleBatchEditSave = useCallback((updates: { 
    category?: GalleryCategory; 
    compressionQuality?: CompressionQuality 
  }) => {
    imageManagement.updateMultipleImages(imageSelection.selectedIndices, updates);
    modalManager.closeModal();
  }, [imageManagement, imageSelection, modalManager]);

  const handleMetadataSave = useCallback((updates: { 
    altText?: string; 
    description?: string; 
    displayName?: string 
  }) => {
    imageManagement.updateMultipleImages(imageSelection.selectedIndices, updates);
    modalManager.closeModal();
  }, [imageManagement, imageSelection, modalManager]);

  return {
    // State
    compressionQuality,
    setCompressionQuality,
    
    // Image management
    images: imageManagement.images,
    processFiles: imageManagement.processFiles,
    clearImages: imageManagement.clearImages,
    
    // Selection
    selectedIndices: imageSelection.selectedIndices,
    toggleSelection: imageSelection.toggleSelection,
    selectAll: imageSelection.selectAll,
    clearSelection: imageSelection.clearSelection,
    
    // Upload
    uploading: imageUpload.uploading,
    
    // Modal state
    modalState: modalManager.modalState,
    isEditModalOpen: modalManager.isEditModalOpen,
    isBatchEditModalOpen: modalManager.isBatchEditModalOpen,
    isMetadataModalOpen: modalManager.isMetadataModalOpen,
    openEditModal: modalManager.openEditModal,
    openBatchEditModal: modalManager.openBatchEditModal,
    openMetadataModal: modalManager.openMetadataModal,
    closeModal: modalManager.closeModal,
    
    // Compression
    oversizedFiles: autoCompression.oversizedFiles,
    checkForOversizedFiles: autoCompression.checkForOversizedFiles,
    compressOversizedFiles: autoCompression.compressOversizedFiles,
    clearOversizedFiles: autoCompression.clearOversizedFiles,
    
    // Coordinated actions
    handleRemoveImage,
    handleUpload,
    handleEditSave,
    handleBatchEditSave,
    handleMetadataSave,
  };
}
