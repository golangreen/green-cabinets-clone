import { AdminLayout } from '@/components/layout';
import { EmailSettingsDashboard } from '@/features/admin-email-settings';

export default function AdminEmailSettings() {
  return (
    <AdminLayout>
      <EmailSettingsDashboard />
    </AdminLayout>
  );
}
