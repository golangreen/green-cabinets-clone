CREATE TABLE public.neighborhood_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood_slug TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  address_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  ai_suggested BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_neighborhood_gallery_slug ON public.neighborhood_gallery (neighborhood_slug, is_published, sort_order);

ALTER TABLE public.neighborhood_gallery ENABLE ROW LEVEL SECURITY;

-- Public can read only published rows; address_note column is filtered by view in app code (we never select it for public).
CREATE POLICY "Public can view published gallery items"
ON public.neighborhood_gallery
FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Admins can view all gallery items"
ON public.neighborhood_gallery
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert gallery items"
ON public.neighborhood_gallery
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery items"
ON public.neighborhood_gallery
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery items"
ON public.neighborhood_gallery
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_neighborhood_gallery_updated_at
BEFORE UPDATE ON public.neighborhood_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for gallery-images bucket: admins can upload/manage neighborhoods/* paths
CREATE POLICY "Admins can upload neighborhood gallery images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery-images'
  AND (storage.foldername(name))[1] = 'neighborhoods'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update neighborhood gallery images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery-images'
  AND (storage.foldername(name))[1] = 'neighborhoods'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete neighborhood gallery images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery-images'
  AND (storage.foldername(name))[1] = 'neighborhoods'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);