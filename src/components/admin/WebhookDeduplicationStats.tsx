import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface WebhookEvent {
  id: string;
  svix_id: string;
  event_type: string;
  client_ip: string;
  processed_at: string;
  created_at: string;
}

export function WebhookDeduplicationStats() {
  // Get webhook events from the last 24 hours
  const { data: webhookEvents, isLoading } = useQuery({
    queryKey: ['webhook-deduplication-stats'],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as WebhookEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get duplicate detection count from security events
  const { data: duplicateEvents } = useQuery({
    queryKey: ['webhook-duplicates'],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // Count how many times we returned duplicate responses (this would be in logs)
      // For now, we'll estimate based on webhook_events table
      const { count } = await supabase
        .from('webhook_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo);

      return count || 0;
    },
    refetchInterval: 30000,
  });

  const totalProcessed = webhookEvents?.length || 0;
  const uniqueIPs = new Set(webhookEvents?.map(e => e.client_ip)).size;
  
  // Calculate time distribution
  const recentEvents = webhookEvents?.slice(0, 10) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            <CardTitle>Webhook Deduplication</CardTitle>
          </div>
          <Badge variant="default">
            {totalProcessed} Tracked
          </Badge>
        </div>
        <CardDescription>
          Preventing duplicate webhook processing (Last 24 hours)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Events Tracked</span>
            </div>
            <p className="text-2xl font-bold">{totalProcessed}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Copy className="h-4 w-4" />
              <span>Unique IPs</span>
            </div>
            <p className="text-2xl font-bold">{uniqueIPs}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Retention</span>
            </div>
            <p className="text-2xl font-bold">30d</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium text-sm">How Deduplication Works</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Each webhook event is tracked by its unique svix-id</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Duplicate events are detected before processing</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Events older than 30 days are automatically cleaned up</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Prevents double-processing if Resend retries delivery</span>
            </div>
          </div>
        </div>

        {/* Recent Webhook Events */}
        {recentEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Webhook Events</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {event.svix_id.substring(0, 20)}...
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.client_ip} • {event.event_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.processed_at), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Loading deduplication statistics...
          </div>
        )}

        {!isLoading && totalProcessed === 0 && (
          <div className="text-center py-8">
            <Copy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No webhook events tracked yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Deduplication tracking will begin when webhooks are received
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
