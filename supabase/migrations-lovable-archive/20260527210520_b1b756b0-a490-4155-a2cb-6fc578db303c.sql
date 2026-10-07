
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
