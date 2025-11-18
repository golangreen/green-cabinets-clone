import { AdminRoute } from "@/components/auth";
import { Header, Footer } from "@/components/layout";
import { AdminCacheDashboard } from "@/features/admin-cache";

export default function AdminCache() {
  return (
    <AdminRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <AdminCacheDashboard />
          </div>
        </main>
        <Footer />
      </div>
    </AdminRoute>
  );
}
