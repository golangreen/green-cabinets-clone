import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Package, ShoppingCart, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CacheControlsProps {
  onClearAll: () => void;
  onClearByType: (type: 'product' | 'cart' | 'sync-queue' | 'other') => void;
  onRefresh: () => void;
  onClearSyncQueue: () => void;
  syncQueueCount: number;
}

export function CacheControls({
  onClearAll,
  onClearByType,
  onRefresh,
  onClearSyncQueue,
  syncQueueCount,
}: CacheControlsProps) {
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  const handleClearAll = () => {
    onClearAll();
    setShowClearAllDialog(false);
    toast.success('All caches cleared successfully');
  };

  const handleClearByType = (type: 'product' | 'cart' | 'sync-queue' | 'other', label: string) => {
    onClearByType(type);
    toast.success(`${label} cache cleared successfully`);
  };

  const handleClearSyncQueue = () => {
    onClearSyncQueue();
    toast.success('Sync queue cleared successfully');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cache Controls</CardTitle>
          <CardDescription>
            Manage and clear cached data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleClearByType('product', 'Product')}
            >
              <Package className="h-4 w-4 mr-2" />
              Clear Products
            </Button>
            <Button
              variant="outline"
              onClick={() => handleClearByType('cart', 'Cart')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
            <Button
              variant="outline"
              onClick={handleClearSyncQueue}
              disabled={syncQueueCount === 0}
            >
              <Clock className="h-4 w-4 mr-2" />
              Clear Sync Queue ({syncQueueCount})
            </Button>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowClearAllDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Caches
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Caches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all cached data including products, cart items, and sync queue.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
