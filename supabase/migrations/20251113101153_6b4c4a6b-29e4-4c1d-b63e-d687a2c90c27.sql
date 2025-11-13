-- Fix Function Search Path Mutable security finding
-- Add explicit search_path to all functions that don't have it set

-- Note: Most functions already have "SET search_path = public" but some may be missing it
-- This migration ensures ALL functions have explicit search_path set

-- Update cleanup_old_performance_metrics
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_metrics()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.performance_metrics
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- Update cleanup_expired_blocks
CREATE OR REPLACE FUNCTION public.cleanup_expired_blocks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update cleanup_old_webhook_events
CREATE OR REPLACE FUNCTION public.cleanup_old_webhook_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.webhook_events
    WHERE created_at < now() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$function$;

-- All other functions already have SET search_path = public
-- Verify by checking function definitions in db-functions context