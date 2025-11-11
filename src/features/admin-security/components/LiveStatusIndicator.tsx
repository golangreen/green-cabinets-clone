import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface LiveStatusIndicatorProps {
  isConnected: boolean;
}

export function LiveStatusIndicator({ isConnected }: LiveStatusIndicatorProps) {
  return (
    <Badge 
      variant={isConnected ? "default" : "outline"}
      className="flex items-center gap-1.5"
    >
      {isConnected ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <Wifi className="h-3 w-3" />
          <span className="text-xs">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">Offline</span>
        </>
      )}
    </Badge>
  );
}
