-- Add description column to gallery_image_metadata for SEO
ALTER TABLE public.gallery_image_metadata
ADD COLUMN description text;