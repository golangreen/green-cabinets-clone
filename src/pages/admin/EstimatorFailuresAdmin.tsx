import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  fetchValidationFailures,
  aggregateFailures,
} from '@/services/validationFailuresService';
import { getDoorStyleById, getFinishById } from '@/lib/estimator/finishes-data';
import { getTierLabel } from '@/lib/estimator/compatibility';

export default function EstimatorFailuresAdmin() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['estimator-validation-failures', 30],
    queryFn: () => fetchValidationFailures(30),
    staleTime: 60_000,
  });

  const rows = data ?? [];
  const aggregates = aggregateFailures(rows);
  const totalEvents = rows.length;
  const uniqueSessions = new Set(rows.map(r => r.session_id).filter(Boolean)).size;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <Helmet><title>Estimator Validation Failures · Admin</title></Helmet>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Estimator validation failures</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Incompatible door-style / finish combinations users attempted in the last 30 days.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total events" value={totalEvents} />
        <StatCard label="Unique sessions" value={uniqueSessions} />
        <StatCard label="Distinct combos" value={aggregates.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top incompatible combinations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="animate-spin" size={16} /> Loading…
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-sm text-destructive py-8 justify-center">
              <AlertTriangle size={16} /> Failed to load failures.
            </div>
          ) : aggregates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No validation failures recorded in the selected window.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Door style</TableHead>
                    <TableHead>Finish</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Events</TableHead>
                    <TableHead className="text-right">Sessions</TableHead>
                    <TableHead>Last seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregates.slice(0, 100).map(a => {
                    const door = getDoorStyleById(a.door_style)?.name ?? a.door_style;
                    const finish = getFinishById(a.finish_id);
                    const finishLabel = finish
                      ? (finish.brand ? `${finish.brand} — ${finish.name}` : finish.name)
                      : a.finish_id;
                    const tierLabel = a.material_tier
                      ? getTierLabel(a.material_tier as Parameters<typeof getTierLabel>[0])
                      : '—';
                    return (
                      <TableRow key={`${a.door_style}|${a.finish_id}`}>
                        <TableCell className="font-medium">{door}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{finishLabel}</span>
                            {a.finish_brand && (
                              <span className="text-xs text-muted-foreground">{a.finish_brand}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{tierLabel}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{a.count}</TableCell>
                        <TableCell className="text-right tabular-nums">{a.unique_sessions}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(a.last_seen).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold mt-1 tabular-nums">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}
