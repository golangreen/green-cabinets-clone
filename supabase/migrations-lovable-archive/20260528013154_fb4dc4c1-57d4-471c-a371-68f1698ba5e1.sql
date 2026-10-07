
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
