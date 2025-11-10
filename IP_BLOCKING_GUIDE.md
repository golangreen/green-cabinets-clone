# IP Blocking System Guide

Complete guide to using the automated IP blocking system for security protection.

## Overview

The IP blocking system automatically blocks IP addresses with repeated security violations, with configurable duration and thresholds. Blocked IPs are prevented from accessing all public edge functions.

## Features

✅ **Automatic Blocking**: IPs with 8+ violations in 24 hours are auto-blocked  
✅ **Manual Blocking**: Admins can manually block/unblock IPs  
✅ **Configurable Duration**: Set custom block durations (default: 24 hours)  
✅ **Audit Trail**: Complete history of all blocking actions  
✅ **Automatic Cleanup**: Expired blocks are automatically removed  
✅ **Email Alerts**: Notifications when IPs are auto-blocked  

## Database Tables

### `blocked_ips`
Stores currently blocked IP addresses:
- `ip_address`: The blocked IP (unique)
- `reason`: Why the IP was blocked
- `blocked_at`: When the block started
- `blocked_until`: When the block expires
- `auto_blocked`: Whether blocked automatically or manually
- `violation_count`: Number of violations that triggered the block
- `details`: JSONB field with additional context

### `block_history`
Audit trail of all blocking actions:
- `ip_address`: The affected IP
- `action`: blocked, unblocked, or extended
- `reason`: Reason for the action
- `performed_by`: Who/what performed the action
- `auto_blocked`: Whether action was automatic
- `created_at`: When the action occurred

## Automatic Blocking

### How It Works

1. **Security Monitor**: Runs every 15 minutes (if scheduled)
2. **Violation Check**: Counts security events per IP in last 24 hours
3. **Threshold**: IPs with 8+ violations trigger auto-block
4. **Duration**: Blocked for 24 hours by default
5. **Alert**: Email sent to admin with blocked IP list

### Auto-Block Configuration

Edit `supabase/functions/security-monitor/index.ts`:

```typescript
const AUTOBLOCK_THRESHOLD = 8;          // Number of violations to trigger block
const AUTOBLOCK_DURATION_HOURS = 24;     // How long to block (hours)
```

### Tested Automatically

When the security monitor runs, it:
1. Identifies IPs with violations ≥ threshold
2. Calls `auto_block_ip()` function for each
3. Logs the block to `block_history`
4. Sends email alert with blocked IPs highlighted

## Manual IP Management

### Block an IP Manually

```sql
-- Block for 24 hours (default)
SELECT manual_block_ip(
  '192.168.1.100',
  'Suspicious behavior detected manually',
  24,
  'admin_user'
);

-- Block for 72 hours
SELECT manual_block_ip(
  '192.168.1.100',
  'Repeat offender',
  72,
  'admin_user'
);
```

### Unblock an IP

```sql
SELECT unblock_ip(
  '192.168.1.100',
  'False positive - legitimate user',
  'admin_user'
);
```

### Check if IP is Blocked

```sql
-- Simple boolean check
SELECT is_ip_blocked('192.168.1.100');

-- Get detailed info
SELECT * FROM get_blocked_ip_info('192.168.1.100');
```

## Edge Function Integration

All public edge functions now check for blocked IPs before processing requests:

```typescript
// Example from email-vanity-config/index.ts
const { data: blockCheck } = await supabase.rpc("is_ip_blocked", { check_ip: clientIp });
if (blockCheck === true) {
  // Return 403 Forbidden with block details
  return new Response(
    JSON.stringify({ 
      error: "Access denied. Your IP has been temporarily blocked.",
      reason: reason,
      blocked_until: blockedUntil,
    }),
    { status: 403 }
  );
}
```

**Protected Functions:**
- ✅ `email-vanity-config`
- ✅ `create-checkout`
- ✅ `send-quote-request` (can be updated similarly)

## Monitoring & Queries

### View Currently Blocked IPs

```sql
SELECT 
  ip_address,
  reason,
  blocked_at,
  blocked_until,
  auto_blocked,
  violation_count,
  details
FROM blocked_ips
WHERE blocked_until > NOW()
ORDER BY blocked_at DESC;
```

### View Block History

```sql
SELECT 
  ip_address,
  action,
  reason,
  auto_blocked,
  performed_by,
  created_at
FROM block_history
ORDER BY created_at DESC
LIMIT 50;
```

### Find IPs with Most Blocks

```sql
SELECT 
  ip_address,
  COUNT(*) as block_count,
  MAX(created_at) as last_blocked,
  array_agg(DISTINCT action) as actions
FROM block_history
GROUP BY ip_address
ORDER BY block_count DESC
LIMIT 20;
```

