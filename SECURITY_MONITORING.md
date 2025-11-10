# Security Monitoring & Alerting System

This document explains the security monitoring and alerting system that has been implemented for your application.

## Overview

A comprehensive security monitoring system tracks suspicious activity across all edge functions and sends automated email alerts when threats are detected.

## Components

### 1. Security Events Table (`public.security_events`)
Stores all security-related events with the following fields:
- `event_type`: Type of security event (rate_limit_exceeded, validation_failed, suspicious_activity, authentication_failed)
- `function_name`: Name of the edge function that logged the event
- `client_ip`: IP address of the client
- `details`: JSONB field with additional context
- `severity`: Event severity (low, medium, high, critical)
- `created_at`: Timestamp

### 2. Alert History Table (`public.alert_history`)
Tracks sent alerts to prevent spam (1-hour cooldown between alerts)

### 3. Database Functions

#### `get_security_summary(time_window_minutes)`
Returns aggregated security events grouped by type and severity
```sql
SELECT * FROM get_security_summary(60); -- Last 60 minutes
```

#### `get_suspicious_ips(time_window_minutes, threshold)`
Identifies IPs with multiple security violations
```sql
SELECT * FROM get_suspicious_ips(60, 5); -- IPs with 5+ violations in last hour
```

### 4. Edge Functions

#### Security Monitor (`security-monitor`)
- Runs periodic security checks
- Analyzes security events from the last hour
- Sends email alerts when thresholds are exceeded
- Prevents alert spam (1-hour cooldown)

**Alert Triggers:**
- Critical or high severity events detected
- 10+ rate limit violations
- 5+ violations from the same IP

#### Updated Edge Functions
All public edge functions now log security events:
- `email-vanity-config`: Logs rate limits and validation failures
- `create-checkout`: Logs rate limits and validation failures
- `send-quote-request`: Already had rate limiting (can be updated similarly)

## Alert Email Configuration

Edit `supabase/functions/security-monitor/index.ts` to change the alert recipient:

```typescript
const ALERT_EMAIL = "info@greencabinets.com"; // Change this
```

## Setting Up Automated Monitoring

### Option 1: Manual Trigger
Call the security-monitor function manually:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/security-monitor \
  -H "apikey: YOUR_ANON_KEY"
```

### Option 2: Scheduled Monitoring (Recommended)
Set up a cron job to run every 15 minutes:

1. Enable `pg_cron` extension in your database
2. Run this SQL to create the scheduled job:

```sql
SELECT cron.schedule(
  'security-monitor-job',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url:='https://mczagaaiyzbhjvtrojia.supabase.co/functions/v1/security-monitor',
    headers:='{"Content-Type": "application/json", "apikey": "YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

**Replace:**
- `mczagaaiyzbhjvtrojia` with your project ID
- `YOUR_ANON_KEY` with your actual anon key

### Verify Cron Job
```sql
SELECT * FROM cron.job;
```

### Remove Cron Job (if needed)
```sql
SELECT cron.unschedule('security-monitor-job');
```

## Monitoring Dashboard

### View Recent Security Events
```sql
SELECT 
  event_type,
  function_name,
  client_ip,
  severity,
  created_at,
  details
FROM security_events
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 100;
```

### Check Security Summary
```sql
SELECT * FROM get_security_summary(1440); -- Last 24 hours
```

### Find Suspicious IPs
```sql
SELECT * FROM get_suspicious_ips(1440, 3); -- IPs with 3+ violations in 24 hours
```

### View Alert History
```sql
SELECT 
  alert_type,
  sent_at,
  details
FROM alert_history
ORDER BY sent_at DESC
LIMIT 10;
```

## Alert Email Example

When suspicious activity is detected, you'll receive an email with:
- **Security Events Summary**: Count of each event type with severity
- **Suspicious IP Addresses**: List of IPs with multiple violations
- **Recommended Actions**: Steps to take

## Customizing Thresholds

Edit `supabase/functions/security-monitor/index.ts`:

```typescript
const TIME_WINDOW_MINUTES = 60;          // Time window for analysis
const RATE_LIMIT_THRESHOLD = 10;         // Alert if 10+ rate limit events
const SUSPICIOUS_IP_THRESHOLD = 5;       // Alert if IP has 5+ violations
```

## Security Best Practices

1. **Review Alerts Promptly**: Investigate suspicious activity within 24 hours
2. **Block Repeat Offenders**: Consider IP blocking for persistent attackers
3. **Adjust Thresholds**: Fine-tune based on your traffic patterns
4. **Monitor Regularly**: Check the dashboard weekly for trends
5. **Rotate Keys**: If secrets are exposed, rotate them immediately

## Testing the System

### Trigger a Test Alert
1. Make 11+ rapid requests to a rate-limited endpoint (exceeds threshold)
2. Wait for the monitoring function to run (or trigger it manually)
3. Check your email for the security alert

### View Logged Events
```sql
SELECT * FROM security_events 
WHERE client_ip = 'YOUR_IP' 
ORDER BY created_at DESC;
```

## Troubleshooting

### No Alerts Received
- Check `alert_history` table to see if alerts are being logged
- Verify RESEND_API_KEY is configured correctly
- Check edge function logs for errors
- Ensure alert email address is valid

### Too Many Alerts
- Increase alert thresholds in `security-monitor/index.ts`
- Adjust cooldown period (currently 1 hour)
- Filter out low-severity events

### Missing Security Events
- Verify edge functions are deployed successfully
- Check edge function logs for database insert errors
- Ensure security_events table has correct RLS policies

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [pg_cron Extension](https://supabase.com/docs/guides/database/extensions/pgcron)
