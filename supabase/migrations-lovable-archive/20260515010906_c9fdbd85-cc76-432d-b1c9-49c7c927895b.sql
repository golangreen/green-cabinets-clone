-- 1. Tighten performance_metrics INSERT: enforce user_id = auth.uid() OR null
DROP POLICY IF EXISTS "Authenticated users can insert performance metrics" ON public.performance_metrics;

CREATE POLICY "Authenticated users can insert own performance metrics"
ON public.performance_metrics
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 2. Restrict Realtime channel subscriptions for sensitive tables to admins only
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins only for security_events realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Admins only for webhook_events realtime" ON realtime.messages;

CREATE POLICY "Admins only for security_events realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() <> 'security_events' AND realtime.topic() <> 'webhook_events')
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
