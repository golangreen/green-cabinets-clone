import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingDown } from 'lucide-react';
import type { PerformanceMetric } from '@/types/performance';
import { formatDistanceToNow } from 'date-fns';

interface SlowestOperationsTableProps {
  operations: PerformanceMetric[];
  isLoading: boolean;
}

export function SlowestOperationsTable({ operations, isLoading }: SlowestOperationsTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown className="h-5 w-5 text-[#f59e0b]" />
        <h3 className="text-lg font-semibold">Slowest Operations</h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No slow operations detected
                </TableCell>
              </TableRow>
            ) : (
              operations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.metric_name}</TableCell>
                  <TableCell>
                    <span className={op.metric_value > 3000 ? 'text-red-500 font-semibold' : 'text-foreground'}>
                      {op.metric_value.toFixed(0)} ms
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={op.url}>
                    {new URL(op.url).pathname}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {op.connection_type || 'Unknown'}
                    {op.device_memory && ` • ${op.device_memory}GB`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(op.timestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
