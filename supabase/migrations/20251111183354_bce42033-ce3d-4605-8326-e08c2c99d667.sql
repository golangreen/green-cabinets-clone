-- Create table for configuration change audit log
CREATE TABLE IF NOT EXISTS public.config_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  config_key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  change_type TEXT NOT NULL, -- 'test', 'preset_applied', 'import', 'manual'
  preset_name TEXT, -- If a preset was applied
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_config_change_audit_user_id ON public.config_change_audit(user_id);
CREATE INDEX idx_config_change_audit_created_at ON public.config_change_audit(created_at DESC);
CREATE INDEX idx_config_change_audit_config_key ON public.config_change_audit(config_key);

-- Enable RLS
ALTER TABLE public.config_change_audit ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view config audit logs"
  ON public.config_change_audit
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can insert their own audit logs
CREATE POLICY "Users can insert own config changes"
  ON public.config_change_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage audit logs
CREATE POLICY "Service role can manage config audit logs"
  ON public.config_change_audit
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.config_change_audit IS 'Audit log for configuration changes made through admin panel';