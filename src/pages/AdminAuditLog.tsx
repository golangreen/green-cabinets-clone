import { useAdminCheck } from '@/hooks/useAdminCheck';
import { AdminLayout, LoadingState } from '@/components/layout';
import { AdminAuditDashboard } from '@/features/admin-audit';
import { ROUTES } from '@/constants/routes';

const AdminAuditLog = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return <LoadingState message="Loading audit logs..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout
      withContainer={false}
      errorBoundary={{
        featureName: 'Admin Audit Log',
        featureTag: 'admin-audit',
        fallbackRoute: ROUTES.HOME,
      }}
    >
      <AdminAuditDashboard />
    </AdminLayout>
  );
};

export default AdminAuditLog;
