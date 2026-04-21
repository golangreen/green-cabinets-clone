-- Drop the overly permissive policy that applies to public role
DROP POLICY IF EXISTS "Service role can manage failed login attempts" ON public.failed_login_attempts;

-- Recreate it scoped strictly to the service_role
CREATE POLICY "Service role can manage failed login attempts"
ON public.failed_login_attempts
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);