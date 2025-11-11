import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Database, TrendingUp } from "lucide-react";

interface StorageStatsProps {
  total: number;
  used: number;
  available: number;
  percentage: number;
  entriesCount: number;
}

export function StorageStats({ total, used, available, percentage, entriesCount }: StorageStatsProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Statistics
        </CardTitle>
        <CardDescription>
          LocalStorage usage for cached data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Total Storage</span>
            <span className={getStatusColor()}>
              {formatBytes(used)} / {formatBytes(total)} ({percentage.toFixed(1)}%)
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Database className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Used</p>
              <p className="text-2xl font-bold">{formatBytes(used)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Available</p>
              <p className="text-2xl font-bold">{formatBytes(available)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Cache Entries</p>
              <p className="text-2xl font-bold">{entriesCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
