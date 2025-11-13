import { useState } from "react";
import { useGalleryImages } from "../hooks/useGalleryImages";
import { ImageUploadZone } from "./ImageUploadZone";
import { ImageGrid } from "./ImageGrid";
import { LoadingState } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminGalleryDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  
  const {
    images,
    categories,
    isLoading,
    uploadImage,
    deleteImage,
    isUploading,
    isDeleting
  } = useGalleryImages(selectedCategory);

  if (isLoading) {
    return <LoadingState message="Loading gallery..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gallery CDN</h1>
        <p className="text-muted-foreground">
          Upload images to Lovable Cloud Storage - free tier included
        </p>
      </div>

      <ImageUploadZone 
        onUpload={(file, metadata) => uploadImage({ file, ...metadata })} 
        isUploading={isUploading}
      />

      <div>
        <Tabs value={selectedCategory || 'all'} onValueChange={(v) => setSelectedCategory(v === 'all' ? undefined : v)}>
          <TabsList>
            <TabsTrigger value="all">All Images ({images.length})</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedCategory || 'all'} className="mt-6">
            <ImageGrid 
              images={images}
              onDelete={deleteImage}
              isDeleting={isDeleting}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
        <h3 className="font-semibold">Next Steps:</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Upload your gallery images here instead of src/assets/</li>
          <li>Copy image URLs and use them in your components</li>
          <li>This reduces build size and fixes the publish truncation issue</li>
          <li>Images load faster from CDN worldwide</li>
          <li>Free tier covers your current needs (~30-40MB)</li>
        </ul>
      </div>
    </div>
  );
}
