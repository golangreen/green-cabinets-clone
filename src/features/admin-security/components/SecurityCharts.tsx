import { useQuery } from '@tanstack/react-query';
import { getSecuritySummary, getSuspiciousIPs, getRecentEventCount, getActiveBlocksCount } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Shield, Activity } from 'lucide-react';
import { QUERY_KEYS, FEATURE_STALE_TIMES } from '@/config';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export const SecurityCharts = () => {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: QUERY_KEYS.SECURITY_SUMMARY,
    queryFn: () => getSecuritySummary(1440),
    refetchInterval: 30000,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });

  const { data: suspiciousIps, isLoading: ipsLoading } = useQuery({
    queryKey: QUERY_KEYS.SUSPICIOUS_IPS,
    queryFn: () => getSuspiciousIPs(1440, 3),
    refetchInterval: 30000,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });

  const { data: recentEvents } = useQuery({
    queryKey: QUERY_KEYS.RECENT_EVENT_COUNT,
    queryFn: () => getRecentEventCount(60),
    refetchInterval: 10000,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });

  const { data: activeBlocks } = useQuery({
    queryKey: QUERY_KEYS.ACTIVE_BLOCKS_COUNT,
    queryFn: getActiveBlocksCount,
    refetchInterval: 10000,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });

  if (summaryLoading || ipsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const totalEvents = summary?.reduce((sum, item) => sum + Number(item.event_count), 0) || 0;
  const criticalEvents = summary?.filter(item => item.severity === 'critical').reduce((sum, item) => sum + Number(item.event_count), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {recentEvents} in last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious IPs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspiciousIps?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Multiple violations detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBlocks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently blocked IPs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && summary.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="event_type" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="event_count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && summary.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={summary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.severity}: ${entry.event_count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="event_count"
                  >
                    {summary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
