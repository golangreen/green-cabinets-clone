import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast as sonnerToast } from 'sonner';
import { toast } from '@/hooks/use-toast';
import { LiveStatusIndicator } from './LiveStatusIndicator';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';

interface RetryData {
  date: string;
  total_events: number;
  retry_events: number;
  retry_rate: number;
}

export function WebhookRetryChart() {
  const [data, setData] = useState<RetryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const { shouldShowNotification } = useNotificationSettings();

  const fetchRetryHistory = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: webhookEvents, error } = await supabase
        .from('webhook_events')
        .select('created_at, retry_count')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData: Record<string, { total: number; retries: number }> = {};
      
      webhookEvents?.forEach((event) => {
        const date = new Date(event.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        if (!groupedData[date]) {
          groupedData[date] = { total: 0, retries: 0 };
        }
        
        groupedData[date].total += 1;
        if (event.retry_count > 0) {
          groupedData[date].retries += 1;
        }
      });

      // Convert to array format for chart
      const chartData: RetryData[] = Object.entries(groupedData).map(([date, stats]) => ({
        date,
        total_events: stats.total,
        retry_events: stats.retries,
        retry_rate: stats.total > 0 ? (stats.retries / stats.total) * 100 : 0
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching retry history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: webhookEvents, error } = await supabase
        .from('webhook_events')
        .select('svix_id, event_type, client_ip, retry_count, created_at, processed_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!webhookEvents || webhookEvents.length === 0) {
        sonnerToast.error('No data available to export');
        return;
      }

      // Create CSV header
      const headers = ['Date', 'Time', 'Webhook ID', 'Event Type', 'Client IP', 'Retry Count', 'Processed At'];
      
      // Create CSV rows
      const rows = webhookEvents.map(event => {
        const createdDate = new Date(event.created_at);
        const processedDate = event.processed_at ? new Date(event.processed_at) : null;
        
        return [
          createdDate.toLocaleDateString(),
          createdDate.toLocaleTimeString(),
          event.svix_id,
          event.event_type,
          event.client_ip || 'N/A',
          event.retry_count.toString(),
          processedDate ? processedDate.toLocaleString() : 'N/A'
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `webhook-retry-history-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      sonnerToast.success(`Exported ${webhookEvents.length} webhook events to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      sonnerToast.error('Failed to export data');
    }
  };

  useEffect(() => {
    fetchRetryHistory();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('webhook-events-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_events'
        },
        (payload) => {
          console.log('New webhook event detected, refreshing chart...');
          
          const event = payload.new as { 
            svix_id: string; 
            event_type: string; 
            retry_count: number;
            client_ip: string;
          };
          
          // Show toast for high retry counts
          if (shouldShowNotification('webhook_retry', 'high', event.retry_count)) {
            toast({
              title: '🔴 Excessive Webhook Retries',
              description: `${event.event_type} has failed ${event.retry_count} times from ${event.client_ip}`,
              variant: 'destructive',
            });
          }
          
          fetchRetryHistory();
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });
    
    return () => {
      setIsRealtimeConnected(false);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Webhook Retry History</CardTitle>
          <CardDescription>Retry patterns over the last 7 days</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <LiveStatusIndicator isConnected={isRealtimeConnected} />
          <Button 
            variant="outline" 
            size="icon"
            onClick={exportToCSV}
            disabled={loading || data.length === 0}
            title="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchRetryHistory}
            disabled={loading}
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No webhook data available for the last 7 days
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'retry_rate') {
                      return [`${value.toFixed(2)}%`, 'Retry Rate'];
                    }
                    return [value, name === 'total_events' ? 'Total Events' : 'Retry Events'];
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    if (value === 'total_events') return 'Total Events';
                    if (value === 'retry_events') return 'Retry Events';
                    if (value === 'retry_rate') return 'Retry Rate (%)';
                    return value;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total_events" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="retry_events" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="retry_rate" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--warning))' }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {data.reduce((sum, d) => sum + d.total_events, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {data.reduce((sum, d) => sum + d.retry_events, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Retry Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {(
                    (data.reduce((sum, d) => sum + d.retry_events, 0) / 
                    Math.max(data.reduce((sum, d) => sum + d.total_events, 0), 1)) * 100
                  ).toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Retry Rate</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
