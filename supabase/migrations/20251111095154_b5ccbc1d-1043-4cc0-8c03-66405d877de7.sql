-- Function to add roles to multiple users in bulk (admin only)
CREATE OR REPLACE FUNCTION public.bulk_add_user_role(
  target_user_ids uuid[],
  target_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_count INTEGER := 0;
  user_id uuid;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  -- Loop through user IDs and add role
  FOREACH user_id IN ARRAY target_user_ids
  LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, target_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Count if role was actually added (not already existing)
    IF FOUND THEN
      affected_count := affected_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'affected_count', affected_count,
    'total_users', array_length(target_user_ids, 1),
    'role', target_role,
    'message', format('Role assigned to %s user(s)', affected_count)
  );
END;
$$;

-- Function to remove roles from multiple users in bulk (admin only)
CREATE OR REPLACE FUNCTION public.bulk_remove_user_role(
  target_user_ids uuid[],
  target_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_count INTEGER := 0;
  admin_count INTEGER;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  -- If removing admin role, check we're not removing all admins
  IF target_role = 'admin'::app_role THEN
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_roles 
    WHERE role = 'admin'::app_role;
    
    -- Count how many admins we're trying to remove
    IF admin_count - array_length(target_user_ids, 1) < 1 THEN
      RAISE EXCEPTION 'Cannot remove all admins'
        USING HINT = 'At least one admin must remain in the system';
    END IF;
  END IF;

  -- Delete the roles
  DELETE FROM public.user_roles
  WHERE user_id = ANY(target_user_ids) AND role = target_role;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'affected_count', affected_count,
    'total_users', array_length(target_user_ids, 1),
    'role', target_role,
    'message', format('Role removed from %s user(s)', affected_count)
  );
END;
$$;