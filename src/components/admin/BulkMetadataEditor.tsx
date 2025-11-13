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
            setMetadata(prev => prev.map((meta, idx) => 
              idx === i ? {
                displayName: data.displayName || meta.displayName,
                altText: data.altText,
                description: data.description || ''
              } : meta
            ));
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to generate metadata for image ${i}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Generated metadata for ${successCount} image(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to generate metadata for ${failCount} image(s)`);
      }
    } finally {
      setGenerating(null);
      setGeneratingAll(false);
    }
  };

  const handleApplyToAll = (field: keyof ImageMetadata) => {
    if (!bulkValues[field]) {
      toast.error(`Please enter a ${field} to apply to all images`);
      return;
    }

    setMetadata(prev => prev.map(meta => ({
      ...meta,
      [field]: bulkValues[field]
    })));
    toast.success(`Applied ${field} to all images`);
  };

  const handleUpdateSingle = (index: number, field: keyof ImageMetadata, value: string) => {
    setMetadata(prev => prev.map((meta, i) => 
      i === index ? { ...meta, [field]: value } : meta
    ));
  };

  const handleSave = () => {
    // Validate all images have required fields
    const missingFields = metadata.some(meta => !meta.displayName || !meta.altText);
    if (missingFields) {
      toast.error('All images must have a display name and alt text');
      return;
    }

    onSave(metadata);
    onOpenChange(false);
    toast.success('Metadata updated successfully');
  };

  const copyFromDisplayName = (index: number) => {
    setMetadata(prev => prev.map((meta, i) => 
      i === index ? { ...meta, altText: meta.displayName } : meta
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Bulk Metadata Editor</DialogTitle>
          <DialogDescription>
            Update SEO metadata for {images.length} image{images.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Apply to All Section */}
          <div className="rounded-lg border p-4 bg-muted/20">
            <h3 className="text-sm font-semibold mb-4">Apply to All Images</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bulk-display-name">Display Name</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleApplyToAll('displayName')}
                    disabled={!bulkValues.displayName}
                  >
                    Apply to All
                  </Button>
                </div>
                <Input
                  id="bulk-display-name"
                  value={bulkValues.displayName}
                  onChange={(e) => setBulkValues(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter display name for all images"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bulk-alt-text">Alt Text (SEO Important)</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleApplyToAll('altText')}
                    disabled={!bulkValues.altText}
                  >
                    Apply to All
                  </Button>
                </div>
                <Input
                  id="bulk-alt-text"
                  value={bulkValues.altText}
                  onChange={(e) => setBulkValues(prev => ({ ...prev, altText: e.target.value }))}
                  placeholder="Enter alt text for all images"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bulk-description">Description (Optional)</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleApplyToAll('description')}
                    disabled={!bulkValues.description}
                  >
                    Apply to All
                  </Button>
                </div>
                <Textarea
                  id="bulk-description"
                  value={bulkValues.description}
                  onChange={(e) => setBulkValues(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description for all images"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* AI Generation Section */}
          <div className="rounded-lg border p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI-Powered Metadata Generation
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically generate SEO-optimized alt text and descriptions using AI image analysis
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={generateAllAIMetadata}
                disabled={generatingAll || images.length === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {generatingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate All with AI
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Individual Images Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Individual Image Metadata</h3>
            <ScrollArea className="h-[400px] rounded-lg border p-4">
              <div className="space-y-6">
                {images.map((image, index) => (
                  <div key={index} className="space-y-4 pb-6 border-b last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img 
                          src={image.preview} 
                          alt={metadata[index].displayName} 
                          className="w-24 h-24 object-cover rounded"
                        />
                        {generating === index && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Image {index + 1}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateAIMetadata(index)}
                            disabled={generating !== null}
                            className="h-8"
                          >
                            {generating === index ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Generate with AI
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`display-name-${index}`} className="text-xs">
                            Display Name
                          </Label>
                          <Input
                            id={`display-name-${index}`}
                            value={metadata[index].displayName}
                            onChange={(e) => handleUpdateSingle(index, 'displayName', e.target.value)}
                            placeholder="Display name"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`alt-text-${index}`} className="text-xs">
                              Alt Text
                            </Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => copyFromDisplayName(index)}
                              className="h-6 text-xs"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy from Display Name
                            </Button>
                          </div>
                          <Input
                            id={`alt-text-${index}`}
                            value={metadata[index].altText}
                            onChange={(e) => handleUpdateSingle(index, 'altText', e.target.value)}
                            placeholder="Alt text for SEO"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`description-${index}`} className="text-xs">
                            Description (Optional)
                          </Label>
                          <Textarea
                            id={`description-${index}`}
                            value={metadata[index].description}
                            onChange={(e) => handleUpdateSingle(index, 'description', e.target.value)}
                            placeholder="Description for SEO"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
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
