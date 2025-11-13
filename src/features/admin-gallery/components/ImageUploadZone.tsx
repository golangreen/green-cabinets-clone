import { Upload } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadZoneProps {
  onUpload: (file: File, metadata: { displayName?: string; category?: string; altText?: string }) => void;
  isUploading: boolean;
}

export function ImageUploadZone({ onUpload, isUploading }: ImageUploadZoneProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // For now, upload with basic metadata
      // TODO: Add form for metadata input
      onUpload(file, {
        displayName: file.name,
        category: 'general',
        altText: file.name
      });

      // Reset input
      e.target.value = '';
    },
    [onUpload]
  );

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Upload Images to CDN</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload images to Lovable Cloud Storage (10MB limit per file)
      </p>
      <div className="max-w-md mx-auto">
        <Label htmlFor="image-upload" className="cursor-pointer">
          <Button
            type="button"
            variant="brand-outline"
            disabled={isUploading}
            asChild
          >
            <span>
              {isUploading ? 'Uploading...' : 'Select Images'}
            </span>
          </Button>
        </Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
