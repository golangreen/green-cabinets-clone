import { useCallback } from 'react';
import { logger } from '@/lib/logger';
import { useCronJobManagement } from '../hooks/useCronJobManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Play, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const CronJobsManager = () => {
  const { cronJobs, isLoading, triggerCheck, isTriggering } = useCronJobManagement();

  const fetchCronJobs = useCallback(() => {
    // Refetch is handled by React Query
    logger.info('Refreshing cron jobs', { component: 'CronJobsManager' });
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
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {cronJobs?.map((job) => (
            <div key={job.jobname} className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{job.jobname}</span>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Hourly
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {job.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {job.actions.map((action, idx) => (
                    <span key={idx}>• {action}</span>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => triggerCheck()} 
                size="sm" 
                variant="outline"
                disabled={isTriggering}
              >
                <Play className="h-4 w-4 mr-2" />
                Test Run
              </Button>
            </div>
          ))}
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
