import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { RotateCw, Crop, Maximize2, Palette, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (editedFile: File) => void;
  originalFileName: string;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
}

export const ImageEditor = ({ open, onOpenChange, imageUrl, onSave, originalFileName }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
  });
  const [cropMode, setCropMode] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open && imageUrl) {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = imageUrl;
    }
  }, [open, imageUrl]);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawImage();
    }
  }, [image, rotation, scale, filters, cropMode, cropStart, cropEnd]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Set canvas size
    const maxWidth = 800;
    const maxHeight = 600;
    let width = image.width * scale;
    let height = image.height * scale;

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

    // Apply transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    // Apply filters
    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
    `;

    ctx.drawImage(image, 0, 0, width, height);
    ctx.restore();

    // Draw crop overlay
    if (cropMode && cropStart && cropEnd) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        cropStart.x,
        cropStart.y,
        cropEnd.x - cropStart.x,
        cropEnd.y - cropStart.y
      );
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, cropStart.y);
      ctx.fillRect(0, cropStart.y, cropStart.x, cropEnd.y - cropStart.y);
      ctx.fillRect(cropEnd.x, cropStart.y, canvas.width - cropEnd.x, cropEnd.y - cropStart.y);
      ctx.fillRect(0, cropEnd.y, canvas.width, canvas.height - cropEnd.y);
    }
  }, [image, rotation, scale, filters, cropMode, cropStart, cropEnd]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropStart({ x, y });
    setCropEnd({ x, y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !cropStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropEnd({ x, y });
  };

  const handleCanvasMouseUp = () => {
    if (cropMode && cropStart && cropEnd) {
      toast.success('Crop area selected');
    }
  };

  const applyCrop = () => {
    if (!cropStart || !cropEnd || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);

    const imageData = ctx.getImageData(x, y, width, height);
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);

    setCropMode(false);
    setCropStart(null);
    setCropEnd(null);
    toast.success('Image cropped');
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], originalFileName, { type: 'image/png' });
        onSave(file);
        onOpenChange(false);
        toast.success('Image edited successfully');
      }
    }, 'image/png');
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
      sepia: 0,
    });
    setRotation(0);
    setScale(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center border rounded-lg p-4 bg-muted/20">
            <canvas
              ref={canvasRef}
              className={cropMode ? 'cursor-crosshair' : 'cursor-default'}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />
          </div>

          <Tabs defaultValue="transform" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transform">
                <RotateCw className="w-4 h-4 mr-2" />
                Transform
              </TabsTrigger>
              <TabsTrigger value="crop">
                <Crop className="w-4 h-4 mr-2" />
                Crop
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Palette className="w-4 h-4 mr-2" />
                Filters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transform" className="space-y-4">
              <div className="space-y-2">
                <Label>Rotation: {rotation}°</Label>
                <div className="flex gap-2">
                  <Button onClick={handleRotate} variant="outline" className="flex-1">
                    Rotate 90°
                  </Button>
                  <Input
                    type="number"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Scale: {scale.toFixed(2)}x</Label>
                <Slider
                  value={[scale]}
                  onValueChange={([value]) => setScale(value)}
                  min={0.1}
                  max={2}
                  step={0.1}
                />
              </div>
            </TabsContent>

            <TabsContent value="crop" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {cropMode ? 'Click and drag on the image to select crop area' : 'Enable crop mode to start'}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCropMode(!cropMode)}
                    variant={cropMode ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    {cropMode ? 'Disable Crop Mode' : 'Enable Crop Mode'}
                  </Button>
                  {cropMode && cropStart && cropEnd && (
                    <Button onClick={applyCrop} variant="default">
                      Apply Crop
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-2">
                <Label>Brightness: {filters.brightness}%</Label>
                <Slider
                  value={[filters.brightness]}
                  onValueChange={([value]) => setFilters({ ...filters, brightness: value })}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Contrast: {filters.contrast}%</Label>
                <Slider
                  value={[filters.contrast]}
                  onValueChange={([value]) => setFilters({ ...filters, contrast: value })}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Saturation: {filters.saturation}%</Label>
                <Slider
                  value={[filters.saturation]}
                  onValueChange={([value]) => setFilters({ ...filters, saturation: value })}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Grayscale: {filters.grayscale}%</Label>
                <Slider
                  value={[filters.grayscale]}
                  onValueChange={([value]) => setFilters({ ...filters, grayscale: value })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Sepia: {filters.sepia}%</Label>
                <Slider
                  value={[filters.sepia]}
                  onValueChange={([value]) => setFilters({ ...filters, sepia: value })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <Button onClick={resetFilters} variant="outline" className="w-full">
                Reset All Filters
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
