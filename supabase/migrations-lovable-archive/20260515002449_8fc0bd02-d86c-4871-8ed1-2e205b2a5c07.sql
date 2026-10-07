
-- Fix config_change_audit: scope service role policy properly
DROP POLICY IF EXISTS "Service role can manage config audit logs" ON public.config_change_audit;
CREATE POLICY "Service role can manage config audit logs"
ON public.config_change_audit FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- Fix alert_settings: scope admin policies to authenticated
DROP POLICY IF EXISTS "Admins can update alert settings" ON public.alert_settings;
DROP POLICY IF EXISTS "Admins can view alert settings" ON public.alert_settings;
CREATE POLICY "Admins can update alert settings"
ON public.alert_settings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view alert settings"
ON public.alert_settings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix role_change_audit
DROP POLICY IF EXISTS "Admins can view role audit logs" ON public.role_change_audit;
CREATE POLICY "Admins can view role audit logs"
ON public.role_change_audit FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix notification_settings: scope to authenticated
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notification_settings;
CREATE POLICY "Users can insert own notification settings"
ON public.notification_settings FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings"
ON public.notification_settings FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own notification settings"
ON public.notification_settings FOR SELECT
TO authenticated USING (auth.uid() = user_id);

-- Fix gallery_image_metadata admin policy
DROP POLICY IF EXISTS "Admins can manage image metadata" ON public.gallery_image_metadata;
CREATE POLICY "Admins can manage image metadata"
ON public.gallery_image_metadata FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix performance_metrics: require authentication for inserts
DROP POLICY IF EXISTS "Anyone can insert performance metrics" ON public.performance_metrics;
CREATE POLICY "Authenticated users can insert performance metrics"
ON public.performance_metrics FOR INSERT
TO authenticated WITH CHECK (true);
