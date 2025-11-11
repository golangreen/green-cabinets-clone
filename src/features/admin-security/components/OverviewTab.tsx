import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityCharts } from '@/components/admin/SecurityCharts';
import { SecurityEventsTable } from '@/components/admin/SecurityEventsTable';
import { BlockedIPsTable } from '@/components/admin/BlockedIPsTable';
import { ExpiringRolesWidget } from '@/components/admin/ExpiringRolesWidget';
import { RoleExpirationTestPanel } from '@/components/admin/RoleExpirationTestPanel';
import { EmailDeliveryStats } from '@/components/admin/EmailDeliveryStats';
import { WebhookSecurityStats } from '@/components/admin/WebhookSecurityStats';
import { RateLimitingStats } from '@/components/admin/RateLimitingStats';
import { WebhookDeduplicationStats } from '@/components/admin/WebhookDeduplicationStats';
import { WebhookRetryChart } from '@/components/admin/WebhookRetryChart';

export const OverviewTab = () => {
  return (
    <div className="space-y-6">
      {/* Webhook Security Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <WebhookSecurityStats />
        <RateLimitingStats />
        <WebhookDeduplicationStats />
      </div>

      {/* Webhook Retry History Chart */}
      <WebhookRetryChart />

      {/* Role Management */}
      <div className="grid gap-6 md:grid-cols-2">
        <ExpiringRolesWidget />
        <RoleExpirationTestPanel />
      </div>

      {/* Email Delivery */}
      <EmailDeliveryStats />

      {/* Security Charts */}
      <SecurityCharts />
      
      {/* Recent Activity */}
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
    </div>
  );
};
