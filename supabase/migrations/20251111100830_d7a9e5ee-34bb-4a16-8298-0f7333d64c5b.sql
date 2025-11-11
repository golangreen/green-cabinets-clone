-- Function to get roles expiring within a specified number of days
CREATE OR REPLACE FUNCTION public.get_roles_expiring_within_days(days_ahead integer DEFAULT 7)
RETURNS TABLE(
  user_id uuid,
  user_email text,
  role app_role,
  expires_at timestamp with time zone,
  days_until_expiry numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.user_id,
    au.email::text as user_email,
    ur.role,
    ur.expires_at,
    EXTRACT(EPOCH FROM (ur.expires_at - now())) / 86400 as days_until_expiry
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.expires_at IS NOT NULL
    AND ur.expires_at > now()
    AND ur.expires_at <= now() + (days_ahead || ' days')::interval
  ORDER BY ur.expires_at ASC;
END;
$$;

-- Function to bulk extend role expiration dates
CREATE OR REPLACE FUNCTION public.bulk_extend_role_expiration(
  role_extensions jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  extension_record jsonb;
  extended_count INTEGER := 0;
  failed_count INTEGER := 0;
  result jsonb;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to extend roles';
  END IF;

  -- Loop through each extension request
  FOR extension_record IN SELECT * FROM jsonb_array_elements(role_extensions)
  LOOP
    BEGIN
      -- Call extend_role_expiration for each user/role
      PERFORM public.extend_role_expiration(
        (extension_record->>'user_id')::uuid,
        (extension_record->>'role')::app_role,
        (extension_record->>'new_expiration')::timestamp with time zone
      );
      extended_count := extended_count + 1;
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'extended_count', extended_count,
    'failed_count', failed_count,
    'message', format('Extended %s role(s), %s failed', extended_count, failed_count)
  );
END;
$$;