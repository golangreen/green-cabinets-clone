/**
 * Image Preview Card Component
 * Displays individual image with controls and metadata
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Edit, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { QualityWarnings } from './QualityWarnings';
import type { ImagePreview, UploadProgress } from '../types';

interface ImagePreviewCardProps {
  image: ImagePreview;
  index: number;
  isSelected: boolean;
  uploadProgress?: UploadProgress[string];
  onToggleSelect: (index: number) => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  showSelection?: boolean;
}

export function ImagePreviewCard({
  image,
  index,
  isSelected,
  uploadProgress,
  onToggleSelect,
  onEdit,
  onRemove,
  showSelection = true,
}: ImagePreviewCardProps) {
  const isUploading = uploadProgress?.status === 'uploading';
  const uploadSuccess = uploadProgress?.status === 'success';
  const uploadError = uploadProgress?.status === 'error';

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={image.preview}
          alt={image.altText}
          className="w-full h-48 object-cover"
        />
        
        {showSelection && (
          <div className="absolute top-2 left-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(index)}
              className="bg-background border-2"
            />
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEdit(index)}
            disabled={isUploading}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onRemove(index)}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Upload Status Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">Uploading...</p>
              <p className="text-xs text-muted-foreground">{uploadProgress.progress}%</p>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center text-success">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Uploaded!</p>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center text-destructive">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Upload failed</p>
              <p className="text-xs">{uploadProgress.error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{image.displayName}</p>
            <p className="text-sm text-muted-foreground truncate">{image.altText}</p>
          </div>
          <Badge variant="outline" className="shrink-0">
            {image.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{image.width} × {image.height}</span>
          <span>{(image.file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>

        {image.quality && (
          <QualityWarnings quality={image.quality} />
        )}
      </div>
    </Card>
  );
}
