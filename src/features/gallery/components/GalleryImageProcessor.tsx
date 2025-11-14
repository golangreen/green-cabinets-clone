/**
 * Gallery Image Processor Component
 * Handles image preview, editing, and upload controls
 */

import { ImagePreviewList } from './ImagePreviewList';
import { UploadControls } from './UploadControls';
import { useGalleryContext } from '../hooks';

export function GalleryImageProcessor() {
  const {
    images,
    selectedIndices,
    uploading,
    compressionQuality,
    toggleSelection,
    selectAll,
    clearSelection,
    openEditModal,
    handleRemoveImage,
    openBatchEditModal,
    openMetadataModal,
    setCompressionQuality,
    handleUpload,
  } = useGalleryContext();
  if (images.length === 0) {
    return null;
  }

  return (
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
  );
}
