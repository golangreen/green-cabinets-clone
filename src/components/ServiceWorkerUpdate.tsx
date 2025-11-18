/**
 * Service Worker Update Notification Component
 * 
 * Monitors for Service Worker updates and prompts users to reload
 * when a new version is available, preventing stale cache issues.
 */

import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

export function ServiceWorkerUpdate() {
  const { toast } = useToast();
  const [showReload, setShowReload] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('[SW] Registered:', swUrl);
      
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1 hour
      }
    },
    onRegisterError(error) {
      console.error('[SW] Registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowReload(true);
      
      toast({
        title: "Update Available",
        description: "A new version is available. Reload to update.",
        duration: Infinity,
        action: (
          <Button
            size="sm"
            onClick={() => {
              updateServiceWorker(true);
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload
          </Button>
        ),
      });
    }
  }, [needRefresh, toast, updateServiceWorker]);

  // Floating reload button (backup if toast is dismissed)
  if (showReload && needRefresh) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Button
          onClick={() => {
            updateServiceWorker(true);
          }}
          className="gap-2 shadow-lg"
          size="lg"
        >
          <RefreshCw className="h-4 w-4" />
          Update Available - Reload
        </Button>
      </div>
    );
  }

  return null;
}
