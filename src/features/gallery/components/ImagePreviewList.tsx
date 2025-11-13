/**
 * Image Preview List Component
 * Displays grid of image preview cards
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Images } from 'lucide-react';
import { ImagePreviewCard } from './ImagePreviewCard';
import type { ImagePreview, UploadProgress } from '../types';

interface ImagePreviewListProps {
  images: ImagePreview[];
  selectedIndices: Set<number>;
  uploadProgress: UploadProgress;
  onToggleSelect: (index: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onBatchEdit: () => void;
  onMetadataEdit: () => void;
}

export function ImagePreviewList({
  images,
  selectedIndices,
  uploadProgress,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onEdit,
  onRemove,
  onBatchEdit,
  onMetadataEdit,
}: ImagePreviewListProps) {
  const allSelected = selectedIndices.size === images.length;
  const hasSelection = selectedIndices.size > 0;
  const hasMultipleSelection = selectedIndices.size > 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Images to Upload ({images.length})</CardTitle>
            <CardDescription>Review and edit metadata before uploading</CardDescription>
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={allSelected ? onClearSelection : onSelectAll}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
              
              {hasMultipleSelection && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onBatchEdit}
                  >
                    <Images className="w-4 h-4 mr-2" />
                    Batch Edit ({selectedIndices.size})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onMetadataEdit}
                  >
                    Edit Metadata ({selectedIndices.size})
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <ImagePreviewCard
              key={image.preview}
              image={image}
              index={index}
              isSelected={selectedIndices.has(index)}
              uploadProgress={uploadProgress[index]}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onRemove={onRemove}
              showSelection={images.length > 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
