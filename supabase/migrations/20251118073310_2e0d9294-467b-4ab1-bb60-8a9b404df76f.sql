-- Fix performance_metrics RLS policy to allow anonymous users to insert metrics
DROP POLICY IF EXISTS "Users can insert performance metrics" ON public.performance_metrics;

CREATE POLICY "Anyone can insert performance metrics"
ON public.performance_metrics
FOR INSERT
TO public
WITH CHECK (true);

-- Keep existing policies for SELECT
-- Admins can view all performance metrics (already exists)
-- Service role can manage performance metrics (already exists)