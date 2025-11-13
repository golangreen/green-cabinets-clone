import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GalleryCategory } from "@/types/gallery";

export interface GalleryImageRecord {
  id: string;
  storage_path: string;
  original_filename: string;
  display_name: string | null;
  category: string | null;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: GalleryCategory;
  width?: number;
  height?: number;
  displayName?: string;
}

const getPublicUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('gallery-images')
    .getPublicUrl(storagePath);
  return data.publicUrl;
};

const mapRecordToImage = (record: GalleryImageRecord): GalleryImage => ({
  id: record.id,
  url: getPublicUrl(record.storage_path),
  alt: record.alt_text || record.display_name || record.original_filename,
  category: (record.category as GalleryCategory) || 'all',
  width: record.width || undefined,
  height: record.height || undefined,
  displayName: record.display_name || undefined,
});

export const useGalleryImages = (category?: GalleryCategory) => {
  return useQuery({
    queryKey: ['gallery-images', category],
    queryFn: async () => {
      const supabaseAny = supabase as any;
      let query = supabaseAny
        .from('gallery_image_metadata')
        .select('*')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return [];
      
      return (data as GalleryImageRecord[]).map(mapRecordToImage);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useHeroImages = () => {
  return useQuery({
    queryKey: ['hero-images'],
    queryFn: async () => {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from('gallery_image_metadata')
        .select('*')
        .in('category', ['kitchens', 'vanities'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!data) return [];
      
      return (data as GalleryImageRecord[]).map(mapRecordToImage);
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGalleryImagesByCategory = () => {
  const { data: allImages = [], isLoading } = useGalleryImages('all');

  const getByCategory = (category: GalleryCategory): GalleryImage[] => {
    if (category === 'all') return allImages;
    return allImages.filter(img => img.category === category);
  };

  const categories = {
    kitchens: getByCategory('kitchens'),
    vanities: getByCategory('vanities'),
    closets: getByCategory('closets'),
    'design-to-reality': getByCategory('design-to-reality'),
  };

  return { categories, allImages, isLoading };
};
