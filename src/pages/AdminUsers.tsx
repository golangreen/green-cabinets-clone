import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Header, Footer, LoadingState, FeatureErrorBoundary } from '@/components/layout';
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
    <FeatureErrorBoundary
      featureName="Admin User Management"
      featureTag="admin-users"
      fallbackRoute={ROUTES.HOME}
    >
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <AdminUsersDashboard />
        </main>
        <Footer />
      </div>
    </FeatureErrorBoundary>
  );
};

export default AdminUsers;
