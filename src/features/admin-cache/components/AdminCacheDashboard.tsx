import { useCacheManagement } from "../hooks/useCacheManagement";
import { StorageStats } from "./StorageStats";
import { CachedDataViewer } from "./CachedDataViewer";
import { CacheControls } from "./CacheControls";
import { PerformanceTest } from "./PerformanceTest";
import { LoadingState } from "@/components/layout";

export default function AdminCacheDashboard() {
  const {
    stats,
    isLoading,
    loadStats,
    clearCache,
    clearAllCaches,
    clearByType,
    testPerformance,
    getSyncQueueStatus,
    clearSyncQueue,
  } = useCacheManagement();

  if (isLoading || !stats) {
    return <LoadingState message="Loading cache statistics..." />;
  }

  const syncQueueStatus = getSyncQueueStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cache Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage application cache and storage
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StorageStats
          total={stats.total}
          used={stats.used}
          available={stats.available}
          percentage={stats.percentage}
          entriesCount={stats.entries.length}
        />
        <PerformanceTest onTest={testPerformance} />
      </div>

      <CacheControls
        onClearAll={clearAllCaches}
        onClearByType={clearByType}
        onRefresh={loadStats}
        onClearSyncQueue={clearSyncQueue}
        syncQueueCount={syncQueueStatus.count}
      />

      <CachedDataViewer
        entries={stats.entries}
        onClearCache={clearCache}
      />
    </div>
  );
}
