-- Create email_settings table for storing sender configuration
CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL DEFAULT 'Green Cabinets',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view email settings
CREATE POLICY "Admins can view email settings"
ON public.email_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update email settings
CREATE POLICY "Admins can update email settings"
ON public.email_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert email settings
CREATE POLICY "Admins can insert email settings"
ON public.email_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.email_settings (sender_email, sender_name)
VALUES ('onboarding@resend.dev', 'Green Cabinets')
ON CONFLICT DO NOTHING;