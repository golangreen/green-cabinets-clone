/**
 * Storage Analyzer Page
 * Dedicated page for analyzing gallery storage
 */

import { AdminLayout } from '@/components/layout';
import { StorageAnalyzer } from '@/features/gallery/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StorageAnalyzerPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/gallery')}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Button>
      </div>

      <StorageAnalyzer />
    </AdminLayout>
  );
}
