-- Enable realtime for webhook_events table
ALTER TABLE public.webhook_events REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.webhook_events;