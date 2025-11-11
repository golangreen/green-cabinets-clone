# Resend Webhook Setup for Email Delivery Tracking

This guide explains how to configure Resend webhooks to track email delivery status for role expiration reminders.

## Overview

The system tracks email delivery status (sent, delivered, bounced, failed) using Resend webhooks. When emails are sent, they're logged in the `email_delivery_log` table, and Resend sends webhook events to update their status.

## Setup Steps

### 1. Configure Resend Webhook

1. Go to your Resend dashboard: https://resend.com/webhooks
2. Click "Add Webhook"
3. Enter the webhook URL:
   ```
   https://mczagaaiyzbhjvtrojia.supabase.co/functions/v1/resend-webhook
   ```

4. Select the events to listen for:
   - ✅ `email.sent` - Email successfully sent to Resend
   - ✅ `email.delivered` - Email delivered to recipient
   - ✅ `email.bounced` - Email bounced back
   - ✅ `email.complained` - Recipient marked as spam
   - ✅ `email.delivery_delayed` - Delivery delayed
   - ⬜ `email.opened` (optional)
   - ⬜ `email.clicked` (optional)

5. Copy the webhook signing secret
6. Add it to your Lovable Cloud secrets as `RESEND_WEBHOOK_SECRET`

### 2. Verify Webhook Configuration

After setup, Resend will send test events to verify the webhook endpoint. The webhook handler will:

1. Receive the event
2. Verify the signature using RESEND_WEBHOOK_SECRET
3. Update the email_delivery_log table with the new status
4. Return a 200 OK response

### 3. Monitor Email Delivery

Visit the Admin Security Dashboard → Overview tab to view:

**Statistics (Last 7 Days):**
- Total emails sent
- Delivery rate percentage
- Bounced/failed emails count
- Complaint count

**Recent Email Logs:**
- Individual email status
- Recipient email addresses
- Email type (3-day, 1-day, expired)
- Timestamp of status updates

## Email Flow

1. **Role expiration check runs** (hourly via cron)
2. **Email sent** → Resend API returns email ID
3. **Email logged** → `email_delivery_log` table with status "sent"
4. **Webhook received** → Status updated to "delivered", "bounced", etc.
5. **Admin dashboard** → Real-time statistics and logs

## Database Schema

```sql
email_delivery_log
├── id (uuid, primary key)
├── email_id (text, from Resend)
├── recipient_email (text)
├── email_type (text: '3day', '1day', 'expired')
├── subject (text)
├── status (text: 'sent', 'delivered', 'bounced', 'failed', 'complained')
├── user_id (uuid, references auth.users)
├── role (app_role: 'admin', 'moderator', 'user')
├── event_data (jsonb)
├── created_at (timestamp)
└── updated_at (timestamp)
```

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify RESEND_WEBHOOK_SECRET is set in Lovable Cloud
3. Check Resend webhook logs for delivery failures
4. Ensure events are selected in Resend webhook configuration

### Email Status Not Updating

1. Check email_delivery_log table for the email_id
2. Verify webhook events in Resend dashboard
3. Check edge function logs: `supabase functions logs resend-webhook`
4. Ensure RLS policies allow service role to update logs

### High Bounce Rate

1. Review bounced emails in email_delivery_log
2. Check event_data for bounce reasons
3. Verify email addresses are valid
4. Consider implementing email validation before sending

## Security Notes

- The webhook endpoint is public (no JWT verification required)
- Webhook signatures are verified using RESEND_WEBHOOK_SECRET
- Only service role can write to email_delivery_log
- Admin role required to view delivery statistics
