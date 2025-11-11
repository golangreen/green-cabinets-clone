import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export const CronJobStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRun = async () => {
    try {
      setIsRefreshing(true);
      
      const { error } = await supabase.functions.invoke('check-role-expiration');

      if (error) throw error;

      toast.success('Role expiration check completed successfully');
    } catch (error: any) {
      console.error('Error running manual check:', error);
      toast.error(error.message || 'Failed to run check');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Automated Scheduling
            </CardTitle>
            <CardDescription>
              Role expiration checks run automatically every hour
            </CardDescription>
          </div>
          <Button
            onClick={handleManualRun}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Run Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Cron job is active and runs automatically
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">check-role-expiration-hourly</span>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Schedule: Every hour at minute 0 (0 * * * *)</span>
              </div>
              
              <div className="text-xs">
                <p className="font-medium mb-1">Actions performed:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Send 3-day expiration reminders</li>
                  <li>Send 24-hour final reminders</li>
                  <li>Remove expired roles</li>
                  <li>Send expiration notifications</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p className="font-medium mb-1">Next scheduled run:</p>
            <p>Top of the next hour (XX:00)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
