import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useAlertHistory } from '../hooks/useAlertHistory';

export const AlertsTab = () => {
  const { data: alertHistory } = useAlertHistory();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alertHistory && alertHistory.length > 0 ? (
            alertHistory.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="font-medium">{alert.alert_type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {JSON.stringify(alert.details)}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(alert.sent_at), 'MMM d, HH:mm')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No alerts sent yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
