-- Add expiration fields to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_temporary BOOLEAN DEFAULT false,
ADD COLUMN reminder_sent BOOLEAN DEFAULT false;

-- Create index for efficient expiration queries
CREATE INDEX idx_user_roles_expires_at ON public.user_roles(expires_at) 
WHERE expires_at IS NOT NULL;

-- Function to get expiring roles (within 24 hours)
CREATE OR REPLACE FUNCTION public.get_expiring_roles(hours_before integer DEFAULT 24)
RETURNS TABLE(
  user_id uuid,
  user_email text,
  role app_role,
  expires_at timestamp with time zone,
  hours_until_expiry numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
END;
$$;

-- Function to get expired roles
CREATE OR REPLACE FUNCTION public.get_expired_roles()
RETURNS TABLE(
  user_id uuid,
  user_email text,
  role app_role,
  expires_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.user_id,
    au.email::text as user_email,
    ur.role,
    ur.expires_at
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.expires_at IS NOT NULL
    AND ur.expires_at <= now()
  ORDER BY ur.expires_at DESC;
END;
$$;

-- Function to remove expired roles
CREATE OR REPLACE FUNCTION public.remove_expired_roles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed_count INTEGER := 0;
  expired_role RECORD;
BEGIN
  -- Loop through expired roles and remove them
  FOR expired_role IN 
    SELECT ur.user_id, ur.role, au.email
    FROM public.user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    WHERE ur.expires_at IS NOT NULL
      AND ur.expires_at <= now()
  LOOP
    -- Delete the expired role
    DELETE FROM public.user_roles
    WHERE user_id = expired_role.user_id 
      AND role = expired_role.role
      AND expires_at IS NOT NULL
      AND expires_at <= now();
    
    IF FOUND THEN
      removed_count := removed_count + 1;
      
      -- Log the automatic removal
      PERFORM public.log_role_change(
        expired_role.user_id,
        expired_role.email,
        'expired',
        expired_role.role,
        jsonb_build_object('automatic', true, 'reason', 'Role expired')
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'removed_count', removed_count,
    'message', format('Removed %s expired role(s)', removed_count)
  );
END;
$$;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION public.mark_reminder_sent(target_user_id uuid, target_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles
  SET reminder_sent = true
  WHERE user_id = target_user_id 
    AND role = target_role
    AND expires_at IS NOT NULL;
END;
$$;

-- Update add_user_role to support expiration
CREATE OR REPLACE FUNCTION public.add_user_role(
  target_user_id uuid, 
  target_role app_role,
  expiration_date timestamp with time zone DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_email text;
  v_is_temporary boolean;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to manage roles';
  END IF;

  -- Get target user email
  SELECT email INTO v_target_email FROM auth.users WHERE id = target_user_id;
  
  -- Determine if temporary
  v_is_temporary := expiration_date IS NOT NULL;

  -- Insert role
  INSERT INTO public.user_roles (user_id, role, expires_at, is_temporary, reminder_sent)
  VALUES (target_user_id, target_role, expiration_date, v_is_temporary, false)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    expires_at = EXCLUDED.expires_at,
    is_temporary = EXCLUDED.is_temporary,
    reminder_sent = false;

  -- Log the change
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