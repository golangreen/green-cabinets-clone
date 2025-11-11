-- Add columns to track different reminder stages
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS reminder_3day_sent boolean DEFAULT false;

-- Update the get_expiring_roles function to support different reminder stages
CREATE OR REPLACE FUNCTION public.get_expiring_roles_by_stage(
  hours_before integer DEFAULT 24,
  reminder_stage text DEFAULT '1day'
)
RETURNS TABLE(
  user_id uuid,
  user_email text,
  role app_role,
  expires_at timestamp with time zone,
  hours_until_expiry numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return roles based on reminder stage
  IF reminder_stage = '3day' THEN
    RETURN QUERY
    SELECT 
      ur.user_id,
      au.email::text as user_email,
      ur.role,
      ur.expires_at,
      EXTRACT(EPOCH FROM (ur.expires_at - now())) / 3600 as hours_until_expiry
    FROM public.user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    WHERE ur.expires_at IS NOT NULL
      AND ur.expires_at > now()
      AND ur.expires_at <= now() + (hours_before || ' hours')::interval
      AND ur.reminder_3day_sent = false
    ORDER BY ur.expires_at ASC;
  ELSE
    -- Default 1day reminder
    RETURN QUERY
    SELECT 
      ur.user_id,
      au.email::text as user_email,
      ur.role,
      ur.expires_at,
      EXTRACT(EPOCH FROM (ur.expires_at - now())) / 3600 as hours_until_expiry
    FROM public.user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    WHERE ur.expires_at IS NOT NULL
      AND ur.expires_at > now()
      AND ur.expires_at <= now() + (hours_before || ' hours')::interval
      AND ur.reminder_sent = false
    ORDER BY ur.expires_at ASC;
  END IF;
END;
$$;

-- Function to mark 3-day reminder as sent
CREATE OR REPLACE FUNCTION public.mark_3day_reminder_sent(target_user_id uuid, target_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_roles
  SET reminder_3day_sent = true
  WHERE user_id = target_user_id 
    AND role = target_role
    AND expires_at IS NOT NULL;
END;
$$;

-- Update add_user_role to reset both reminder flags
CREATE OR REPLACE FUNCTION public.add_user_role(
  target_user_id uuid,
  target_role app_role,
  expiration_date timestamp with time zone DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_target_email text;
  v_is_temporary boolean;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = target_user_id;
  v_is_temporary := expiration_date IS NOT NULL;

  INSERT INTO public.user_roles (user_id, role, expires_at, is_temporary, reminder_sent, reminder_3day_sent)
  VALUES (target_user_id, target_role, expiration_date, v_is_temporary, false, false)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    expires_at = EXCLUDED.expires_at,
    is_temporary = EXCLUDED.is_temporary,
    reminder_sent = false,
    reminder_3day_sent = false;

  PERFORM public.log_role_change(
    target_user_id,
    v_target_email,
    'assigned',
    target_role,
    jsonb_build_object(
      'method', 'single',
      'is_temporary', v_is_temporary,
      'expires_at', expiration_date
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'role', target_role,
    'expires_at', expiration_date,
    'message', CASE 
      WHEN v_is_temporary THEN 'Temporary role assigned successfully'
      ELSE 'Role assigned successfully'
    END
  );
END;
$$;

-- Update extend_role_expiration to reset both reminder flags
CREATE OR REPLACE FUNCTION public.extend_role_expiration(
  target_user_id uuid,
  target_role app_role,
  new_expiration_date timestamp with time zone
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_target_email text;
  v_current_expiration timestamp with time zone;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

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

  UPDATE public.user_roles
  SET expires_at = new_expiration_date,
      reminder_sent = false,
      reminder_3day_sent = false
  WHERE user_id = target_user_id 
    AND role = target_role;

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