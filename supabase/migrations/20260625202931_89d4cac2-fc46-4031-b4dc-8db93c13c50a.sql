
-- Admin-gated functions: revoke anon (already check has_role internally; keep authenticated)
REVOKE EXECUTE ON FUNCTION public.add_user_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.add_user_role(uuid, app_role, timestamp with time zone) FROM anon;
REVOKE EXECUTE ON FUNCTION public.remove_user_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_add_user_role(uuid[], app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_remove_user_role(uuid[], app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_extend_role_expiration(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.extend_role_expiration(uuid, app_role, timestamp with time zone) FROM anon;
REVOKE EXECUTE ON FUNCTION public.manual_block_ip(text, text, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.unblock_ip(text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_all_users_with_roles() FROM anon;
REVOKE EXECUTE ON FUNCTION public.auto_block_ip(text, integer, integer) FROM anon;

-- Cron/system/trigger helpers: revoke from both anon and authenticated (service role retains EXECUTE)
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_blocks() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_failed_attempts() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_performance_metrics() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_webhook_events() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.remove_expired_roles() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_expired_roles() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_expiring_roles(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_expiring_roles_by_stage(integer, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_roles_expiring_within_days(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_reminder_sent(uuid, app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_3day_reminder_sent(uuid, app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_email_delivery_stats(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_security_summary(integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_suspicious_ips(integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_role_change(uuid, text, text, app_role, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM anon, authenticated;

-- Notification settings: revoke anon (signed-in users call via app)
REVOKE EXECUTE ON FUNCTION public.get_or_create_notification_settings(uuid) FROM anon;
