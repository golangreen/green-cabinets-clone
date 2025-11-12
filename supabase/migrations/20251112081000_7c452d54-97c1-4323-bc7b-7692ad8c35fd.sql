-- Create performance_metrics table for tracking Web Vitals and custom performance metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  url TEXT NOT NULL,
  user_agent TEXT,
  connection_type TEXT,
  device_memory NUMERIC,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url ON public.performance_metrics(url);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can view all metrics
CREATE POLICY "Admins can view all performance metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Users can insert their own metrics (for tracking)
CREATE POLICY "Users can insert performance metrics"
ON public.performance_metrics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Service role can insert anonymous metrics
CREATE POLICY "Service role can manage performance metrics"
ON public.performance_metrics
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to cleanup old performance metrics (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_metrics()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.performance_metrics
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON TABLE public.performance_metrics IS 'Stores Web Vitals and custom performance metrics for monitoring application performance';
COMMENT ON FUNCTION public.cleanup_old_performance_metrics IS 'Deletes performance metrics older than 30 days';