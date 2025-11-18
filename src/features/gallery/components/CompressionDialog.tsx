/**
 * Compression Dialog Component
 * Offers automatic compression for oversized files
 */

import { useState } from 'react';
import { FileWarning, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CompressionQuality } from '../types';
import { MAX_FILE_SIZE } from '../config/constants';
import {
  formatFileSize,
  getCompressionDescription,
  willMeetLimit,
  type OversizedFile,
} from '../services/compression';

// ============================================================================
// Types
// ============================================================================

export interface CompressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oversizedFiles: OversizedFile[];
  onCompress: (quality: CompressionQuality) => Promise<void>;
  onSkip: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function CompressionDialog({
  open,
  onOpenChange,
  oversizedFiles,
  onCompress,
  onSkip,
}: CompressionDialogProps) {
  const [selectedQuality, setSelectedQuality] = useState<CompressionQuality>('medium');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const totalFiles = oversizedFiles.length;
  const totalCurrentSize = oversizedFiles.reduce((sum, f) => sum + f.currentSize, 0);

  const handleCompress = async () => {
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      // Simulate progress (in real implementation, this would track actual compression)
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onCompress(selectedQuality);
      
      clearInterval(progressInterval);
      setCompressionProgress(100);
      
      // Close dialog after brief success display
      setTimeout(() => {
        onOpenChange(false);
        setIsCompressing(false);
        setCompressionProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Compression failed:', error);
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="compression-dialog" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <FileWarning className="h-6 w-6 text-warning mt-1" />
            <div className="flex-1">
              <DialogTitle className="text-xl">
                Files Exceed Size Limit
              </DialogTitle>
              <DialogDescription className="mt-2">
                {totalFiles} file{totalFiles !== 1 ? 's' : ''} exceed the {formatFileSize(MAX_FILE_SIZE)}MB limit.
                Compress them to proceed with upload.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* File list */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Oversized Files:</Label>
            <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
              {oversizedFiles.map((item, index) => (
                <div key={index} className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate flex-1">
                      {item.file.name}
                    </p>
                    <Badge variant="destructive" className="ml-2">
                      {formatFileSize(item.currentSize)}MB
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: {formatFileSize(item.currentSize)}MB → Target: &lt;{formatFileSize(MAX_FILE_SIZE)}MB
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Compression options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Compression Level:</Label>
            <RadioGroup
              value={selectedQuality}
              onValueChange={(value) => setSelectedQuality(value as CompressionQuality)}
              disabled={isCompressing}
            >
              {(['high', 'medium', 'low'] as CompressionQuality[]).map((quality) => {
                const estimatedSize = oversizedFiles[0]?.estimatedSizes[quality] || 0;
                const meetsLimit = willMeetLimit(estimatedSize);

                return (
                  <div
                    key={quality}
                    className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${
                      selectedQuality === quality
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={quality} id={quality} className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={quality}
                        className="flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <span className="capitalize">{quality}</span>
                        {quality === 'medium' && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                        {meetsLimit && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {getCompressionDescription(quality)}
                      </p>
                      {estimatedSize > 0 && (
                        <p className="text-xs font-medium">
                          Est. size: {formatFileSize(estimatedSize)}MB
                          {!meetsLimit && (
                            <span className="text-destructive ml-1">
                              (Still over limit)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Warning for insufficient compression */}
          {oversizedFiles.some(f => !willMeetLimit(f.estimatedSizes[selectedQuality])) && (
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Warning:</strong> Selected compression level may not reduce all files below the limit.
                Consider using a higher compression level or resizing images before upload.
              </AlertDescription>
            </Alert>
          )}

          {/* Compression progress */}
          {isCompressing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Compressing files...</span>
                <span className="font-medium">{compressionProgress}%</span>
              </div>
              <Progress value={compressionProgress} className="h-2" />
            </div>
          )}

          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total files:</span>
              <span className="font-medium">{totalFiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current total size:</span>
              <span className="font-medium">{formatFileSize(totalCurrentSize)}MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated after compression:</span>
              <span className="font-medium text-green-600">
                ~{formatFileSize(
                  oversizedFiles.reduce((sum, f) => sum + f.estimatedSizes[selectedQuality], 0)
                )}MB
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isCompressing}
          >
            Skip These Files
          </Button>
          <Button
            onClick={handleCompress}
            disabled={isCompressing}
            className="gap-2"
          >
            {isCompressing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              'Compress & Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
