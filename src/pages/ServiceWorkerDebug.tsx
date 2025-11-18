/**
 * Service Worker Debug Admin Page
 * 
 * Provides tools for troubleshooting PWA and Service Worker issues:
 * - Manual update triggers
 * - Cache inspection and management
 * - Registration status monitoring
 * - SW lifecycle state viewing
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';
import {
  RefreshCw,
  Trash2,
  Power,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from 'lucide-react';

interface CacheInfo {
  name: string;
  size: number;
  keys: string[];
}

export default function ServiceWorkerDebug() {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [cacheList, setCacheList] = useState<CacheInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [swState, setSwState] = useState<{
    active: string | null;
    installing: string | null;
    waiting: string | null;
  }>({
    active: null,
    installing: null,
    waiting: null,
  });

  // Load SW registration and cache info
  useEffect(() => {
    loadServiceWorkerInfo();
    loadCacheInfo();
  }, []);

  const loadServiceWorkerInfo = async () => {
    if (!('serviceWorker' in navigator)) {
      toast({
        title: "Not Supported",
        description: "Service Workers are not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      setRegistration(reg || null);

      if (reg) {
        setSwState({
          active: reg.active?.state || null,
          installing: reg.installing?.state || null,
          waiting: reg.waiting?.state || null,
        });

        logger.info('SW registration loaded', {
          scope: reg.scope,
          updateViaCache: reg.updateViaCache,
        });
      }
    } catch (error) {
      logger.error('Failed to load SW registration', { error });
      toast({
        title: "Error",
        description: "Failed to load Service Worker information.",
        variant: "destructive",
      });
    }
  };

  const loadCacheInfo = async () => {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      const cacheInfos: CacheInfo[] = [];

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        
        cacheInfos.push({
          name,
          size: keys.length,
          keys: keys.map(req => req.url),
        });
      }

      setCacheList(cacheInfos);
      logger.info('Cache info loaded', { cacheCount: cacheInfos.length });
    } catch (error) {
      logger.error('Failed to load cache info', { error });
    }
  };

  const handleManualUpdate = async () => {
    if (!registration) {
      toast({
        title: "No Registration",
        description: "No Service Worker is registered.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await registration.update();
      logger.info('Manual SW update triggered');
      
      toast({
        title: "Update Triggered",
        description: "Checking for Service Worker updates...",
      });

      // Reload info after a delay
      setTimeout(() => {
        loadServiceWorkerInfo();
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      logger.error('Failed to trigger update', { error });
      setIsLoading(false);
      
      toast({
        title: "Update Failed",
        description: "Failed to check for updates.",
        variant: "destructive",
      });
    }
  };

  const handleUnregister = async () => {
    if (!registration) return;

    if (!confirm('Are you sure? This will unregister the Service Worker and require a page reload.')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await registration.unregister();
      
      if (success) {
        logger.info('SW unregistered successfully');
        
        toast({
          title: "Unregistered",
          description: "Service Worker unregistered. Reload the page to complete.",
          action: (
            <Button size="sm" onClick={() => window.location.reload()}>
              Reload
            </Button>
          ),
        });
        
        setRegistration(null);
      }
    } catch (error) {
      logger.error('Failed to unregister SW', { error });
      toast({
        title: "Unregister Failed",
        description: "Failed to unregister Service Worker.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async (cacheName: string) => {
    if (!confirm(`Delete cache "${cacheName}"?`)) return;

    setIsLoading(true);
    try {
      const deleted = await caches.delete(cacheName);
      
      if (deleted) {
        logger.info('Cache deleted', { cacheName });
        toast({
          title: "Cache Deleted",
          description: `"${cacheName}" has been deleted.`,
        });
        
        // Reload cache info
        await loadCacheInfo();
      }
    } catch (error) {
      logger.error('Failed to delete cache', { error, cacheName });
      toast({
        title: "Delete Failed",
        description: "Failed to delete cache.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllCaches = async () => {
    if (!confirm('Delete ALL caches? This will clear all offline data.')) return;

    setIsLoading(true);
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      logger.info('All caches cleared', { count: cacheNames.length });
      
      toast({
        title: "All Caches Cleared",
        description: `${cacheNames.length} cache(s) deleted.`,
      });
      
      setCacheList([]);
    } catch (error) {
      logger.error('Failed to clear all caches', { error });
      toast({
        title: "Clear Failed",
        description: "Failed to clear all caches.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipWaiting = () => {
    if (!registration?.waiting) {
      toast({
        title: "No Waiting Worker",
        description: "There is no waiting Service Worker to activate.",
        variant: "destructive",
      });
      return;
    }

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    logger.info('Skip waiting message sent to SW');
    
    toast({
      title: "Activating",
      description: "Activating new Service Worker...",
    });

    // Page will reload automatically when controller changes
  };

  const getStateColor = (state: string | null) => {
    if (!state) return 'secondary';
    switch (state) {
      case 'activated':
        return 'default';
      case 'installing':
        return 'default';
      case 'waiting':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Service Worker Debug</h1>
          <p className="text-muted-foreground">
            Troubleshoot PWA and Service Worker issues
          </p>
        </div>

        {/* Registration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {registration ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Registration Status
            </CardTitle>
            <CardDescription>
              {registration
                ? 'Service Worker is registered and active'
                : 'No Service Worker registered'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registration && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Scope</p>
                    <p className="text-sm text-muted-foreground">{registration.scope}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Update Via Cache</p>
                    <p className="text-sm text-muted-foreground">{registration.updateViaCache}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Lifecycle States</p>
                  <div className="flex gap-2">
                    {swState.active && (
                      <Badge variant={getStateColor(swState.active)}>
                        Active: {swState.active}
                      </Badge>
                    )}
                    {swState.installing && (
                      <Badge variant={getStateColor(swState.installing)}>
                        Installing: {swState.installing}
                      </Badge>
                    )}
                    {swState.waiting && (
                      <Badge variant={getStateColor(swState.waiting)}>
                        Waiting: {swState.waiting}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleManualUpdate}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Check for Updates
                  </Button>
                  
                  {swState.waiting && (
                    <Button
                      onClick={handleSkipWaiting}
                      variant="secondary"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Activate Waiting SW
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleUnregister}
                    disabled={isLoading}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Power className="h-4 w-4" />
                    Unregister
                  </Button>
                </div>
              </>
            )}

            {!registration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Reload the page to register a Service Worker</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cache Management */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Storage ({cacheList.length})
            </CardTitle>
            <CardDescription>
              View and manage cached resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cacheList.length > 0 && (
              <Button
                onClick={handleClearAllCaches}
                disabled={isLoading}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Caches
              </Button>
            )}

            <div className="space-y-3">
              {cacheList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No caches found</p>
              ) : (
                cacheList.map((cache) => (
                  <Card key={cache.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium">{cache.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cache.size} cached item{cache.size !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleClearCache(cache.name)}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                      
                      {cache.keys.length > 0 && (
                        <details className="mt-3">
                          <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                            View cached URLs
                          </summary>
                          <ul className="mt-2 space-y-1 text-xs text-muted-foreground max-h-40 overflow-y-auto">
                            {cache.keys.slice(0, 20).map((url, idx) => (
                              <li key={idx} className="truncate">{url}</li>
                            ))}
                            {cache.keys.length > 20 && (
                              <li className="text-xs italic">
                                ...and {cache.keys.length - 20} more
                              </li>
                            )}
                          </ul>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Site won't open after deployment:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Click "Check for Updates" above</li>
                <li>If waiting worker exists, click "Activate Waiting SW"</li>
                <li>Test in incognito/private window to bypass cache</li>
                <li>Clear all caches and reload</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium">Old content showing after update:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Clear specific cache that contains stale content</li>
                <li>Unregister SW and reload page</li>
                <li>Check manifest start_url and scope are correct</li>
              </ul>
            </div>

            <div>
              <p className="font-medium">Update notification not appearing:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Check console for SW update logs</li>
                <li>Verify skipWaiting and clientsClaim are enabled</li>
                <li>Manually trigger update check above</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
