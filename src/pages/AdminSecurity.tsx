import { useAdminCheck } from '@/hooks/useAdminCheck';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SecurityCharts } from '@/components/admin/SecurityCharts';
import { SecurityEventsTable } from '@/components/admin/SecurityEventsTable';
import { BlockedIPsTable } from '@/components/admin/BlockedIPsTable';
import { SecurityAlertSettings } from '@/components/admin/SecurityAlertSettings';
import { ExpiringRolesWidget } from '@/components/admin/ExpiringRolesWidget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, Ban, Bell, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const AdminSecurity = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  const { data: alertHistory } = useQuery({
    queryKey: ['alert-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Security Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor security events, manage IP blocks, and review system alerts
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Shield className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="blocks" className="gap-2">
              <Ban className="h-4 w-4" />
              Blocked IPs
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ExpiringRolesWidget />
            <SecurityCharts />
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <SecurityEventsTable />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active IP Blocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <BlockedIPsTable />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Security Events Log</CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityEventsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks">
            <Card>
              <CardHeader>
                <CardTitle>IP Block Management</CardTitle>
              </CardHeader>
              <CardContent>
                <BlockedIPsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
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
          </TabsContent>

          <TabsContent value="settings">
            <SecurityAlertSettings />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSecurity;
