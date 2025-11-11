import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityCharts } from './SecurityCharts';
import { SecurityEventsTable } from './SecurityEventsTable';
import { BlockedIPsTable } from './BlockedIPsTable';
import { ExpiringRolesWidget } from '@/features/admin-users/components/ExpiringRolesWidget';
import { RoleExpirationTestPanel } from '@/features/admin-users/components/RoleExpirationTestPanel';
import { EmailDeliveryStats } from './EmailDeliveryStats';
import { WebhookSecurityStats } from './WebhookSecurityStats';
import { RateLimitingStats } from './RateLimitingStats';
import { WebhookDeduplicationStats } from './WebhookDeduplicationStats';
import { WebhookRetryChart } from './WebhookRetryChart';

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
