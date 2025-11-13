import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Trash2 } from 'lucide-react';

export default function TempGalleryTest() {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `test/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(filePath);

        setImages(prev => [...prev, publicUrl]);
        toast.success(`Uploaded ${file.name}`);
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
  };

  const handleDelete = async (url: string) => {
    try {
      // Extract path from URL
      const path = url.split('/gallery-images/')[1];
      
      const { error } = await supabase.storage
        .from('gallery-images')
        .remove([path]);

      if (error) throw error;

      setImages(prev => prev.filter(img => img !== url));
      toast.success('Image deleted');
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Temporary Gallery Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Testing if storage works without types - for publish verification
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block mb-2">
              <Button asChild disabled={uploading}>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </span>
              </Button>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((url) => (
                <div key={url} className="relative group">
                  <img 
                    src={url} 
                    alt="Uploaded" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
