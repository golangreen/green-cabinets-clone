import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Header, Footer, LoadingState, FeatureErrorBoundary } from '@/components/layout';
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
    <FeatureErrorBoundary
      featureName="Admin Audit Log"
      featureTag="admin-audit"
      fallbackRoute={ROUTES.HOME}
    >
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <AdminAuditDashboard />
        </main>
        <Footer />
      </div>
    </FeatureErrorBoundary>
  );
};

export default AdminAuditLog;
