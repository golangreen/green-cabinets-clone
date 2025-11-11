-- Create role_change_audit table for tracking all role modifications
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  target_user_email text NOT NULL,
  action text NOT NULL CHECK (action IN ('assigned', 'removed')),
  role app_role NOT NULL,
  performed_by_id uuid NOT NULL,
  performed_by_email text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_role_audit_target_user ON public.role_change_audit(target_user_id);
CREATE INDEX idx_role_audit_performed_by ON public.role_change_audit(performed_by_id);
CREATE INDEX idx_role_audit_created_at ON public.role_change_audit(created_at DESC);
CREATE INDEX idx_role_audit_role ON public.role_change_audit(role);

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view role audit logs"
ON public.role_change_audit
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.role_change_audit
FOR INSERT
WITH CHECK (true);

-- Function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change(
  p_target_user_id uuid,
  p_target_user_email text,
  p_action text,
  p_role app_role,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_performer_email text;
BEGIN
  -- Get performer's email
  SELECT email INTO v_performer_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Insert audit log
  INSERT INTO public.role_change_audit (
    target_user_id,
    target_user_email,
    action,
    role,
    performed_by_id,
    performed_by_email,
    details
  ) VALUES (
    p_target_user_id,
    p_target_user_email,
    p_action,
    p_role,
    auth.uid(),
    v_performer_email,
    p_details
  );
END;
$$;

-- Update add_user_role function to include logging
CREATE OR REPLACE FUNCTION public.add_user_role(
  target_user_id uuid,
  target_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_email text;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  -- Get target user email
  SELECT email INTO v_target_email FROM auth.users WHERE id = target_user_id;

  -- Insert role (will be ignored if already exists due to unique constraint)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, target_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log the change
  IF FOUND THEN
    PERFORM public.log_role_change(
      target_user_id,
      v_target_email,
      'assigned',
      target_role,
      jsonb_build_object('method', 'single')
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', target_role,
    'message', 'Role assigned successfully'
  );
END;
$$;

-- Update remove_user_role function to include logging
CREATE OR REPLACE FUNCTION public.remove_user_role(
  target_user_id uuid,
  target_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_email text;
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

  -- Get target user email
  SELECT email INTO v_target_email FROM auth.users WHERE id = target_user_id;

  -- Delete the role
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = target_role;

  -- Log the change
  IF FOUND THEN
    PERFORM public.log_role_change(
      target_user_id,
      v_target_email,
      'removed',
      target_role,
      jsonb_build_object('method', 'single')
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', target_role,
    'message', 'Role removed successfully'
  );
END;
$$;

-- Update bulk functions to include logging
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
  v_target_email text;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  -- Loop through user IDs and add role
  FOREACH user_id IN ARRAY target_user_ids
  LOOP
    SELECT email INTO v_target_email FROM auth.users WHERE id = user_id;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id, target_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log if role was actually added
    IF FOUND THEN
      affected_count := affected_count + 1;
      PERFORM public.log_role_change(
        user_id,
        v_target_email,
        'assigned',
        target_role,
        jsonb_build_object('method', 'bulk', 'total_selected', array_length(target_user_ids, 1))
      );
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
  user_id uuid;
  v_target_email text;
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
    
    IF admin_count - array_length(target_user_ids, 1) < 1 THEN
      RAISE EXCEPTION 'Cannot remove all admins'
        USING HINT = 'At least one admin must remain in the system';
    END IF;
  END IF;

  -- Loop through and delete roles with logging
  FOREACH user_id IN ARRAY target_user_ids
  LOOP
    SELECT email INTO v_target_email FROM auth.users WHERE id = user_id;
    
    DELETE FROM public.user_roles
    WHERE user_roles.user_id = bulk_remove_user_role.user_id AND role = target_role;
    
    IF FOUND THEN
      affected_count := affected_count + 1;
      PERFORM public.log_role_change(
        user_id,
        v_target_email,
        'removed',
        target_role,
        jsonb_build_object('method', 'bulk', 'total_selected', array_length(target_user_ids, 1))
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'affected_count', affected_count,
    'total_users', array_length(target_user_ids, 1),
    'role', target_role,
    'message', format('Role removed from %s user(s)', affected_count)
  );
END;
$$;