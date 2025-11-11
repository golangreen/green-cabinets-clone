import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, Ban, Bell, Settings } from 'lucide-react';
import { OverviewTab } from './OverviewTab';
import { EventsTab } from './EventsTab';
import { BlocksTab } from './BlocksTab';
import { AlertsTab } from './AlertsTab';
import { SettingsTab } from './SettingsTab';

export const SecurityTabs = () => {
  return (
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

      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>

      <TabsContent value="events">
        <EventsTab />
      </TabsContent>

      <TabsContent value="blocks">
        <BlocksTab />
      </TabsContent>

      <TabsContent value="alerts">
        <AlertsTab />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
};
