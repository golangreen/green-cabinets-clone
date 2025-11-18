import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Header, Footer, FeatureErrorBoundary } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { SecurityDashboard } from '@/features/admin-security';
import { ROUTES } from '@/constants/routes';

const AdminSecurity = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <FeatureErrorBoundary
      featureName="Admin Security Dashboard"
      featureTag="admin-security"
      fallbackRoute={ROUTES.HOME}
    >
      <div className="min-h-screen">
        <Header />
        <main>
          <SecurityDashboard />
        </main>
        <Footer />
      </div>
    </FeatureErrorBoundary>
  );
};

export default AdminSecurity;
