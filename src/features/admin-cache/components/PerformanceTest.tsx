import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logger } from '@/lib/logger';
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PerformanceTestProps {
  onTest: () => Promise<{ write: number; read: number; delete: number }>;
}

export function PerformanceTest({ onTest }: PerformanceTestProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    write: number;
    read: number;
    delete: number;
  } | null>(null);

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      const testResults = await onTest();
      setResults(testResults);
      toast.success('Performance test completed');
    } catch (error) {
      toast.error('Performance test failed');
      logger.error('Cache performance test failed', error, { component: 'PerformanceTest' });
    } finally {
      setIsRunning(false);
    }
  };

  const formatTime = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    return `${ms.toFixed(2)}ms`;
  };

  const getPerformanceRating = (ms: number): { label: string; color: string } => {
    if (ms < 1) return { label: 'Excellent', color: 'text-green-600' };
    if (ms < 5) return { label: 'Good', color: 'text-blue-600' };
    if (ms < 10) return { label: 'Average', color: 'text-yellow-600' };
    return { label: 'Slow', color: 'text-red-600' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Test
        </CardTitle>
        <CardDescription>
          Test localStorage read/write/delete performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleRunTest}
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Test...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run Performance Test
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Write Performance</p>
                <p className="text-xs text-muted-foreground">
                  {getPerformanceRating(results.write).label}
                </p>
              </div>
              <p className={`text-2xl font-bold ${getPerformanceRating(results.write).color}`}>
                {formatTime(results.write)}
              </p>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Read Performance</p>
                <p className="text-xs text-muted-foreground">
                  {getPerformanceRating(results.read).label}
                </p>
              </div>
              <p className={`text-2xl font-bold ${getPerformanceRating(results.read).color}`}>
                {formatTime(results.read)}
              </p>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Delete Performance</p>
                <p className="text-xs text-muted-foreground">
                  {getPerformanceRating(results.delete).label}
                </p>
              </div>
              <p className={`text-2xl font-bold ${getPerformanceRating(results.delete).color}`}>
                {formatTime(results.delete)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
