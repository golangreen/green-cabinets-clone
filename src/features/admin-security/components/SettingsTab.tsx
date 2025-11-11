import { NotificationSettingsPanel } from '@/components/admin/NotificationSettingsPanel';
import { CronJobsManager } from '@/components/admin/CronJobsManager';
import { SecurityAlertSettings } from '@/components/admin/SecurityAlertSettings';

export const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <NotificationSettingsPanel />
      <CronJobsManager />
      <SecurityAlertSettings />
    </div>
  );
};
