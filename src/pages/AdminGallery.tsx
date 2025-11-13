import { useState, useCallback } from 'react';
import { AdminRoute } from '@/components/auth';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useGalleryUpload } from '@/hooks/useGalleryUpload';
import { cn } from '@/lib/utils';
import type { GalleryCategory } from '@/types/gallery';

interface ImagePreview {
  file: File;
  preview: string;
  category: GalleryCategory;
  displayName: string;
  altText: string;
  width: number;
  height: number;
}

export default function AdminGallery() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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
        
        setImages(prev => [...prev, {
          file,
          preview,
          category: 'kitchens',
          displayName: file.name.replace(/\.[^/.]+$/, ''),
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          width,
          height
        }]);
      } catch (error) {
        console.error('Error processing file:', error);
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

  const handleUpload = async () => {
    if (images.length === 0) return;

    await uploadImages(images);
    
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
                  <CardTitle>Images to Upload ({images.length})</CardTitle>
                  <CardDescription>Review and edit metadata before uploading</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {images.map((image, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <img
                            src={image.preview}
                            alt={image.displayName}
                            className="w-full h-full object-cover rounded"
                          />
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

                          <div className="text-sm text-muted-foreground md:col-span-2">
                            <ImageIcon className="inline w-4 h-4 mr-1" />
                            {image.width} × {image.height} px • {(image.file.size / 1024 / 1024).toFixed(2)} MB
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

                  <div className="flex justify-end gap-2 pt-4">
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
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </AdminRoute>
  );
}
