import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CloudOff, Cloud, Clock } from "lucide-react";
import { backgroundSync } from "@/lib/backgroundSync";

export default function SyncStatusIndicator() {
  const [queueStatus, setQueueStatus] = useState({ count: 0, operations: [] });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => {
      setQueueStatus(backgroundSync.getQueueStatus());
      setIsOnline(navigator.onLine);
    };

    // Update immediately
    updateStatus();

    // Update on online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  // Don't show if online and no pending operations
  if (isOnline && queueStatus.count === 0) {
    return null;
  }

  return (
    <Badge
      variant={isOnline ? "secondary" : "destructive"}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 py-2 px-3 shadow-lg"
    >
      {isOnline ? (
        queueStatus.count > 0 ? (
          <>
            <Clock className="h-3 w-3 animate-pulse" />
            <span>Syncing {queueStatus.count} operation{queueStatus.count !== 1 ? 's' : ''}...</span>
          </>
        ) : (
          <>
            <Cloud className="h-3 w-3" />
            <span>All synced</span>
          </>
        )
      ) : (
        <>
          <CloudOff className="h-3 w-3" />
          <span>{queueStatus.count} operation{queueStatus.count !== 1 ? 's' : ''} pending</span>
        </>
      )}
    </Badge>
  );
}
