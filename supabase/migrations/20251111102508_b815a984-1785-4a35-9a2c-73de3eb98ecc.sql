-- Create table to track email delivery status
CREATE TABLE IF NOT EXISTS public.email_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id text NOT NULL,
  recipient_email text NOT NULL,
  email_type text NOT NULL, -- '3day', '1day', 'expired'
  subject text,
  status text NOT NULL, -- 'sent', 'delivered', 'bounced', 'failed', 'complained'
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create index for faster queries
CREATE INDEX idx_email_delivery_log_recipient ON public.email_delivery_log(recipient_email);
CREATE INDEX idx_email_delivery_log_status ON public.email_delivery_log(status);
CREATE INDEX idx_email_delivery_log_created_at ON public.email_delivery_log(created_at DESC);
CREATE INDEX idx_email_delivery_log_email_id ON public.email_delivery_log(email_id);

-- Create function to get email delivery stats
CREATE OR REPLACE FUNCTION public.get_email_delivery_stats(days_back integer DEFAULT 7)
RETURNS TABLE(
  total_sent bigint,
  total_delivered bigint,
  total_bounced bigint,
  total_failed bigint,
  total_complained bigint,
  delivery_rate numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE status = 'sent') as total_sent,
    COUNT(*) FILTER (WHERE status = 'delivered') as total_delivered,
    COUNT(*) FILTER (WHERE status = 'bounced') as total_bounced,
    COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
    COUNT(*) FILTER (WHERE status = 'complained') as total_complained,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'delivered')::numeric / 
       NULLIF(COUNT(*) FILTER (WHERE status IN ('sent', 'delivered'))::numeric, 0)) * 100, 
      2
    ) as delivery_rate
  FROM public.email_delivery_log
  WHERE created_at > now() - (days_back || ' days')::interval;
$$;