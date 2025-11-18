import { useAdminCheck } from '@/features/admin-security/hooks/useAdminCheck';
import { AdminLayout, LoadingState } from '@/components/layout';
import { AdminUsersDashboard } from '@/features/admin-users';
import { ROUTES } from '@/constants/routes';

const AdminUsers = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return <LoadingState message="Loading users..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout
      withContainer={false}
      errorBoundary={{
        featureName: 'Admin User Management',
        featureTag: 'admin-users',
        fallbackRoute: ROUTES.HOME,
      }}
    >
      <AdminUsersDashboard />
    </AdminLayout>
  );
};

export default AdminUsers;
