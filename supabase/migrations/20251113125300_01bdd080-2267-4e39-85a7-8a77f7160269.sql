-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- RLS Policies for gallery-images bucket

-- Allow public read access to all images
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery-images' 
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update images
CREATE POLICY "Admins can update gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery-images'
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery-images'
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create a table to track image metadata
CREATE TABLE IF NOT EXISTS public.gallery_image_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  display_name TEXT,
  category TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on metadata table
ALTER TABLE public.gallery_image_metadata ENABLE ROW LEVEL SECURITY;

-- Public can read image metadata
CREATE POLICY "Public can view image metadata"
ON public.gallery_image_metadata FOR SELECT
USING (true);

-- Admins can manage image metadata
CREATE POLICY "Admins can manage image metadata"
ON public.gallery_image_metadata FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_gallery_image_metadata_updated_at
BEFORE UPDATE ON public.gallery_image_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();