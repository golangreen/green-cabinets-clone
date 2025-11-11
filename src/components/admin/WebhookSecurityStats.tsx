import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Webhook, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { LiveStatusIndicator } from './LiveStatusIndicator';

interface WebhookEvent {
  id: string;
  event_type: string;
  client_ip: string;
  severity: string;
  created_at: string;
  details: {
    reason?: string;
    svixId?: string;
    timestamp?: string;
    timestamp_age_seconds?: number;
  };
}

export function WebhookSecurityStats() {
  const queryClient = useQueryClient();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Get webhook-related security events from the last 24 hours
  const { data: webhookEvents, isLoading } = useQuery({
    queryKey: ['webhook-security-events'],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('function_name', 'resend-webhook')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as WebhookEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate statistics
  const stats = webhookEvents?.reduce(
    (acc, event) => {
      if (event.event_type === 'validation_failed') {
        acc.validationFailures++;
        if (event.details?.reason === 'invalid_signature') acc.invalidSignatures++;
        if (event.details?.reason === 'invalid_timestamp_format') acc.invalidTimestamps++;
      }
      if (event.event_type === 'suspicious_activity') {
        acc.suspiciousActivity++;
        if (event.details?.reason === 'timestamp_too_old') acc.replayAttempts++;
        if (event.details?.reason === 'timestamp_in_future') acc.futureTimestamps++;
      }
      if (event.event_type === 'rate_limit_exceeded') {
        acc.rateLimitHits++;
      }
      
      // Track unique IPs
      if (!acc.uniqueIPs.has(event.client_ip)) {
        acc.uniqueIPs.add(event.client_ip);
      }
      
      return acc;
    },
    {
      validationFailures: 0,
      invalidSignatures: 0,
      invalidTimestamps: 0,
      suspiciousActivity: 0,
      replayAttempts: 0,
      futureTimestamps: 0,
      rateLimitHits: 0,
      uniqueIPs: new Set<string>(),
    }
  );

  const totalEvents = webhookEvents?.length || 0;
  const successRate = totalEvents > 0 
    ? ((totalEvents - (stats?.validationFailures || 0) - (stats?.suspiciousActivity || 0)) / totalEvents * 100).toFixed(1)
    : 100;

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('security-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events',
          filter: 'function_name=eq.resend-webhook'
        },
        () => {
          console.log('New security event detected, refreshing webhook security stats...');
          queryClient.invalidateQueries({ queryKey: ['webhook-security-events'] });
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      setIsRealtimeConnected(false);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            <CardTitle>Webhook Security Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <LiveStatusIndicator isConnected={isRealtimeConnected} />
            <Badge variant={Number(successRate) > 95 ? "default" : "destructive"}>
              {successRate}% Success Rate
            </Badge>
          </div>
        </div>
        <CardDescription>
          Real-time webhook validation statistics (Last 24 hours)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-2xl font-bold">{totalEvents}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Validation Failures</p>
            <p className="text-2xl font-bold text-destructive">{stats?.validationFailures || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Replay Attempts</p>
            <p className="text-2xl font-bold text-orange-500">{stats?.replayAttempts || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Unique IPs</p>
            <p className="text-2xl font-bold">{stats?.uniqueIPs.size || 0}</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Failure Breakdown</h4>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span>Invalid Signatures</span>
              </div>
              <Badge variant="outline">{stats?.invalidSignatures || 0}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Timestamp Too Old (Replay)</span>
              </div>
              <Badge variant="outline">{stats?.replayAttempts || 0}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span>Future Timestamps</span>
              </div>
              <Badge variant="outline">{stats?.futureTimestamps || 0}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Rate Limit Hits</span>
              </div>
              <Badge variant="outline">{stats?.rateLimitHits || 0}</Badge>
            </div>
          </div>
        </div>

        {/* Recent Failures */}
        {webhookEvents && webhookEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Events</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {webhookEvents.slice(0, 10).map((event) => (
                <Alert key={event.id} variant={event.severity === 'high' || event.severity === 'critical' ? 'destructive' : 'default'}>
                  <AlertDescription>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {event.event_type.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.client_ip}
                          </span>
                        </div>
                        {event.details?.reason && (
                          <p className="text-xs font-medium">
                            {event.details.reason.replace(/_/g, ' ')}
                          </p>
                        )}
                        {event.details?.timestamp_age_seconds && (
                          <p className="text-xs text-muted-foreground">
                            Timestamp age: {event.details.timestamp_age_seconds}s
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.created_at), 'HH:mm:ss')}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Loading webhook statistics...
          </div>
        )}

        {!isLoading && totalEvents === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No webhook security events in the last 24 hours
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
