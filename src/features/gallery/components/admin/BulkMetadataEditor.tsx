import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Save, X, Copy, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ImageMetadata {
  displayName: string;
  altText: string;
  description: string;
}

interface BulkMetadataEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Array<{
    file: File;
    preview: string;
    displayName: string;
    altText: string;
  }>;
  onSave: (metadata: ImageMetadata[]) => void;
}

export const BulkMetadataEditor = ({ open, onOpenChange, images, onSave }: BulkMetadataEditorProps) => {
  const [metadata, setMetadata] = useState<ImageMetadata[]>(
    images.map(img => ({
      displayName: img.displayName,
      altText: img.altText,
      description: ''
    }))
  );
  const [bulkValues, setBulkValues] = useState({
    displayName: '',
    altText: '',
    description: ''
  });
  const [generating, setGenerating] = useState<number | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);

  const convertImageToBase64 = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  const generateAIMetadata = async (index: number) => {
    try {
      setGenerating(index);
      const imageData = await convertImageToBase64(images[index].preview);
      
      const { data, error } = await supabase.functions.invoke('generate-image-metadata', {
        body: { imageData }
      });

      if (error) {
        console.error('Error generating metadata:', error);
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error('Failed to generate metadata. Please try again.');
        }
        return;
      }

      if (data?.altText) {
        setMetadata(prev => prev.map((meta, i) => 
          i === index ? {
            displayName: data.displayName || meta.displayName,
            altText: data.altText,
            description: data.description || ''
          } : meta
        ));
        toast.success('AI metadata generated successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate metadata');
    } finally {
      setGenerating(null);
    }
  };

  const generateAllAIMetadata = async () => {
    try {
      setGeneratingAll(true);
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < images.length; i++) {
        try {
          setGenerating(i);
          const imageData = await convertImageToBase64(images[i].preview);
          
          const { data, error } = await supabase.functions.invoke('generate-image-metadata', {
            body: { imageData }
          });

          if (error) throw error;

          if (data?.altText) {
            setMetadata(prev => prev.map((meta, j) => 
              j === i ? {
                displayName: data.displayName || meta.displayName,
                altText: data.altText,
                description: data.description || ''
              } : meta
            ));
            successCount++;
          }
          
          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Failed to generate metadata for image ${i}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Generated metadata for ${successCount} images${failCount > 0 ? ` (${failCount} failed)` : ''}`);
      } else {
        toast.error('Failed to generate metadata for any images');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Batch generation failed');
    } finally {
      setGenerating(null);
      setGeneratingAll(false);
    }
  };

  const updateMetadata = (index: number, field: keyof ImageMetadata, value: string) => {
    setMetadata(prev => prev.map((meta, i) => 
      i === index ? { ...meta, [field]: value } : meta
    ));
  };

  const applyBulkValues = () => {
    setMetadata(prev => prev.map(meta => ({
      displayName: bulkValues.displayName || meta.displayName,
      altText: bulkValues.altText || meta.altText,
      description: bulkValues.description || meta.description,
    })));
    toast.success('Bulk values applied to all images');
  };

  const handleSave = () => {
    onSave(metadata);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Metadata for {images.length} Images</DialogTitle>
          <DialogDescription>
            Add metadata to all selected images individually or apply bulk values
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Bulk Actions */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <Label className="text-sm font-semibold">Apply to All Images</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Display Name"
                value={bulkValues.displayName}
                onChange={(e) => setBulkValues({ ...bulkValues, displayName: e.target.value })}
              />
              <Input
                placeholder="Alt Text"
                value={bulkValues.altText}
                onChange={(e) => setBulkValues({ ...bulkValues, altText: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={bulkValues.description}
                onChange={(e) => setBulkValues({ ...bulkValues, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={applyBulkValues} variant="secondary" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Apply to All
              </Button>
              <Button 
                onClick={generateAllAIMetadata} 
                variant="secondary" 
                size="sm"
                disabled={generatingAll}
              >
                {generatingAll ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate All with AI
              </Button>
            </div>
          </div>

          <Separator />

          {/* Individual Images */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {images.map((image, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Image {index + 1}: {image.file.name}</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => generateAIMetadata(index)}
                          disabled={generating === index}
                        >
                          {generating === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Display Name</Label>
                          <Input
                            value={metadata[index]?.displayName || ''}
                            onChange={(e) => updateMetadata(index, 'displayName', e.target.value)}
                            placeholder="Display name..."
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Alt Text</Label>
                          <Input
                            value={metadata[index]?.altText || ''}
                            onChange={(e) => updateMetadata(index, 'altText', e.target.value)}
                            placeholder="Alt text..."
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={metadata[index]?.description || ''}
                            onChange={(e) => updateMetadata(index, 'description', e.target.value)}
                            placeholder="Description..."
                            rows={1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save All Metadata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
