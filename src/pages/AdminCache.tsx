import { AdminLayout } from "@/components/layout";
import { AdminCacheDashboard } from "@/features/admin-cache";

export default function AdminCache() {
  return (
    <AdminLayout>
      <AdminCacheDashboard />
    </AdminLayout>
  );
}
