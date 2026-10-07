
-- Restrict listing on public storage buckets. Public file URLs via
-- /storage/v1/object/public/<bucket>/<path> continue to work because that
-- endpoint bypasses RLS for public buckets. The previous broad SELECT
-- policies also allowed anonymous LIST/enumeration of every file, which is
-- what the scanner flagged.

DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Email assets are publicly accessible" ON storage.objects;

-- Admin-only listing/metadata access for gallery-images
CREATE POLICY "Admins can list gallery images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'gallery-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Admin-only listing/metadata access for email-assets
CREATE POLICY "Admins can list email assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'email-assets'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
