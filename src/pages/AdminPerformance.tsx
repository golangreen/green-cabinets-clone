import { PerformanceDashboard } from '@/features/admin-performance';
import { AdminLayout } from '@/components/layout';

export default function AdminPerformance() {
  return (
    <AdminLayout
      errorBoundary={{
        featureName: 'Performance Dashboard',
        featureTag: 'admin-performance',
        fallbackRoute: '/admin/security',
      }}
    >
      <PerformanceDashboard />
    </AdminLayout>
  );
}
