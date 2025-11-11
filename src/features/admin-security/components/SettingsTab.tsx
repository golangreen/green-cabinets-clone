import { NotificationSettingsPanel } from './NotificationSettingsPanel';
import { CronJobsManager } from './CronJobsManager';
import { SecurityAlertSettings } from './SecurityAlertSettings';

export const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <NotificationSettingsPanel />
      <CronJobsManager />
      <SecurityAlertSettings />
    </div>
  );
};
