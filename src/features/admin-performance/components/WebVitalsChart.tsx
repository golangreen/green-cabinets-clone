import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';
import { PERFORMANCE_BUDGETS } from '@/lib/performance';
import type { PerformanceReport } from '@/types/performance';

interface WebVitalsChartProps {
  summary: PerformanceReport | null;
  isLoading: boolean;
}

export function WebVitalsChart({ summary, isLoading }: WebVitalsChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">No data available</p>
      </Card>
    );
  }

  const webVitalsData = ['LCP', 'CLS', 'TTFB', 'INP']
    .filter(metric => summary.metrics[metric])
    .map(metric => ({
      name: metric,
      avg: summary.metrics[metric].avg,
      p50: summary.metrics[metric].p50,
      p95: summary.metrics[metric].p95,
      budget: PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS],
    }));

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-[#2dd4bf]" />
        <h3 className="text-lg font-semibold">Web Vitals Performance</h3>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={webVitalsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avg" fill="#2dd4bf" name="Average" />
          <Bar dataKey="p50" fill="#60a5fa" name="P50" />
          <Bar dataKey="p95" fill="#f59e0b" name="P95" />
          {webVitalsData.map((entry, index) => (
            <ReferenceLine
              key={index}
              y={entry.budget}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: 'Budget', position: 'right' }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(summary.metrics).slice(0, 4).map(([name, stats]) => (
          <div key={name} className="text-center">
            <p className="text-sm text-muted-foreground">{name}</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.avg.toFixed(0)}
              <span className="text-xs ml-1">
                {name === 'CLS' ? '' : 'ms'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.count} samples
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
