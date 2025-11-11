import { useAdminCheck } from '@/hooks/useAdminCheck';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingState from '@/components/LoadingState';
import { AdminUsersDashboard } from '@/features/admin-users';

const AdminUsers = () => {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return <LoadingState message="Loading users..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AdminUsersDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
