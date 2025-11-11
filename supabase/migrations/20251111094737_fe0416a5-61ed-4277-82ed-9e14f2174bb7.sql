-- Function to get all users with their roles (admin only)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamptz,
  roles app_role[]
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
    COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') as roles
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  GROUP BY au.id, au.email, au.created_at
  ORDER BY au.created_at DESC;
END;
$$;

-- Function to add a role to a user (admin only)
CREATE OR REPLACE FUNCTION public.add_user_role(
  target_user_id uuid,
  target_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  -- Insert role (will be ignored if already exists due to unique constraint)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, target_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', target_role,
    'message', 'Role assigned successfully'
  );
END;
$$;

-- Function to remove a role from a user (admin only)
CREATE OR REPLACE FUNCTION public.remove_user_role(
  target_user_id uuid,
  target_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  -- Prevent removing the last admin
  IF target_role = 'admin'::app_role THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin'::app_role) <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin'
        USING HINT = 'At least one admin must remain in the system';
    END IF;
  END IF;

  -- Delete the role
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = target_role;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', target_role,
    'message', 'Role removed successfully'
  );
END;
$$;