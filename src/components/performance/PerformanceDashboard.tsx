/**
 * Performance Dashboard Component
 * 
 * Displays Core Web Vitals, bundle sizes, and performance metrics over time
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { getPerformanceMetrics, getAverageMetrics, getMetricsByUrl } from '@/services/performanceService';
import { estimateBundleSize, formatBytes, PERFORMANCE_THRESHOLDS } from '@/lib/performance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Activity, Zap, TrendingUp, HardDrive } from 'lucide-react';

const PerformanceDashboard = () => {
  const [bundleSize, setBundleSize] = useState({ js: 0, css: 0, total: 0 });
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Get date range based on selection
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }
    
    return { startDate, endDate };
  };

  // Fetch metrics
  const { data: metrics = [] } = useQuery({
    queryKey: ['performance-metrics', timeRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      return getPerformanceMetrics(startDate, endDate);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch average metrics
  const { data: averages = [] } = useQuery({
    queryKey: ['performance-averages', timeRange],
    queryFn: async () => {
      const days = timeRange === '1h' ? 1 : timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      return getAverageMetrics(days);
    },
    refetchInterval: 60000,
  });

  // Fetch metrics by URL
  const { data: urlMetrics = [] } = useQuery({
    queryKey: ['performance-by-url', timeRange],
    queryFn: async () => {
      const days = timeRange === '1h' ? 1 : timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      return getMetricsByUrl(days);
    },
    refetchInterval: 60000,
  });

  // Calculate bundle size on mount
  useEffect(() => {
    const size = estimateBundleSize();
    setBundleSize(size);
  }, []);

  // Prepare chart data
  const chartData = metrics.reduce((acc, metric) => {
    const timestamp = new Date(metric.timestamp).toLocaleTimeString();
    const existing = acc.find(item => item.timestamp === timestamp);
    
    if (existing) {
      existing[metric.metric_name] = metric.metric_value;
    } else {
      acc.push({
        timestamp,
        [metric.metric_name]: metric.metric_value,
      });
    }
    
    return acc;
  }, [] as any[]);

  // Get metric rating color
  const getRatingColor = (metricName: string, value: number) => {
    const thresholds = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!thresholds) return 'text-muted-foreground';
    
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Performance Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor Core Web Vitals, bundle sizes, and performance metrics over time
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['1h', '24h', '7d', '30d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {range === '1h' ? 'Last Hour' : range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        ))}
      </div>

      {/* Bundle Size Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Bundle Size
          </CardTitle>
          <CardDescription>Current bundle size breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">JavaScript</p>
              <p className="text-2xl font-bold">{formatBytes(bundleSize.js)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">CSS</p>
              <p className="text-2xl font-bold">{formatBytes(bundleSize.css)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{formatBytes(bundleSize.total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {averages.map((avg) => (
          <Card key={avg.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {avg.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRatingColor(avg.name, avg.average)}`}>
                {avg.average.toFixed(2)}
                {avg.name === 'CLS' ? '' : 'ms'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {avg.count} samples
              </p>
              <p className="text-xs text-muted-foreground">
                Range: {avg.min.toFixed(0)} - {avg.max.toFixed(0)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="urls">By URL</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics Over Time
              </CardTitle>
              <CardDescription>
                Core Web Vitals tracked over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="LCP" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="INP" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="TTFB" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance by URL
              </CardTitle>
              <CardDescription>
                Average metrics grouped by page route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urlMetrics.map((urlData) => (
                  <div key={urlData.url} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{urlData.url || '/'}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={urlData.metrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="average" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
