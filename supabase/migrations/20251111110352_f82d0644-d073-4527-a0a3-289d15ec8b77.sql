-- Enable realtime for security_events table
ALTER TABLE public.security_events REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;