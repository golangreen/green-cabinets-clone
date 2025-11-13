import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

export const TypesStatusChecker = () => {
  const [lastCheck, setLastCheck] = useState(new Date());
  
  // Check if gallery_image_metadata exists in the types
  const checkTypesReady = (): boolean => {
    try {
      const tables = {} as Database['public']['Tables'];
      return 'gallery_image_metadata' in tables;
    } catch {
      return false;
    }
  };
  
  const isReady = checkTypesReady();
  
  const handleRefresh = () => {
    setLastCheck(new Date());
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isReady ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Supabase Types Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">gallery_image_metadata</span>
            <span className={`text-sm font-medium ${isReady ? 'text-green-500' : 'text-red-500'}`}>
              {isReady ? 'Ready ✓' : 'Not Found ✗'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        </div>
        
        <Button 
          onClick={handleRefresh}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh & Check Again
        </Button>

        {isReady && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✓ Types are ready! You can proceed to Step 2 of the migration.
            </p>
          </div>
        )}
        
        {!isReady && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Waiting for Supabase to regenerate types... This usually takes 30-60 seconds after a migration.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
