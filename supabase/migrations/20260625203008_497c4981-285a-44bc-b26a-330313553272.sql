
-- Admin-gated functions: revoke PUBLIC, re-grant authenticated (admin check is internal)
REVOKE EXECUTE ON FUNCTION public.add_user_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_user_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.add_user_role(uuid, app_role, timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_user_role(uuid, app_role, timestamp with time zone) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.remove_user_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_user_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.bulk_add_user_role(uuid[], app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bulk_add_user_role(uuid[], app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.bulk_remove_user_role(uuid[], app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bulk_remove_user_role(uuid[], app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.bulk_extend_role_expiration(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bulk_extend_role_expiration(jsonb) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.extend_role_expiration(uuid, app_role, timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.extend_role_expiration(uuid, app_role, timestamp with time zone) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.manual_block_ip(text, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.manual_block_ip(text, text, integer, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.unblock_ip(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unblock_ip(text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_all_users_with_roles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.auto_block_ip(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_block_ip(text, integer, integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_or_create_notification_settings(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_notification_settings(uuid) TO authenticated;

-- Cron/system/trigger helpers: revoke PUBLIC entirely (service role retains EXECUTE)
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_blocks() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_failed_attempts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_performance_metrics() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_webhook_events() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.remove_expired_roles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_expired_roles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_expiring_roles(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_expiring_roles_by_stage(integer, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_roles_expiring_within_days(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mark_reminder_sent(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mark_3day_reminder_sent(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_email_delivery_stats(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_security_summary(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_suspicious_ips(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_role_change(uuid, text, text, app_role, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC;
