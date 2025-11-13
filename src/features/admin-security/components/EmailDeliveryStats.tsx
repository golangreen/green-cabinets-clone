import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchEmailDeliveryStats, fetchRecentEmailLogs } from '@/services';
import { QUERY_KEYS, FEATURE_STALE_TIMES } from '@/config';

interface EmailLog {
  id: string;
  email_id: string;
  recipient_email: string;
  email_type: string;
  subject: string;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const EmailDeliveryStats = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: QUERY_KEYS.EMAIL_DELIVERY_STATS,
    queryFn: () => fetchEmailDeliveryStats(7),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });

  const { data: recentEmails, isLoading: emailsLoading } = useQuery({
    queryKey: QUERY_KEYS.RECENT_EMAIL_LOGS,
    queryFn: () => fetchRecentEmailLogs(50),
    refetchInterval: 30000,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'bounced':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'complained':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-500" />;
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      delivered: 'default',
      bounced: 'destructive',
      failed: 'destructive',
      complained: 'secondary',
      sent: 'outline'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getEmailTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      '3day': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      '1day': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'expired': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    return (
      <Badge variant="outline" className={colors[type]}>
        {type === '3day' ? '3-Day' : type === '1day' ? 'Final' : 'Expired'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Email Delivery Tracking</CardTitle>
        </div>
        <CardDescription>
          Monitor role expiration notification delivery status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="logs">Recent Emails</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            {statsLoading ? (
              <p className="text-sm text-muted-foreground">Loading statistics...</p>
            ) : stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Total Sent</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.sent || 0}</p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Delivered</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.delivered || 0}</p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Delivery Rate</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.deliveryRate.toFixed(1) || 0}%</p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-muted-foreground">Bounced</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.bounced || 0}</p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-muted-foreground">Delayed</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.delayed || 0}</p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-muted-foreground">Complaints</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.complained || 0}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                  Statistics for the last 7 days
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No email statistics available yet
              </p>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-3">
            {emailsLoading ? (
              <p className="text-sm text-muted-foreground">Loading logs...</p>
            ) : recentEmails && recentEmails.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentEmails.map((email) => (
                  <div
                    key={email.id}
                    className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(email.status)}
                          <span className="font-medium text-sm truncate">
                            {email.recipient_email}
                          </span>
                          {getEmailTypeBadge(email.email_type)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {email.subject}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          {getStatusBadge(email.status)}
                          {email.role && (
                            <Badge variant="outline" className="capitalize">
                              {email.role}
                            </Badge>
                          )}
                          <span className="text-muted-foreground">
                            {new Date(email.updated_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No email logs available yet
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
