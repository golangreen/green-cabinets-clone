/**
 * Gallery Image Processor Component
 * Handles image preview, editing, and upload controls
 */

import { ImagePreviewList } from './ImagePreviewList';
import { UploadControls } from './UploadControls';
import type { ImagePreview, CompressionQuality } from '../types';

interface GalleryImageProcessorProps {
  images: ImagePreview[];
  selectedIndices: Set<number>;
  uploading: boolean;
  compressionQuality: CompressionQuality;
  onToggleSelect: (index: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onBatchEdit: () => void;
  onMetadataEdit: () => void;
  onCompressionChange: (quality: CompressionQuality) => void;
  onUpload: () => void;
}

export function GalleryImageProcessor({
  images,
  selectedIndices,
  uploading,
  compressionQuality,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onEdit,
  onRemove,
  onBatchEdit,
  onMetadataEdit,
  onCompressionChange,
  onUpload,
}: GalleryImageProcessorProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <ImagePreviewList
        images={images}
        selectedIndices={selectedIndices}
        uploadProgress={{}}
        onToggleSelect={onToggleSelect}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        onEdit={onEdit}
        onRemove={onRemove}
        onBatchEdit={onBatchEdit}
        onMetadataEdit={onMetadataEdit}
      />

      <UploadControls
        imageCount={images.length}
        compressionQuality={compressionQuality}
        uploading={uploading}
        onCompressionChange={onCompressionChange}
        onUpload={onUpload}
      />
    </>
  );
}
