/**
 * Service Worker Update Notification
 * Alerts users when new versions are available and provides reload action
 */

import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { logger } from '@/lib/logger';

export const ServiceWorkerUpdateNotification = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);

  const reloadPage = useCallback(() => {
    logger.info('User triggered page reload for SW update');
    window.location.reload();
  }, []);

  const handleUpdateFound = useCallback((reg: ServiceWorkerRegistration) => {
    logger.info('Service Worker update detected', {
      installing: reg.installing?.state,
      waiting: reg.waiting?.state,
      active: reg.active?.state,
    });

    const newWorker = reg.installing || reg.waiting;
    
    if (!newWorker) return;

    const handleStateChange = () => {
      logger.info('Service Worker state changed', {
        state: newWorker.state,
        scriptURL: newWorker.scriptURL,
      });

      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker installed and ready
        setShowReloadPrompt(true);
        
        toast({
          title: "Update Available",
          description: "A new version of the app is available. Reload to update.",
          action: (
            <Button 
              size="sm" 
              variant="outline"
              onClick={reloadPage}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </Button>
          ),
          duration: Infinity, // Don't auto-dismiss
        });
        
        logger.info('Update notification shown to user');
      }
    };

    newWorker.addEventListener('statechange', handleStateChange);
  }, [reloadPage]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported - update notifications disabled');
      return;
    }

    // Get existing registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setRegistration(reg);
        
        // Check if there's already a waiting worker
        if (reg.waiting) {
          handleUpdateFound(reg);
        }
        
        // Listen for new updates
        reg.addEventListener('updatefound', () => {
          handleUpdateFound(reg);
        });
      }
    });

    // Listen for controller change (new SW activated)
    const handleControllerChange = () => {
      logger.info('Service Worker controller changed - reloading page');
      
      if (showReloadPrompt) {
        // Auto-reload if user hasn't reloaded yet
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check for updates periodically (every 60 seconds)
    const updateCheckInterval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          logger.info('Checking for Service Worker updates...');
          reg.update().catch((error) => {
            logger.error('Failed to check for updates', { error });
          });
        }
      });
    }, 60000); // 60 seconds

    // Cleanup
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(updateCheckInterval);
    };
  }, [handleUpdateFound, showReloadPrompt]);

  // Also check for updates when the page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && registration) {
        logger.info('Page visible - checking for updates');
        registration.update().catch((error) => {
          logger.error('Failed to check for updates on visibility change', { error });
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [registration]);

  // Persistent banner when update is available (in addition to toast)
  if (showReloadPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Update Available</h4>
            <p className="text-sm text-muted-foreground mb-3">
              A new version is ready. Reload to get the latest features and fixes.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={reloadPage}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Now
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowReloadPrompt(false)}
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
