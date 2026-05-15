-- Fix alert_settings: service role read policy was on public role
DROP POLICY IF EXISTS "Service role can read alert settings" ON public.alert_settings;
CREATE POLICY "Service role can read alert settings"
ON public.alert_settings
FOR SELECT
TO service_role
USING (true);

-- Fix role_change_audit: service role insert policy was on public role
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.role_change_audit;
CREATE POLICY "Service role can insert audit logs"
ON public.role_change_audit
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix failed_login_attempts: admin view policy was on public role
DROP POLICY IF EXISTS "Admins can view all failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Admins can view all failed login attempts"
ON public.failed_login_attempts
FOR SELECT
TO authenticated
USING ((EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role)))));

-- Fix email_delivery_log: admin view policy was on public role
DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_delivery_log;
CREATE POLICY "Admins can view all email logs"
ON public.email_delivery_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix email_delivery_log: service role policy was on public role
DROP POLICY IF EXISTS "Service role can manage email logs" ON public.email_delivery_log;
CREATE POLICY "Service role can manage email logs"
ON public.email_delivery_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix has_role function to enforce role expiration
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;