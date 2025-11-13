import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GalleryImage } from "@/services/storageService";
import { storageService } from "@/services/storageService";

interface ImageGridProps {
  images: GalleryImage[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ImageGrid({ images, onDelete, isDeleting }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No images uploaded yet</p>
        <p className="text-sm mt-2">Upload your first image to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="aspect-square relative bg-muted">
            <img
              src={storageService.getImageUrl(image.storage_path)}
              alt={image.alt_text || image.display_name || ''}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-3 space-y-2">
            <div className="min-h-[2.5rem]">
              <h3 className="font-medium text-sm line-clamp-2">
                {image.display_name || image.original_filename}
              </h3>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{image.category || 'Uncategorized'}</span>
              <span>{formatFileSize(image.file_size || 0)}</span>
            </div>
            {image.width && image.height && (
              <p className="text-xs text-muted-foreground">
                {image.width} × {image.height}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(storageService.getImageUrl(image.storage_path));
                }}
              >
                Copy URL
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(image.id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
