/**
 * Admin Gallery Page
 * Main page for managing gallery images with clean component architecture
 */

import { Database } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import {
  GalleryErrorBoundary,
  GalleryFileSelector,
  GalleryImageProcessor,
} from '@/features/gallery/components';
import { GalleryProvider } from '@/features/gallery/hooks';

export default function AdminGallery() {
  return (
    <AdminLayout>
      <GalleryProvider>
        <GalleryErrorBoundary>
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Gallery Management</h1>
              <p className="text-muted-foreground">Upload and manage gallery images with automatic metadata extraction</p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/admin/storage-analyzer'}
              className="gap-2"
            >
              <Database className="h-4 w-4" />
              Storage Analyzer
            </Button>
          </div>

          <div className="grid gap-6">
            <GalleryFileSelector />
            <GalleryImageProcessor />
          </div>
        </GalleryErrorBoundary>
      </GalleryProvider>
    </AdminLayout>
  );
}
