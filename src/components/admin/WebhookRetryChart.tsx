import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RetryData {
  date: string;
  total_events: number;
  retry_events: number;
  retry_rate: number;
}

export function WebhookRetryChart() {
  const [data, setData] = useState<RetryData[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchRetryHistory();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchRetryHistory, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Webhook Retry History</CardTitle>
          <CardDescription>Retry patterns over the last 7 days</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={fetchRetryHistory}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
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