### Check Violations for Specific IP

```sql
SELECT 
  event_type,
  function_name,
  severity,
  created_at,
  details
FROM security_events
WHERE client_ip = '192.168.1.100'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

## Maintenance

### Clean Up Expired Blocks

Run this manually or schedule it:

```sql
SELECT cleanup_expired_blocks();
-- Returns: number of expired blocks removed
```

**Schedule daily cleanup:**

```sql
SELECT cron.schedule(
  'cleanup-expired-blocks',
  '0 2 * * *', -- 2 AM daily
  $$
  SELECT cleanup_expired_blocks();
  $$
);
```

### Adjust Auto-Block Settings

Modify thresholds based on your traffic patterns:

**Too Many Legitimate Blocks:**
- Increase `AUTOBLOCK_THRESHOLD` (e.g., 12 violations)
- Increase rate limits in edge functions
- Reduce block duration

**Too Few Blocks:**
- Decrease `AUTOBLOCK_THRESHOLD` (e.g., 5 violations)  
- Increase block duration (e.g., 48 hours)
- Add more security event logging

## Testing the System

### Test Auto-Blocking

1. Make 9+ rapid requests to trigger rate limits:
```bash
for i in {1..10}; do
  curl -X POST https://your-project.supabase.co/functions/v1/email-vanity-config \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}';
  sleep 1;
done
```

2. Wait for security monitor to run (or trigger manually)

3. Check if IP is blocked:
```sql
SELECT * FROM blocked_ips WHERE ip_address = 'YOUR_IP';
```

### Test Manual Blocking

1. Block your IP:
```sql
SELECT manual_block_ip(
  'YOUR_IP',
  'Testing manual block',
  1, -- 1 hour
  'test_user'
);
```

2. Try accessing an edge function - should return 403

3. Unblock:
```sql
SELECT unblock_ip('YOUR_IP', 'Test complete', 'test_user');
```

## Troubleshooting

### IP Still Accessing After Block

**Check:**
1. Is the block still active? `SELECT * FROM blocked_ips WHERE ip_address = 'X.X.X.X'`
2. Edge functions deployed? Check function logs
3. Correct IP being checked? (x-forwarded-for vs x-real-ip)

### Auto-Blocking Not Working

**Verify:**
1. Security monitor is scheduled and running
2. Security events are being logged
3. Violations exceed threshold
4. Check security-monitor function logs for errors

### False Positive Blocks

**Solutions:**
1. Unblock the IP immediately
2. Review security events for that IP
3. Adjust rate limiting thresholds
4. Whitelist specific IPs (add custom logic in edge functions)

### Too Many Blocks

**Actions:**
1. Increase auto-block threshold
2. Review rate limiting settings
3. Check for bot traffic patterns
4. Consider implementing CAPTCHA

## Best Practices

### 1. Monitor Block Activity
Review blocked_ips and block_history tables weekly to identify patterns

### 2. Document Manual Blocks
Always provide clear reasons when manually blocking IPs

### 3. Set Appropriate Durations
- Light offenses: 1-6 hours
- Moderate violations: 24 hours (default)
- Severe attacks: 72+ hours

### 4. Review Auto-Blocks
Periodically check auto-blocked IPs to ensure accuracy

### 5. Combine with Other Measures
- Use rate limiting
- Implement CAPTCHA for repeated failures
- Add IP whitelisting for trusted sources

## API Examples

### Using from Edge Functions

```typescript
// Check if IP is blocked
const { data: isBlocked } = await supabase.rpc("is_ip_blocked", { 
  check_ip: clientIp 
});

// Get block details
const { data: blockInfo } = await supabase.rpc("get_blocked_ip_info", { 
  check_ip: clientIp 
});

// Auto-block an IP
const { data: result } = await supabase.rpc("auto_block_ip", {
  target_ip: "192.168.1.100",
  violation_threshold: 8,
  block_duration_hours: 24
});

// Manually block
const { data: result } = await supabase.rpc("manual_block_ip", {
  target_ip: "192.168.1.100",
  block_reason: "Repeated attacks",
  block_duration_hours: 48,
  performed_by_user: "admin"
});

// Unblock
const { data: result } = await supabase.rpc("unblock_ip", {
  target_ip: "192.168.1.100",
  unblock_reason: "Verified legitimate user",
  performed_by_user: "admin"
});
```

## Related Documentation

- [Security Monitoring Guide](./SECURITY_MONITORING.md)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)

## Support

For issues or questions about the IP blocking system:
1. Check edge function logs for errors
2. Review security_events and blocked_ips tables
3. Test with manual blocking first
4. Verify security monitor is running
