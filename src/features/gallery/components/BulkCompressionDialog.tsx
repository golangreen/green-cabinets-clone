/**
 * Bulk Compression Dialog
 * Dialog for bulk compressing selected images
 */

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CompressionQuality } from '../types';
import type { CompressionRecommendation } from '../services/storageAnalyzerService';
import type { BulkCompressionProgress, BulkCompressionResult } from '../services/bulkCompressionService';
import { formatFileSize } from '../services/storageAnalyzerService';
import { calculateTotalSavings } from '../services/bulkCompressionService';
import { estimateCompressedSize } from '../services/compressionService';

// ============================================================================
// Types
// ============================================================================

export interface BulkCompressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendations: CompressionRecommendation[];
  onCompress: (quality: CompressionQuality) => Promise<void>;
}

// ============================================================================
// Component
// ============================================================================

export function BulkCompressionDialog({
  open,
  onOpenChange,
  recommendations,
  onCompress,
}: BulkCompressionDialogProps) {
  const [selectedQuality, setSelectedQuality] = useState<CompressionQuality>('medium');
  const [isCompressing, setIsCompressing] = useState(false);

  const totalSavings = calculateTotalSavings(
    recommendations.map(r => r.image),
    selectedQuality,
    estimateCompressedSize
  );

  const handleCompress = async () => {
    setIsCompressing(true);
    try {
      await onCompress(selectedQuality);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <DialogTitle className="text-xl">Bulk Compress Images</DialogTitle>
              <DialogDescription className="mt-2">
                Compress {recommendations.length} selected image{recommendations.length !== 1 ? 's' : ''} to
                optimize storage usage
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Selected images list */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Selected Images:</Label>
            <ScrollArea className="h-[200px] border rounded-lg">
              <div className="p-3 space-y-2">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rec.image.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(rec.currentSize)} → {formatFileSize(rec.estimatedSize)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {rec.savingsPercent.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Quality selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Compression Quality:</Label>
            <RadioGroup
              value={selectedQuality}
              onValueChange={(value) => setSelectedQuality(value as CompressionQuality)}
              disabled={isCompressing}
            >
              {(['high', 'medium', 'low'] as CompressionQuality[]).map((quality) => (
                <div
                  key={quality}
                  className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${
                    selectedQuality === quality
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={quality} id={`bulk-${quality}`} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={`bulk-${quality}`}
                      className="flex items-center gap-2 cursor-pointer font-medium capitalize"
                    >
                      {quality}
                      {quality === 'medium' && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quality === 'high' && 'Minimal quality loss, moderate compression'}
                      {quality === 'medium' && 'Balanced quality and size (best for most images)'}
                      {quality === 'low' && 'Maximum compression, noticeable quality loss'}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Images to compress:</span>
              <span className="font-medium">{recommendations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated savings:</span>
              <span className="font-medium text-green-600">{formatFileSize(totalSavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average per image:</span>
              <span className="font-medium">
                {formatFileSize(totalSavings / recommendations.length)}
              </span>
            </div>
          </div>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This operation will download, compress, and re-upload the selected images. Original files
              will be replaced. This may take several minutes depending on the number of images.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCompressing}>
            Cancel
          </Button>
          <Button onClick={handleCompress} disabled={isCompressing} className="gap-2">
            {isCompressing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Compress All
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
