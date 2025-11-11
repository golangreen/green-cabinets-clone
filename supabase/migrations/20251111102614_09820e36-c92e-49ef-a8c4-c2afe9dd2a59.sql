-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_delivery_log;
DROP POLICY IF EXISTS "Service role can manage email logs" ON public.email_delivery_log;

-- Create table to track email delivery status
CREATE TABLE IF NOT EXISTS public.email_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id text NOT NULL,
  recipient_email text NOT NULL,
  email_type text NOT NULL, -- '3day', '1day', 'expired'
  subject text,
  status text NOT NULL, -- 'sent', 'delivered', 'bounced', 'failed', 'complained'
  user_id uuid,
  role app_role,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_delivery_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all email logs"
  ON public.email_delivery_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage email logs"
  ON public.email_delivery_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_recipient ON public.email_delivery_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_status ON public.email_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_created_at ON public.email_delivery_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_email_id ON public.email_delivery_log(email_id);