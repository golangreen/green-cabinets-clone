import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Clock, Play, Pause, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface CronJob {
  jobid: number;
  schedule: string;
  command: string;
  nodename: string;
  nodeport: number;
  database: string;
  username: string;
  active: boolean;
  jobname: string;
}

export const CronJobsManager = () => {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    fetchCronJobs();
    fetchLastRun();
  }, []);

  const fetchCronJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      // Cron jobs are managed at the database level
      // We just display the known configuration
      setCronJobs([]);
    } catch (error) {
      logger.dbError('fetch cron jobs', error);
    }
  }, []);

  const fetchLastRun = useCallback(async () => {
    try {
      // Query the most recent role_change_audit entry to get last activity time
      const { data, error } = await supabase
        .from('role_change_audit')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setLastRun(data.created_at);
      }
    } catch (error) {
      logger.dbError('fetch last cron run', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatSchedule = (schedule: string) => {
    const scheduleMap: Record<string, string> = {
      '0 * * * *': 'Every hour',
      '*/30 * * * *': 'Every 30 minutes',
      '0 0 * * *': 'Daily at midnight',
      '0 */6 * * *': 'Every 6 hours',
    };
    return scheduleMap[schedule] || schedule;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Scheduled Jobs</CardTitle>
            </div>
            <CardDescription>
              Automated role expiration checks running on schedule
            </CardDescription>
          </div>
          <Button onClick={fetchCronJobs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Role Expiration Check - Active</p>
              <p className="text-sm">Schedule: Every hour (0 * * * *)</p>
              {lastRun && (
                <p className="text-xs text-muted-foreground">
                  Last notification sent: {new Date(lastRun).toLocaleString()}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">check-role-expiration-hourly</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Hourly
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Checks for expiring roles and sends notifications
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>• 3-day advance warning</span>
                <span>• 24-hour final reminder</span>
                <span>• Auto-remove expired roles</span>
              </div>
            </div>
            <Button 
              onClick={async () => {
                try {
                  await supabase.functions.invoke('check-role-expiration');
                  toast.success('Manual check triggered successfully');
                  fetchLastRun();
                } catch (error) {
                  logger.edgeFunctionError('check-role-expiration', error);
                  toast.error('Failed to trigger check');
                }
              }} 
              size="sm" 
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Test Run
            </Button>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Runs automatically every hour</li>
              <li>Sends 3-day reminders for roles expiring in 72 hours</li>
              <li>Sends 24-hour final reminders</li>
              <li>Removes expired roles and notifies users</li>
              <li>Logs all actions for audit purposes</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Need to modify the schedule? Contact your database administrator or use the test endpoint for manual triggers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
