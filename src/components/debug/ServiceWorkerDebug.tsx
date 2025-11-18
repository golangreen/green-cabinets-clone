/**
 * Service Worker Debug Panel
 * Visual debugging component for Service Worker status and operations
 * Only shown in development or when ?debug=true query param is present
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, Power, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import {
  getServiceWorkerStatus,
  checkForUpdates,
  getCacheStats,
  clearAllCaches,
  unregisterServiceWorker,
  skipWaiting,
  logServiceWorkerDiagnostics,
  type ServiceWorkerStatus,
} from '@/lib/serviceWorkerMonitoring';
import { useToast } from '@/hooks';

export const ServiceWorkerDebug = () => {
  const [status, setStatus] = useState<ServiceWorkerStatus | null>(null);
  const [cacheStats, setCacheStats] = useState<{ cacheNames: string[]; totalSize: number; cacheCount: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadStatus = async () => {
    const swStatus = await getServiceWorkerStatus();
    const stats = await getCacheStats();
    setStatus(swStatus);
    setCacheStats(stats);
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleCheckUpdates = async () => {
    setLoading(true);
    const hasUpdate = await checkForUpdates();
    toast({
      title: hasUpdate ? 'Update Available' : 'No Updates',
      description: hasUpdate ? 'A new version is being installed' : 'You have the latest version',
      variant: hasUpdate ? 'default' : 'default',
    });
    await loadStatus();
    setLoading(false);
  };

  const handleClearCaches = async () => {
    setLoading(true);
    const count = await clearAllCaches();
    toast({
      title: 'Caches Cleared',
      description: `Cleared ${count} cache${count !== 1 ? 's' : ''}`,
    });
    await loadStatus();
    setLoading(false);
  };

  const handleUnregister = async () => {
    setLoading(true);
    const success = await unregisterServiceWorker();
    toast({
      title: success ? 'Service Worker Unregistered' : 'Failed',
      description: success ? 'Refresh the page to complete removal' : 'Could not unregister Service Worker',
      variant: success ? 'default' : 'destructive',
    });
    await loadStatus();
    setLoading(false);
  };

  const handleSkipWaiting = async () => {
    await skipWaiting();
    toast({
      title: 'Activating Update',
      description: 'New Service Worker will activate shortly',
    });
    setTimeout(loadStatus, 1000);
  };

  const handleDiagnostics = async () => {
    await logServiceWorkerDiagnostics();
    toast({
      title: 'Diagnostics Logged',
      description: 'Check browser console for full details',
    });
  };

  if (!status) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Service Worker Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const StatusIcon = status.active ? CheckCircle : status.error ? XCircle : Clock;
  const statusColor = status.active ? 'text-green-600' : status.error ? 'text-red-600' : 'text-yellow-600';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${statusColor}`} />
          Service Worker Debug Panel
        </CardTitle>
        <CardDescription>
          Monitor and control Service Worker in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Status</h3>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant={status.registered ? 'default' : 'secondary'}>
              {status.registered ? 'Registered' : 'Not Registered'}
            </Badge>
            <Badge variant={status.active ? 'default' : 'secondary'}>
              {status.active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant={status.controller ? 'default' : 'secondary'}>
              {status.controller ? 'Controlling' : 'No Control'}
            </Badge>
            <Badge variant={status.waiting ? 'default' : 'secondary'}>
              {status.waiting ? 'Update Waiting' : 'Current'}
            </Badge>
          </div>
          {status.updating && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Update in progress...</span>
            </div>
          )}
          {status.error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{status.error.message}</span>
            </div>
          )}
        </div>

        {/* Cache Stats Section */}
        {cacheStats && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Cache Storage</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Caches</div>
                <div className="font-semibold">{cacheStats.cacheCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Est. Size</div>
                <div className="font-semibold">
                  {(cacheStats.totalSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Entries</div>
                <div className="font-semibold">{cacheStats.cacheNames.length}</div>
              </div>
            </div>
            {cacheStats.cacheNames.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Cache Names:</div>
                <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                  {cacheStats.cacheNames.map((name, idx) => (
                    <div key={idx} className="truncate">{name}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions Section */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleCheckUpdates}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Check Updates
            </Button>
            
            {status.waiting && (
              <Button
                onClick={handleSkipWaiting}
                variant="default"
                size="sm"
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate Update
              </Button>
            )}
            
            <Button
              onClick={handleClearCaches}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Caches
            </Button>
            
            <Button
              onClick={handleUnregister}
              disabled={loading}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Power className="h-4 w-4 mr-2" />
              Unregister
            </Button>
            
            <Button
              onClick={handleDiagnostics}
              variant="outline"
              size="sm"
              className="w-full col-span-2"
            >
              Log Diagnostics
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>Debug Mode Active</strong><br />
          This panel is visible because you're in development or using ?debug=true.<br />
          Production users won't see this panel.
        </div>
      </CardContent>
    </Card>
  );
};
