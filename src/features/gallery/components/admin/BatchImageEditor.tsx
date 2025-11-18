import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { RotateCw, Palette, Save, X, Images } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { logger } from '@/lib/logger';

interface BatchImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Array<{ file: File; preview: string }>;
  onSave: (editedFiles: File[]) => void;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
}

interface Transform {
  rotation: number;
  scale: number;
}

export const BatchImageEditor = ({ open, onOpenChange, images, onSave }: BatchImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open && images.length > 0) {
      const img = new Image();
      img.onload = () => setPreviewImage(img);
      img.src = images[0].preview;
    }
  }, [open, images]);

  useEffect(() => {
    if (previewImage && canvasRef.current) {
      drawPreview();
    }
  }, [previewImage, rotation, scale, filters]);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !previewImage) return;

    const maxWidth = 600;
    const maxHeight = 400;
    let width = previewImage.width * scale;
    let height = previewImage.height * scale;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
    `;

    ctx.drawImage(previewImage, 0, 0, width, height);
    ctx.restore();
  }, [previewImage, rotation, scale, filters]);

  const applyEditsToImage = (
    img: HTMLImageElement,
    transform: Transform,
    imageFilters: Filters
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const width = img.width * transform.scale;
      const height = img.height * transform.scale;

      canvas.width = width;
      canvas.height = height;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);

      ctx.filter = `
        brightness(${imageFilters.brightness}%)
        contrast(${imageFilters.contrast}%)
        saturate(${imageFilters.saturation}%)
        grayscale(${imageFilters.grayscale}%)
        sepia(${imageFilters.sepia}%)
      `;

      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleSave = async () => {
    if (images.length === 0) return;

    setProcessing(true);
    setProgress(0);

    try {
      const editedFiles: File[] = [];

      for (let i = 0; i < images.length; i++) {
        const imageFile = images[i].file;
        
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = images[i].preview;
        });

        const blob = await applyEditsToImage(img, { rotation, scale }, filters);
        const file = new File([blob], imageFile.name, { type: 'image/jpeg' });
        editedFiles.push(file);

        setProgress(((i + 1) / images.length) * 100);
      }

      onSave(editedFiles);
      toast.success(`Successfully processed ${editedFiles.length} images`);
      onOpenChange(false);
    } catch (error) {
      logger.error('Batch processing error', error, { component: 'BatchImageEditor' });
      toast.error('Failed to process images');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const resetFilters = () => {
    setRotation(0);
    setScale(1);
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
      sepia: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Batch Edit Images ({images.length} {images.length === 1 ? 'image' : 'images'})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center bg-muted p-4 rounded-lg">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto border border-border rounded"
            />
          </div>

          <Tabs defaultValue="transform" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transform">Transform</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="transform" className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation: {rotation}°
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[rotation]}
                    onValueChange={(value) => setRotation(value[0])}
                    min={0}
                    max={360}
                    step={15}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Scale: {scale.toFixed(2)}x</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[scale]}
                    onValueChange={(value) => setScale(value[0])}
                    min={0.1}
                    max={2}
                    step={0.1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    step="0.1"
                    className="w-20"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Brightness: {filters.brightness}%
                </Label>
                <Slider
                  value={[filters.brightness]}
                  onValueChange={(value) => setFilters({ ...filters, brightness: value[0] })}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Contrast: {filters.contrast}%</Label>
                <Slider
                  value={[filters.contrast]}
                  onValueChange={(value) => setFilters({ ...filters, contrast: value[0] })}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Saturation: {filters.saturation}%</Label>
                <Slider
                  value={[filters.saturation]}
                  onValueChange={(value) => setFilters({ ...filters, saturation: value[0] })}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Grayscale: {filters.grayscale}%</Label>
                <Slider
                  value={[filters.grayscale]}
                  onValueChange={(value) => setFilters({ ...filters, grayscale: value[0] })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Sepia: {filters.sepia}%</Label>
                <Slider
                  value={[filters.sepia]}
                  onValueChange={(value) => setFilters({ ...filters, sepia: value[0] })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </TabsContent>
          </Tabs>

          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing images...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetFilters} disabled={processing}>
            Reset
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={processing || images.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Apply to All ({images.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
