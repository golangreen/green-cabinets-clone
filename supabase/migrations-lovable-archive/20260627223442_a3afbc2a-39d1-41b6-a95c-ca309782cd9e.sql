
DROP POLICY IF EXISTS "Admins can view all performance metrics" ON public.performance_metrics;
CREATE POLICY "Admins can view all performance metrics"
ON public.performance_metrics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Explicitly deny direct INSERTs from anon/authenticated; only service_role may insert orders
CREATE POLICY "Block client-side order inserts"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (false);
