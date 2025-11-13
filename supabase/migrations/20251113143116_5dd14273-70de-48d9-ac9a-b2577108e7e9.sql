-- Force types regeneration by adding a comment to the table
COMMENT ON TABLE public.gallery_image_metadata IS 'Stores metadata for images uploaded to gallery-images storage bucket';

-- Add helpful comments to key columns
COMMENT ON COLUMN public.gallery_image_metadata.storage_path IS 'Path to file in storage bucket';
COMMENT ON COLUMN public.gallery_image_metadata.original_filename IS 'Original filename when uploaded';