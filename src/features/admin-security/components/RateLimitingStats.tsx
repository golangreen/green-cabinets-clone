import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { LiveStatusIndicator } from './LiveStatusIndicator';
import { fetchSecurityEvents } from '@/services';
import { SECURITY_CONFIG } from '@/config';
import { useRealtimeSecurityEvents } from '../hooks/useRealtimeSecurityEvents';

interface RateLimitEvent {
  id: string;
  event_type: string;
  client_ip: string;
  function_name: string;
  severity: string;
  created_at: string;
  details: {
    limit?: number;
    window?: string;
  };
}

export function RateLimitingStats() {
  // Get rate limit events from the last 24 hours
  const { data: rateLimitEvents, isLoading } = useQuery({
    queryKey: ['rate-limit-events'],
    queryFn: () => fetchSecurityEvents(SECURITY_CONFIG.SECURITY_EVENTS_TIME_WINDOW_MINUTES, 'rate_limit_exceeded'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Setup realtime subscription
  const { isConnected: isRealtimeConnected } = useRealtimeSecurityEvents({
    channelName: 'rate-limit-realtime',
    queryKey: ['rate-limit-events'],
    eventTypeFilter: 'rate_limit_exceeded',
    notificationType: 'rate_limit',
    showToast: true,
  });

  // Calculate statistics
  const stats = rateLimitEvents?.reduce(
    (acc, event) => {
      // Count by function
      acc.functionCounts[event.function_name] = (acc.functionCounts[event.function_name] || 0) + 1;
      
      // Track unique IPs
      if (!acc.uniqueIPs.has(event.client_ip)) {
        acc.uniqueIPs.add(event.client_ip);
        acc.ipDetails[event.client_ip] = { count: 0, functions: new Set() };
      }
      
      acc.ipDetails[event.client_ip].count++;
      acc.ipDetails[event.client_ip].functions.add(event.function_name);
      
      return acc;
    },
    {
      functionCounts: {} as Record<string, number>,
      uniqueIPs: new Set<string>(),
      ipDetails: {} as Record<string, { count: number; functions: Set<string> }>,
    }
  );

  // Get top offending IPs
  const topOffenders = stats
    ? Object.entries(stats.ipDetails)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
    : [];

  // Get function breakdown
  const functionBreakdown = stats
    ? Object.entries(stats.functionCounts).sort(([, a], [, b]) => b - a)
    : [];

  const totalEvents = rateLimitEvents?.length || 0;
  const uniqueIPs = stats?.uniqueIPs.size || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Rate Limiting Monitor</CardTitle>
              <CardDescription>
                Rate limit violations across all endpoints (Last 24 hours)
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LiveStatusIndicator isConnected={isRealtimeConnected} />
            <Badge variant={totalEvents > 50 ? "destructive" : totalEvents > 10 ? "secondary" : "default"}>
              {totalEvents} Events
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Total Violations</span>
            </div>
            <p className="text-2xl font-bold">{totalEvents}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Unique IPs</span>
            </div>
            <p className="text-2xl font-bold">{uniqueIPs}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Functions Affected</span>
            </div>
            <p className="text-2xl font-bold">{functionBreakdown.length}</p>
          </div>
        </div>

        {/* Function Breakdown */}
        {functionBreakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Violations by Endpoint</h4>
            <div className="space-y-2">
              {functionBreakdown.map(([func, count]) => (
                <div key={func} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs">{func}</span>
                  <Badge variant="outline">{count} hits</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Offending IPs */}
        {topOffenders.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Top Offending IPs</h4>
            <div className="space-y-2">
              {topOffenders.map(([ip, details]) => (
                <div key={ip} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="space-y-1">
                    <p className="font-mono text-sm font-medium">{ip}</p>
                    <p className="text-xs text-muted-foreground">
                      {details.count} violations across {details.functions.size} endpoint(s)
                    </p>
                  </div>
                  <Badge variant={details.count > 10 ? "destructive" : "secondary"}>
                    {details.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        {rateLimitEvents && rateLimitEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Events</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {rateLimitEvents.slice(0, 8).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between text-sm p-2 rounded border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{event.client_ip}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.function_name}
                      </Badge>
                    </div>
                    {event.details?.limit && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Limit: {event.details.limit} requests / {event.details.window || '60s'}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.created_at), 'HH:mm:ss')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Loading rate limit statistics...
          </div>
        )}

        {!isLoading && totalEvents === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No rate limit violations in the last 24 hours
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All endpoints are operating within limits
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
