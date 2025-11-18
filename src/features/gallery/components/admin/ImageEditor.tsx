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
    setCropStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setCropEnd(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !cropStart) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCropEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleCanvasMouseUp = () => {
    if (cropMode && cropStart && cropEnd) {
      setCropMode(false);
    }
  };

  const applyCrop = () => {
    if (!image || !cropStart || !cropEnd || !canvasRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropWidth = Math.abs(cropEnd.x - cropStart.x);
    const cropHeight = Math.abs(cropEnd.y - cropStart.y);
    const cropX = Math.min(cropStart.x, cropEnd.x);
    const cropY = Math.min(cropStart.y, cropEnd.y);

    // Calculate scale factor
    const displayCanvas = canvasRef.current;
    const scaleX = image.width / displayCanvas.width;
    const scaleY = image.height / displayCanvas.height;

    canvas.width = cropWidth * scaleX;
    canvas.height = cropHeight * scaleY;

    ctx.drawImage(
      image,
      cropX * scaleX,
      cropY * scaleY,
      cropWidth * scaleX,
      cropHeight * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const newImg = new Image();
        newImg.onload = () => {
          setImage(newImg);
          setCropStart(null);
          setCropEnd(null);
          toast.success('Image cropped successfully');
        };
        newImg.src = URL.createObjectURL(blob);
      }
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], originalFileName, { type: 'image/jpeg' });
        onSave(file);
        onOpenChange(false);
        toast.success('Image saved successfully');
      }
    }, 'image/jpeg', 0.9);
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
    setCropMode(false);
    setCropStart(null);
    setCropEnd(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center bg-muted p-4 rounded-lg">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto border border-border rounded cursor-crosshair"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={cropMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCropMode(!cropMode);
                setCropStart(null);
                setCropEnd(null);
              }}
            >
              <Crop className="h-4 w-4 mr-2" />
              Crop Mode
            </Button>
            {cropStart && cropEnd && (
              <Button size="sm" onClick={applyCrop}>
                Apply Crop
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setScale(1)}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Reset Size
            </Button>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetFilters}>
            Reset All
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
