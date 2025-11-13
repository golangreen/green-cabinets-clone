/**
 * Upload Controls Component
 * Upload button and compression settings
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { CompressionSettings } from './CompressionSettings';
import type { CompressionQuality } from '../types';

interface UploadControlsProps {
  imageCount: number;
  compressionQuality: CompressionQuality;
  uploading: boolean;
  onCompressionChange: (quality: CompressionQuality) => void;
  onUpload: () => void;
}

export function UploadControls({
  imageCount,
  compressionQuality,
  uploading,
  onCompressionChange,
  onUpload,
}: UploadControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CompressionSettings
          value={compressionQuality}
          onChange={onCompressionChange}
          disabled={uploading}
        />

        <Button
          onClick={onUpload}
          disabled={imageCount === 0 || uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload {imageCount} {imageCount === 1 ? 'Image' : 'Images'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
