-- Function to extend role expiration
CREATE OR REPLACE FUNCTION public.extend_role_expiration(
  target_user_id uuid,
  target_role app_role,
  new_expiration_date timestamp with time zone
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_email text;
  v_current_expiration timestamp with time zone;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  -- Get target user email and current expiration
  SELECT email INTO v_target_email 
  FROM auth.users 
  WHERE id = target_user_id;

  SELECT expires_at INTO v_current_expiration
  FROM public.user_roles
  WHERE user_id = target_user_id AND role = target_role;

  IF v_current_expiration IS NULL THEN
    RAISE EXCEPTION 'Role does not have an expiration date'
      USING HINT = 'Only temporary roles can be extended';
  END IF;

  -- Update expiration date and reset reminder
  UPDATE public.user_roles
  SET expires_at = new_expiration_date,
      reminder_sent = false
  WHERE user_id = target_user_id 
    AND role = target_role;

  -- Log the extension
  PERFORM public.log_role_change(
    target_user_id,
    v_target_email,
    'extended',
    target_role,
    jsonb_build_object(
      'method', 'manual_extension',
      'old_expiration', v_current_expiration,
      'new_expiration', new_expiration_date
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', target_role,
    'old_expiration', v_current_expiration,
    'new_expiration', new_expiration_date,
    'message', 'Role expiration extended successfully'
  );
END;
$$;

-- Drop and recreate get_all_users_with_roles with role_details
DROP FUNCTION IF EXISTS public.get_all_users_with_roles();

CREATE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamp with time zone,
  roles app_role[],
  role_details jsonb[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to view users';
  END IF;

  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email::text,
    au.created_at,
    COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') as roles,
    COALESCE(
      array_agg(
        jsonb_build_object(
          'role', ur.role,
          'is_temporary', ur.is_temporary,
          'expires_at', ur.expires_at,
          'reminder_sent', ur.reminder_sent
        )
      ) FILTER (WHERE ur.role IS NOT NULL),
      '{}'
    ) as role_details
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  GROUP BY au.id, au.email, au.created_at
  ORDER BY au.created_at DESC;
END;
$$;