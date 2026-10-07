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