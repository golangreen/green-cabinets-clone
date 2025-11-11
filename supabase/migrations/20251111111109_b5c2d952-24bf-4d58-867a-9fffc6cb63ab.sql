-- Create notification_settings table for admin notification preferences
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  webhook_security_enabled BOOLEAN NOT NULL DEFAULT true,
  rate_limit_enabled BOOLEAN NOT NULL DEFAULT true,
  webhook_retry_enabled BOOLEAN NOT NULL DEFAULT true,
  webhook_duplicate_enabled BOOLEAN NOT NULL DEFAULT false,
  severity_threshold TEXT NOT NULL DEFAULT 'medium' CHECK (severity_threshold IN ('low', 'medium', 'high', 'critical')),
  retry_threshold INTEGER NOT NULL DEFAULT 3,
  sound_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notification settings
CREATE POLICY "Users can view own notification settings"
ON public.notification_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own notification settings
CREATE POLICY "Users can update own notification settings"
ON public.notification_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own notification settings
CREATE POLICY "Users can insert own notification settings"
ON public.notification_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to get or create default notification settings
CREATE OR REPLACE FUNCTION public.get_or_create_notification_settings(p_user_id UUID)
RETURNS SETOF public.notification_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to get existing settings
  RETURN QUERY
  SELECT * FROM public.notification_settings
  WHERE user_id = p_user_id;
  
  -- If no settings exist, create default ones
  IF NOT FOUND THEN
    INSERT INTO public.notification_settings (user_id)
    VALUES (p_user_id);
    
    RETURN QUERY
    SELECT * FROM public.notification_settings
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Create index for faster lookups
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);