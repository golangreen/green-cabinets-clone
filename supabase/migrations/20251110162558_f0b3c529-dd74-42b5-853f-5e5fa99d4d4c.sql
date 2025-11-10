-- Add admin verification to SECURITY DEFINER functions
-- This prevents non-admin users from calling these functions directly

-- Update manual_block_ip to verify admin status
CREATE OR REPLACE FUNCTION public.manual_block_ip(
  target_ip text, 
  block_reason text, 
  block_duration_hours integer DEFAULT 24, 
  performed_by_user text DEFAULT 'admin'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  block_until TIMESTAMPTZ;
BEGIN
  -- Verify the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to block IP addresses';
  END IF;

  block_until := now() + (block_duration_hours || ' hours')::interval;
  
  -- Insert or update blocked IP
  INSERT INTO public.blocked_ips (
    ip_address,
    reason,
    blocked_until,
    auto_blocked,
    violation_count,
    details
  ) VALUES (
    target_ip,
    block_reason,
    block_until,
    false,
    0,
    jsonb_build_object(
      'manual_block', true,
      'performed_by', performed_by_user,
      'duration_hours', block_duration_hours
    )
  )
  ON CONFLICT (ip_address) 
  DO UPDATE SET
    blocked_until = GREATEST(blocked_ips.blocked_until, block_until),
    reason = block_reason,
    details = blocked_ips.details || jsonb_build_object('extended_at', now());

  -- Log to history
  INSERT INTO public.block_history (
    ip_address,
    action,
    reason,
    blocked_until,
    auto_blocked,
    performed_by
  ) VALUES (
    target_ip,
    'blocked',
    block_reason,
    block_until,
    false,
    performed_by_user
  );

  RETURN jsonb_build_object(
    'success', true,
    'ip_address', target_ip,
    'blocked_until', block_until,
    'reason', block_reason
  );
END;
$$;

-- Update unblock_ip to verify admin status
CREATE OR REPLACE FUNCTION public.unblock_ip(
  target_ip text, 
  unblock_reason text DEFAULT 'Manual unblock'::text, 
  performed_by_user text DEFAULT 'admin'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING HINT = 'You must be an admin to unblock IP addresses';
  END IF;

  -- Delete from blocked_ips
  DELETE FROM public.blocked_ips
  WHERE ip_address = target_ip;

  -- Log to history
  INSERT INTO public.block_history (
    ip_address,
    action,
    reason,
    auto_blocked,
    performed_by
  ) VALUES (
    target_ip,
    'unblocked',
    unblock_reason,
    false,
    performed_by_user
  );

  RETURN jsonb_build_object(
    'success', true,
    'ip_address', target_ip,
    'message', 'IP unblocked successfully'
  );
END;
$$;

-- Add comment explaining the security requirement
COMMENT ON FUNCTION public.manual_block_ip IS 'Manually block an IP address. Requires admin role via has_role check.';
COMMENT ON FUNCTION public.unblock_ip IS 'Unblock an IP address. Requires admin role via has_role check.';