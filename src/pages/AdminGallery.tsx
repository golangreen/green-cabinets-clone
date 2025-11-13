import { useState, useCallback } from 'react';
import { AdminRoute } from '@/components/auth';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Edit, Images, AlertTriangle } from 'lucide-react';
import { useGalleryUpload, type CompressionQuality } from '@/hooks/useGalleryUpload';
import { ImageEditor } from '@/components/admin/ImageEditor';
import { BatchImageEditor } from '@/components/admin/BatchImageEditor';
import { BulkMetadataEditor } from '@/components/admin/BulkMetadataEditor';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { GalleryCategory } from '@/types/gallery';
import { analyzeImageQuality, getQualityBadgeVariant, getQualityStatusText, type ImageQualityResult } from '@/utils/imageQuality';
import { toast } from 'sonner';

interface ImagePreview {
  file: File;
  preview: string;
  category: GalleryCategory;
  displayName: string;
  altText: string;
  description?: string;
  width: number;
  height: number;
  quality?: ImageQualityResult;
}

export default function AdminGallery() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [batchEditing, setBatchEditing] = useState(false);
  const [metadataEditing, setMetadataEditing] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState<CompressionQuality>('medium');
  const { uploading, progress, extractImageMetadata, uploadImages } = useGalleryUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    for (const file of imageFiles) {
      try {
        const { width, height } = await extractImageMetadata(file);
        const preview = URL.createObjectURL(file);
        
        // Analyze image quality
        const quality = await analyzeImageQuality(file);
        
        // Show warnings if quality issues detected
        if (quality.warnings.length > 0) {
          toast.warning(`Quality issues detected in ${file.name}`, {
            description: quality.warnings.join('. ')
          });
        }
        
        setImages(prev => [...prev, {
          file,
          preview,
          category: 'kitchens',
          displayName: file.name.replace(/\.[^/.]+$/, ''),
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          width,
          height,
          quality
        }]);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateImage = (index: number, updates: Partial<ImagePreview>) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    ));
  };

  const handleEditSave = async (index: number, editedFile: File) => {
    try {
      const { width, height } = await extractImageMetadata(editedFile);
      const preview = URL.createObjectURL(editedFile);
      
      setImages(prev => prev.map((img, i) => {
        if (i === index) {
          URL.revokeObjectURL(img.preview);
          return {
            ...img,
            file: editedFile,
            preview,
            width,
            height
          };
        }
        return img;
      }));
    } catch (error) {
      console.error('Error updating edited image:', error);
    }
  };

  const handleBatchEditSave = async (editedFiles: File[]) => {
    const selectedArray = Array.from(selectedIndices).sort((a, b) => a - b);
    
    try {
      const updatedImages = await Promise.all(
        editedFiles.map(async (file) => {
          const { width, height } = await extractImageMetadata(file);
          const preview = URL.createObjectURL(file);
          return { file, preview, width, height };
        })
      );

      setImages(prev => prev.map((img, i) => {
        const selectedIdx = selectedArray.indexOf(i);
        if (selectedIdx !== -1 && updatedImages[selectedIdx]) {
          URL.revokeObjectURL(img.preview);
          return {
            ...img,
            file: updatedImages[selectedIdx].file,
            preview: updatedImages[selectedIdx].preview,
            width: updatedImages[selectedIdx].width,
            height: updatedImages[selectedIdx].height
          };
        }
        return img;
      }));

      setSelectedIndices(new Set());
    } catch (error) {
      console.error('Error updating batch edited images:', error);
    }
  };

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIndices(new Set(images.map((_, i) => i)));
  };

  const clearSelection = () => {
    setSelectedIndices(new Set());
  };

  const handleMetadataSave = (metadata: Array<{ displayName: string; altText: string; description: string }>) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      displayName: metadata[i].displayName,
      altText: metadata[i].altText,
      description: metadata[i].description
    })));
  };

  const handleUpload = async () => {
    if (images.length === 0) return;

    const imagesWithCompression = images.map(img => ({
      ...img,
      compressionQuality
    }));

    await uploadImages(imagesWithCompression);
    
    // Clear successfully uploaded images
    setImages(prev => {
      prev.forEach(img => URL.revokeObjectURL(img.preview));
      return [];
    });
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Gallery Management</h1>
            <p className="text-muted-foreground">Upload and manage gallery images with automatic metadata extraction</p>
          </div>

          <div className="grid gap-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
                <CardDescription>Drag and drop images or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop images here</p>
                  <p className="text-sm text-muted-foreground mb-4">or</p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Image Preview and Metadata */}
            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Images to Upload ({images.length})</CardTitle>
                      <CardDescription>Review and edit metadata before uploading</CardDescription>
                    </div>
                    {images.length > 1 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectedIndices.size === images.length ? clearSelection : selectAll}
                        >
                          {selectedIndices.size === images.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        {selectedIndices.size > 1 && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setBatchEditing(true)}
                            >
                              <Images className="w-4 h-4 mr-2" />
                              Batch Edit ({selectedIndices.size})
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setMetadataEditing(true)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Metadata ({selectedIndices.size})
                            </Button>
                          </>
                        )}
                        {images.length > 0 && selectedIndices.size === 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setMetadataEditing(true)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit All Metadata
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {images.map((image, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        {images.length > 1 && (
                          <div className="flex items-start pt-2">
                            <Checkbox
                              checked={selectedIndices.has(index)}
                              onCheckedChange={() => toggleSelection(index)}
                            />
                          </div>
                        )}
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <img
                            src={image.preview}
                            alt={image.displayName}
                            className="w-full h-full object-cover rounded"
                          />
                          {image.quality && (
                            <Badge 
                              variant={getQualityBadgeVariant(image.quality)}
                              className="absolute bottom-1 left-1 text-xs"
                            >
                              {getQualityStatusText(image.quality)}
                            </Badge>
                          )}
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute -top-2 -left-2 h-6 w-6"
                            onClick={() => setEditingIndex(index)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex-1 grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${index}`}>Display Name</Label>
                            <Input
                              id={`name-${index}`}
                              value={image.displayName}
                              onChange={(e) => updateImage(index, { displayName: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`category-${index}`}>Category</Label>
                            <Select
                              value={image.category}
                              onValueChange={(value) => updateImage(index, { category: value as GalleryCategory })}
                            >
                              <SelectTrigger id={`category-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kitchens">Kitchens</SelectItem>
                                <SelectItem value="vanities">Vanities</SelectItem>
                                <SelectItem value="closets">Closets</SelectItem>
                                <SelectItem value="design-to-reality">Design to Reality</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`alt-${index}`}>Alt Text (SEO)</Label>
                            <Input
                              id={`alt-${index}`}
                              value={image.altText}
                              onChange={(e) => updateImage(index, { altText: e.target.value })}
                              placeholder="Describe the image for accessibility"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <div className="text-sm text-muted-foreground flex items-center">
                              <ImageIcon className="inline w-4 h-4 mr-1" />
                              {image.width} × {image.height} px • {(image.file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            {image.quality && image.quality.warnings.length > 0 && (
                              <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 space-y-1">
                                  {image.quality.warnings.map((warning, i) => (
                                    <p key={i} className="text-xs text-amber-800 dark:text-amber-200">
                                      {warning}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress indicator */}
                      {progress[index] && (
                        <div className="mt-4 flex items-center gap-2">
                          {progress[index].status === 'uploading' && (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Uploading...</span>
                            </>
                          )}
                          {progress[index].status === 'success' && (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Uploaded successfully</span>
                            </>
                          )}
                          {progress[index].status === 'error' && (
                            <>
                              <AlertCircle className="w-4 h-4 text-destructive" />
                              <span className="text-sm text-destructive">{progress[index].error}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="compression-quality" className="text-sm font-medium">
                        Compression Quality:
                      </Label>
                      <Select
                        value={compressionQuality}
                        onValueChange={(value) => setCompressionQuality(value as CompressionQuality)}
                        disabled={uploading}
                      >
                        <SelectTrigger id="compression-quality" className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Original)</SelectItem>
                          <SelectItem value="high">High Quality (90%)</SelectItem>
                          <SelectItem value="medium">Medium Quality (80%)</SelectItem>
                          <SelectItem value="low">Low Quality (60%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        {compressionQuality === 'none' && 'No compression applied'}
                        {compressionQuality === 'high' && 'Minimal compression, best quality'}
                        {compressionQuality === 'medium' && 'Balanced quality and file size'}
                        {compressionQuality === 'low' && 'Maximum compression, smaller files'}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          images.forEach(img => URL.revokeObjectURL(img.preview));
                          setImages([]);
                        }}
                        disabled={uploading}
                      >
                        Clear All
                      </Button>
                      <Button
                      onClick={handleUpload}
                      disabled={uploading || images.length === 0}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload {images.length} Image{images.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />

        {editingIndex !== null && (
          <ImageEditor
            open={editingIndex !== null}
            onOpenChange={(open) => !open && setEditingIndex(null)}
            imageUrl={images[editingIndex]?.preview || ''}
            originalFileName={images[editingIndex]?.file.name || ''}
            onSave={(editedFile) => handleEditSave(editingIndex, editedFile)}
          />
        )}

        {batchEditing && (
          <BatchImageEditor
            open={batchEditing}
            onOpenChange={setBatchEditing}
            images={Array.from(selectedIndices).map(i => images[i])}
            onSave={handleBatchEditSave}
          />
        )}

        {metadataEditing && (
          <BulkMetadataEditor
            open={metadataEditing}
            onOpenChange={setMetadataEditing}
            images={selectedIndices.size > 0 
              ? Array.from(selectedIndices).map(i => images[i])
              : images
            }
            onSave={handleMetadataSave}
          />
        )}
      </div>
    </AdminRoute>
  );
}
