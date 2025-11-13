/**
 * Admin Gallery Page
 * Main page for managing gallery images - now using custom hooks
 */

import { useState } from 'react';
import { AdminRoute } from '@/components/auth';
import { Header, Footer } from '@/components/layout';
import type { CompressionQuality } from '@/hooks/useGalleryUpload';
import type { GalleryCategory } from '@/types/gallery';
import {
  GalleryUploadZone,
  ImagePreviewList,
  UploadControls,
} from '@/features/gallery/components';
import {
  useImageManagement,
  useImageSelection,
  useImageUpload,
  useModalManager,
} from '@/features/gallery/hooks';

export default function AdminGallery() {
  const [compressionQuality, setCompressionQuality] = useState<CompressionQuality>('medium');

  // Custom hooks for state management
  const {
    images,
    processFiles,
    removeImage,
    updateImage,
    updateMultipleImages,
    clearImages,
  } = useImageManagement();

  const {
    selectedIndices,
    toggleSelection,
    selectAll,
    clearSelection,
    adjustSelectionAfterRemoval,
  } = useImageSelection();

  const { uploading, uploadAllImages } = useImageUpload();

  const {
    modalState,
    openEditModal,
    openBatchEditModal,
    openMetadataModal,
    closeModal,
    isEditModalOpen,
    isBatchEditModalOpen,
    isMetadataModalOpen,
  } = useModalManager();

  const handleRemoveImage = (index: number) => {
    removeImage(index);
    adjustSelectionAfterRemoval(index);
  };

  const handleEditSave = (updates: Partial<any>) => {
    if (modalState.data?.imageIndex !== undefined) {
      updateImage(modalState.data.imageIndex, updates);
      closeModal();
    }
  };

  const handleBatchEditSave = (updates: { category?: GalleryCategory; compressionQuality?: CompressionQuality }) => {
    updateMultipleImages(selectedIndices, updates);
    closeModal();
  };

  const handleMetadataSave = (updates: { altText?: string; description?: string; displayName?: string }) => {
    updateMultipleImages(selectedIndices, updates);
    closeModal();
  };

  const handleUpload = async () => {
    await uploadAllImages(images, compressionQuality, clearImages);
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Gallery Management</h1>
            <p className="text-muted-foreground">Upload and manage gallery images with automatic metadata extraction</p>
          </div>

          <div className="grid gap-6">
            <GalleryUploadZone
              onFilesSelected={processFiles}
              disabled={uploading}
            />

            {images.length > 0 && (
              <>
                <ImagePreviewList
                  images={images}
                  selectedIndices={selectedIndices}
                  uploadProgress={{}}
                  onToggleSelect={toggleSelection}
                  onSelectAll={() => selectAll(images.length)}
                  onClearSelection={clearSelection}
                  onEdit={openEditModal}
                  onRemove={handleRemoveImage}
                  onBatchEdit={() => openBatchEditModal(selectedIndices.size)}
                  onMetadataEdit={() => openMetadataModal(Array.from(selectedIndices))}
                />

                <UploadControls
                  imageCount={images.length}
                  compressionQuality={compressionQuality}
                  uploading={uploading}
                  onCompressionChange={setCompressionQuality}
                  onUpload={handleUpload}
                />
              </>
            )}
          </div>
        </main>

        <Footer />

        {/* Modals - Managed by useModalManager hook */}
        {/* TODO: Integrate modal components with new type system
        {isEditModalOpen && modalState.data?.imageIndex !== undefined && (
          <ImageEditor
            image={images[modalState.data.imageIndex]}
            onSave={handleEditSave}
            onClose={closeModal}
          />
        )}

        {isBatchEditModalOpen && (
          <BatchImageEditor
            selectedCount={modalState.data?.selectedCount || 0}
            onSave={handleBatchEditSave}
            onClose={closeModal}
          />
        )}

        {isMetadataModalOpen && modalState.data?.selectedIndices && (
          <BulkMetadataEditor
            images={modalState.data.selectedIndices.map((i: number) => images[i])}
            onSave={handleMetadataSave}
            onClose={closeModal}
          />
        )}
        */}
      </div>
    </AdminRoute>
  );
}
