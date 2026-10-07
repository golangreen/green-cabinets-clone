-- Green Cabinets backend, baseline for the self-hosted Supabase project
-- (moved off Lovable Cloud 2026-10-07). Lovable's own migration history was
-- incomplete (it referenced roles, functions and tables it never created), so
-- the old files live in supabase/migrations-lovable-archive/ for reference and
-- this file recreates only what the site and edge functions actually use.

-- ── Roles ──
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_temporary boolean DEFAULT false,
  reminder_sent boolean DEFAULT false,
  reminder_3day_sent boolean DEFAULT false,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ── Shared trigger ──
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── Page-speed metrics (signed-in visitors only) ──
CREATE TABLE public.performance_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value double precision NOT NULL,
  url text NOT NULL,
  user_id uuid,
  user_agent text,
  connection_type text,
  device_memory double precision,
  metadata jsonb,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.performance_metrics TO authenticated;
GRANT SELECT ON public.performance_metrics TO authenticated;
GRANT ALL ON public.performance_metrics TO service_role;

-- ── Storage buckets ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;


-- ── from 20260508172348 ──
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

-- ── from 20260515010906 ──
-- 1. Tighten performance_metrics INSERT: enforce user_id = auth.uid() OR null
DROP POLICY IF EXISTS "Authenticated users can insert performance metrics" ON public.performance_metrics;

CREATE POLICY "Authenticated users can insert own performance metrics"
ON public.performance_metrics
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());


-- ── from 20260515054018 ──
CREATE TABLE public.seo_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  strategy text NOT NULL CHECK (strategy IN ('mobile','desktop')),
  performance_score numeric,
  accessibility_score numeric,
  best_practices_score numeric,
  seo_score numeric,
  lcp_ms numeric,
  cls numeric,
  inp_ms numeric,
  fcp_ms numeric,
  tbt_ms numeric,
  failing_audits jsonb,
  raw jsonb,
  triggered_by uuid,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_scans_created_at ON public.seo_scans (created_at DESC);
CREATE INDEX idx_seo_scans_url_strategy ON public.seo_scans (url, strategy, created_at DESC);

ALTER TABLE public.seo_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view seo scans"
ON public.seo_scans FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage seo scans"
ON public.seo_scans FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- ── from 20260527210520 ──

-- =====================================================
-- profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- =====================================================
-- saved_quotes
-- =====================================================
CREATE TABLE public.saved_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Quote',
  location TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT 'Untitled',
  analysis JSONB,
  selected_cabinets JSONB NOT NULL DEFAULT '[]'::jsonb,
  material_tier TEXT NOT NULL DEFAULT 'thermofoil',
  custom_line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery JSONB NOT NULL DEFAULT '{"option":"none","flatRate":250,"perItemRate":15}'::jsonb,
  installation JSONB NOT NULL DEFAULT '{"enabled":false,"ratePerCabinet":85,"complexityMultiplier":1.0}'::jsonb,
  discount JSONB NOT NULL DEFAULT '{"enabled":false,"type":"percentage","value":0,"label":""}'::jsonb,
  hardware JSONB NOT NULL DEFAULT '{"type":"none","applyAll":true,"perCabinet":{}}'::jsonb,
  add_ons JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_name TEXT,
  customer_email TEXT,
  project_notes TEXT,
  grand_total NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_quotes TO authenticated;
GRANT ALL ON public.saved_quotes TO service_role;

ALTER TABLE public.saved_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own quotes" ON public.saved_quotes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_quotes_user_id ON public.saved_quotes(user_id);

-- =====================================================
-- orders
-- =====================================================
CREATE TABLE public.orders (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number           TEXT        NOT NULL UNIQUE,
  customer_name          TEXT        NOT NULL,
  customer_phone         TEXT        NOT NULL,
  customer_email         TEXT        NOT NULL,
  delivery_address       TEXT        NOT NULL,
  preferred_install_date TEXT,
  notes                  TEXT,
  collection             TEXT        NOT NULL DEFAULT 'luxor',
  grand_total            NUMERIC     NOT NULL,
  quote_snapshot         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  status                 TEXT        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','confirmed','in-progress','delivered','cancelled')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an order"
  ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE SEQUENCE public.order_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'GC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('public.order_seq')::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION public.generate_order_number();

-- =====================================================
-- email-assets bucket
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Email assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-assets');


-- ── from 20260527221530 ──
ALTER TABLE public.saved_quotes ADD COLUMN IF NOT EXISTS selected_finish jsonb;

-- ── from 20260528013154 ──

CREATE TABLE public.compatibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('brand', 'tier')),
  key text NOT NULL,
  allowed_door_styles text[] NOT NULL DEFAULT '{}',
  notes text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, key)
);

GRANT SELECT ON public.compatibility_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compatibility_rules TO authenticated;
GRANT ALL ON public.compatibility_rules TO service_role;

ALTER TABLE public.compatibility_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view compatibility rules"
  ON public.compatibility_rules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert compatibility rules"
  ON public.compatibility_rules FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update compatibility rules"
  ON public.compatibility_rules FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete compatibility rules"
  ON public.compatibility_rules FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_compatibility_rules_updated_at
  BEFORE UPDATE ON public.compatibility_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ── from 20260528013950 ──
CREATE TABLE public.estimator_validation_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  door_style text NOT NULL,
  finish_id text NOT NULL,
  finish_brand text,
  material_tier text,
  reason text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_evf_created_at ON public.estimator_validation_failures (created_at DESC);
CREATE INDEX idx_evf_combo ON public.estimator_validation_failures (door_style, finish_id);

GRANT INSERT ON public.estimator_validation_failures TO anon, authenticated;
GRANT ALL ON public.estimator_validation_failures TO service_role;

ALTER TABLE public.estimator_validation_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a validation failure"
  ON public.estimator_validation_failures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read validation failures"
  ON public.estimator_validation_failures
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));


-- ── from 20260528014923 ──
ALTER TABLE public.compatibility_rules
  DROP CONSTRAINT IF EXISTS compatibility_rules_scope_check;

ALTER TABLE public.compatibility_rules
  ADD CONSTRAINT compatibility_rules_scope_check
  CHECK (scope IN ('brand', 'tier', 'finish'));


-- ── from 20260625201503 ──

DROP POLICY IF EXISTS "Anyone can submit an order" ON public.orders;

DROP POLICY IF EXISTS "Block anonymous performance metric inserts" ON public.performance_metrics;
CREATE POLICY "Block anonymous performance metric inserts"
  ON public.performance_metrics
  AS RESTRICTIVE
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');


-- ── from 20260627170139 ──

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


-- ── from 20260627223442 ──

DROP POLICY IF EXISTS "Admins can view all performance metrics" ON public.performance_metrics;
CREATE POLICY "Admins can view all performance metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Explicitly deny direct INSERTs from anon/authenticated; only service_role may insert orders
CREATE POLICY "Block client-side order inserts"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (false);


-- ── from 20260723155436 ──
CREATE TABLE public.blog_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  content_image_urls TEXT[] NOT NULL DEFAULT '{}',
  canonical_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_articles TO anon, authenticated;
GRANT ALL ON public.blog_articles TO service_role;

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog articles are public"
  ON public.blog_articles FOR SELECT
  USING (true);

CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blog_articles_created_at ON public.blog_articles (created_at DESC);
