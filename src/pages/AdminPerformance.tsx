import { PerformanceDashboard } from '@/features/admin-performance';
import { AdminRoute } from '@/components/auth/AdminRoute';
import FeatureErrorBoundary from '@/components/layout/FeatureErrorBoundary';

export default function AdminPerformance() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <FeatureErrorBoundary
            featureName="Performance Dashboard"
            featureTag="admin-performance"
            fallbackRoute="/admin/security"
          >
            <PerformanceDashboard />
          </FeatureErrorBoundary>
        </div>
      </div>
    </AdminRoute>
  );
}
