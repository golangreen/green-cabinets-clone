
DROP POLICY IF EXISTS "Anyone can submit an order" ON public.orders;

DROP POLICY IF EXISTS "Block anonymous performance metric inserts" ON public.performance_metrics;
CREATE POLICY "Block anonymous performance metric inserts"
  ON public.performance_metrics
  AS RESTRICTIVE
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
