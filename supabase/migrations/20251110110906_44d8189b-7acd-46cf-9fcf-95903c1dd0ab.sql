-- Create security events table for monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('rate_limit_exceeded', 'validation_failed', 'suspicious_activity', 'authentication_failed')),
  function_name TEXT NOT NULL,
  client_ip TEXT NOT NULL,
  details JSONB,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_ip ON public.security_events(client_ip);
CREATE INDEX idx_security_events_function ON public.security_events(function_name);

-- Create alert_history table to track sent alerts
CREATE TABLE IF NOT EXISTS public.alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  details JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables (admin-only access)
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (no public access)
CREATE POLICY "Service role can manage security events"
  ON public.security_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage alert history"
  ON public.alert_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to get security summary
CREATE OR REPLACE FUNCTION public.get_security_summary(time_window_minutes INTEGER DEFAULT 60)
RETURNS TABLE (
  event_type TEXT,
  event_count BIGINT,
  unique_ips BIGINT,
  severity TEXT
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT client_ip) as unique_ips,
    severity
  FROM public.security_events
  WHERE created_at > now() - (time_window_minutes || ' minutes')::interval
  GROUP BY event_type, severity
  ORDER BY event_count DESC;
$$;

-- Create function to check for suspicious IPs (multiple violations)
CREATE OR REPLACE FUNCTION public.get_suspicious_ips(time_window_minutes INTEGER DEFAULT 60, threshold INTEGER DEFAULT 5)
RETURNS TABLE (
  client_ip TEXT,
  violation_count BIGINT,
  functions_affected TEXT[],
  first_violation TIMESTAMPTZ,
  last_violation TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    client_ip,
    COUNT(*) as violation_count,
    ARRAY_AGG(DISTINCT function_name) as functions_affected,
    MIN(created_at) as first_violation,
    MAX(created_at) as last_violation
  FROM public.security_events
  WHERE created_at > now() - (time_window_minutes || ' minutes')::interval
    AND event_type IN ('rate_limit_exceeded', 'validation_failed', 'suspicious_activity')
  GROUP BY client_ip
  HAVING COUNT(*) >= threshold
  ORDER BY violation_count DESC;
$$;