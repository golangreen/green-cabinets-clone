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
