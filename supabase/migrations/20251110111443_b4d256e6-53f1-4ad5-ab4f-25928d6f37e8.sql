-- Create blocked IPs table
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ NOT NULL,
  auto_blocked BOOLEAN NOT NULL DEFAULT false,
  violation_count INTEGER NOT NULL DEFAULT 0,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_blocked_ips_address ON public.blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_until ON public.blocked_ips(blocked_until);
CREATE INDEX idx_blocked_ips_auto ON public.blocked_ips(auto_blocked);

-- Create block_history table for audit trail
CREATE TABLE IF NOT EXISTS public.block_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('blocked', 'unblocked', 'extended')),
  reason TEXT,
  blocked_until TIMESTAMPTZ,
  auto_blocked BOOLEAN NOT NULL DEFAULT false,
  performed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_block_history_ip ON public.block_history(ip_address);
CREATE INDEX idx_block_history_created ON public.block_history(created_at DESC);

-- Enable RLS on both tables
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_history ENABLE ROW LEVEL SECURITY;

-- Create policies (service role only)
CREATE POLICY "Service role can manage blocked IPs"
  ON public.blocked_ips
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage block history"
  ON public.block_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to check if an IP is currently blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocked_ips
    WHERE ip_address = check_ip
      AND blocked_until > now()
  );
$$;

-- Function to get blocked IP details
CREATE OR REPLACE FUNCTION public.get_blocked_ip_info(check_ip TEXT)
RETURNS TABLE (
  blocked BOOLEAN,
  reason TEXT,
  blocked_until TIMESTAMPTZ,
  violation_count INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT 
    true as blocked,
    reason,
    blocked_until,
    violation_count
  FROM public.blocked_ips
  WHERE ip_address = check_ip
    AND blocked_until > now()
  LIMIT 1;
$$;

-- Function to automatically block IPs based on violations
CREATE OR REPLACE FUNCTION public.auto_block_ip(
  target_ip TEXT,
  violation_threshold INTEGER DEFAULT 5,
  block_duration_hours INTEGER DEFAULT 24
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_violations INTEGER;
  block_until TIMESTAMPTZ;
  result JSONB;
BEGIN
  -- Count recent violations (last 24 hours)
  SELECT COUNT(*)
  INTO recent_violations
  FROM public.security_events
  WHERE client_ip = target_ip
    AND created_at > now() - INTERVAL '24 hours'
    AND event_type IN ('rate_limit_exceeded', 'validation_failed', 'suspicious_activity');

  -- Check if violations exceed threshold
  IF recent_violations >= violation_threshold THEN
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
      format('Automatic block: %s violations in 24 hours', recent_violations),
      block_until,
      true,
      recent_violations,
      jsonb_build_object(
        'violation_count', recent_violations,
        'threshold', violation_threshold,
        'duration_hours', block_duration_hours
      )
    )
    ON CONFLICT (ip_address) 
    DO UPDATE SET
      blocked_until = GREATEST(blocked_ips.blocked_until, block_until),
      violation_count = blocked_ips.violation_count + recent_violations,
      reason = format('Extended block: %s total violations', blocked_ips.violation_count + recent_violations),
      details = blocked_ips.details || jsonb_build_object('last_extended', now());

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
      format('Auto-blocked: %s violations', recent_violations),
      block_until,
      true,
      'auto_block_system'
    );

    result := jsonb_build_object(
      'blocked', true,
      'ip_address', target_ip,
      'violations', recent_violations,
      'blocked_until', block_until,
      'reason', format('Automatic block: %s violations', recent_violations)
    );
  ELSE
    result := jsonb_build_object(
      'blocked', false,
      'ip_address', target_ip,
      'violations', recent_violations,
      'threshold', violation_threshold,
      'message', 'Violations below threshold'
    );
  END IF;

  RETURN result;
END;
$$;

-- Function to manually block an IP
CREATE OR REPLACE FUNCTION public.manual_block_ip(
  target_ip TEXT,
  block_reason TEXT,
  block_duration_hours INTEGER DEFAULT 24,
  performed_by_user TEXT DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  block_until TIMESTAMPTZ;
BEGIN
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

-- Function to unblock an IP
CREATE OR REPLACE FUNCTION public.unblock_ip(
  target_ip TEXT,
  unblock_reason TEXT DEFAULT 'Manual unblock',
  performed_by_user TEXT DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Function to clean up expired blocks
CREATE OR REPLACE FUNCTION public.cleanup_expired_blocks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired blocks
  WITH deleted AS (
    DELETE FROM public.blocked_ips
    WHERE blocked_until < now()
    RETURNING ip_address
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;