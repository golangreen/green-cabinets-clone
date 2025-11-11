-- Add retry tracking to webhook_events table
ALTER TABLE public.webhook_events
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Add index for efficient retry monitoring
CREATE INDEX IF NOT EXISTS idx_webhook_events_retry_monitoring 
ON public.webhook_events(event_type, created_at, retry_count)
WHERE retry_count > 0;