import { useState } from 'react';
import { MetricFilters } from './MetricFilters';
import { WebVitalsChart } from './WebVitalsChart';
import { SlowestOperationsTable } from './SlowestOperationsTable';
import { PerformanceBudgets } from './PerformanceBudgets';
import { usePerformanceSummary, useSlowOperations } from '../hooks/usePerformanceMetrics';

export function PerformanceDashboard() {
  const [filters, setFilters] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(endDate.getHours() - 24);
    return { startDate, endDate };
  });

  const { data: summary, isLoading: summaryLoading } = usePerformanceSummary(
    filters.startDate,
    filters.endDate
  );

  const { data: slowOperations, isLoading: opsLoading } = useSlowOperations(
    filters.startDate,
    filters.endDate,
    10
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
        <p className="text-gray-600">
          Monitor Web Vitals, track performance budgets, and identify slow operations
        </p>
      </div>

      <MetricFilters onFilterChange={setFilters} />

      <div className="grid gap-6 lg:grid-cols-2">
        <WebVitalsChart summary={summary || null} isLoading={summaryLoading} />
        <PerformanceBudgets summary={summary || null} isLoading={summaryLoading} />
      </div>

      <SlowestOperationsTable 
        operations={slowOperations || []} 
        isLoading={opsLoading} 
      />
    </div>
  );
}
