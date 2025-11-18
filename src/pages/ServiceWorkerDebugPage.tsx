/**
 * Service Worker Debug Page
 * Accessible via /sw-debug route (only in development or with ?debug=true)
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceWorkerDebug } from '@/components/debug/ServiceWorkerDebug';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ServiceWorkerDebugPage = () => {
  const navigate = useNavigate();
  const isDevelopment = import.meta.env.DEV;
  const hasDebugParam = new URLSearchParams(window.location.search).get('debug') === 'true';

  useEffect(() => {
    // Redirect if not in development and no debug param
    if (!isDevelopment && !hasDebugParam) {
      navigate('/', { replace: true });
    }
  }, [isDevelopment, hasDebugParam, navigate]);

  if (!isDevelopment && !hasDebugParam) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Service Worker Debug</h1>
            <p className="text-muted-foreground">
              Monitor and troubleshoot Service Worker behavior
            </p>
          </div>
        </div>

        <ServiceWorkerDebug />

        <div className="bg-muted p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Common Issues & Solutions</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-foreground">Blank Screen After Deploy:</strong>
              <p className="text-muted-foreground">
                Clear caches and check for waiting updates. New SW should activate automatically.
              </p>
            </div>
            
            <div>
              <strong className="text-foreground">Update Not Applying:</strong>
              <p className="text-muted-foreground">
                Click "Activate Update" if one is waiting, or do a hard refresh (Ctrl+Shift+R).
              </p>
            </div>
            
            <div>
              <strong className="text-foreground">Cache Growing Too Large:</strong>
              <p className="text-muted-foreground">
                Use "Clear Caches" to remove old cached assets. They'll be re-cached on next visit.
              </p>
            </div>
            
            <div>
              <strong className="text-foreground">Service Worker Not Registering:</strong>
              <p className="text-muted-foreground">
                Check console for errors. Ensure site is served over HTTPS in production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerDebugPage;
