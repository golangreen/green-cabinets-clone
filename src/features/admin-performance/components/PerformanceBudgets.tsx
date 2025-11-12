import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { PERFORMANCE_BUDGETS } from '@/lib/performance';
import type { PerformanceReport } from '@/types/performance';

interface PerformanceBudgetsProps {
  summary: PerformanceReport | null;
  isLoading: boolean;
}

export function PerformanceBudgets({ summary, isLoading }: PerformanceBudgetsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
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

  const getBudgetStatus = (metricName: string, value: number) => {
    const budget = PERFORMANCE_BUDGETS[metricName as keyof typeof PERFORMANCE_BUDGETS];
    if (!budget) return { status: 'unknown', percentage: 0, color: 'text-muted-foreground' };
    
    const percentage = (value / budget) * 100;
    
    if (percentage <= 100) {
      return { status: 'good', percentage, color: 'text-green-500', icon: CheckCircle };
    } else if (percentage <= 150) {
      return { status: 'warning', percentage, color: 'text-yellow-500', icon: AlertTriangle };
    } else {
      return { status: 'critical', percentage, color: 'text-red-500', icon: XCircle };
    }
  };

  const webVitals = ['LCP', 'CLS', 'TTFB', 'INP'];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-5 w-5 text-[#2dd4bf]" />
        <h3 className="text-lg font-semibold">Performance Budgets</h3>
      </div>

      <div className="space-y-4">
        {webVitals.map((metric) => {
          const stats = summary.metrics[metric];
          if (!stats) return null;

          const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
          const { status, percentage, color, icon: Icon } = getBudgetStatus(metric, stats.avg);

          return (
            <div key={metric} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className={`h-4 w-4 ${color}`} />}
                  <span className="font-medium">{metric}</span>
                  <span className="text-xs text-muted-foreground">
                    (Budget: {budget}{metric === 'CLS' ? '' : 'ms'})
                  </span>
                </div>
                <span className={`text-sm font-semibold ${color}`}>
                  {stats.avg.toFixed(0)}{metric === 'CLS' ? '' : 'ms'}
                </span>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>P50: {stats.p50.toFixed(0)}{metric === 'CLS' ? '' : 'ms'}</span>
                <span>P75: {stats.p75.toFixed(0)}{metric === 'CLS' ? '' : 'ms'}</span>
                <span>P95: {stats.p95.toFixed(0)}{metric === 'CLS' ? '' : 'ms'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {summary.regressions.length > 0 && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h4 className="font-semibold text-red-500 mb-2">Regressions Detected</h4>
          <ul className="space-y-1 text-sm">
            {summary.regressions.map((reg, i) => (
              <li key={i} className="text-muted-foreground">
                {reg.metric}: {reg.change > 0 ? '+' : ''}{reg.change.toFixed(1)}% change
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
