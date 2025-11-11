import { useAdminCheck } from '@/hooks/useAdminCheck';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import { AdminAuditDashboard } from '@/features/admin-audit';

const AdminAuditLog = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return <LoadingState message="Loading audit logs..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AdminAuditDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default AdminAuditLog;
