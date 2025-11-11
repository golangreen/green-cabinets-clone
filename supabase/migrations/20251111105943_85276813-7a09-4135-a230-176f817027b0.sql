-- Create alert settings table
CREATE TABLE IF NOT EXISTS public.alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default webhook retry alert settings
INSERT INTO public.alert_settings (setting_key, setting_value, description)
VALUES (
  'webhook_retry_alert',
  '{"retry_threshold": 3, "time_window_minutes": 10, "enabled": true}'::jsonb,
  'Webhook retry alert thresholds - triggers alert when retry_threshold is exceeded within time_window_minutes'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view settings
CREATE POLICY "Admins can view alert settings"
ON public.alert_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update settings
CREATE POLICY "Admins can update alert settings"
ON public.alert_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can read settings
CREATE POLICY "Service role can read alert settings"
ON public.alert_settings
FOR SELECT
USING (true);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_alert_settings_key ON public.alert_settings(setting_key);