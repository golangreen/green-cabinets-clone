/**
 * Storage Analyzer Page
 * Dedicated page for analyzing gallery storage
 */

import { AdminRoute } from '@/components/auth';
import { Header, Footer } from '@/components/layout';
import { StorageAnalyzer } from '@/features/gallery/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StorageAnalyzerPage() {
  const navigate = useNavigate();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
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
        </main>

        <Footer />
      </div>
    </AdminRoute>
  );
}
