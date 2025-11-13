/**
 * Storage Analyzer Component
 * Analyzes gallery storage and provides compression recommendations
 */

import { useState, useEffect } from 'react';
import {
  Database,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  analyzeGalleryStorage,
  formatFileSize,
  getStorageStats,
  type StorageAnalysis,
  type CompressionRecommendation,
} from '../services/storageAnalyzerService';

// ============================================================================
// Helper Components
// ============================================================================

function StorageOverview({ analysis }: { analysis: StorageAnalysis }) {
  const stats = getStorageStats(
    analysis.recommendations.map(r => r.image)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Images</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analysis.totalImages}</div>
          <p className="text-xs text-muted-foreground">
            Avg: {formatFileSize(analysis.avgImageSize)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatFileSize(analysis.totalSize)}</div>
          <p className="text-xs text-muted-foreground">
            {analysis.oversizedImages.length} oversized
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatFileSize(analysis.potentialTotalSavings)}
          </div>
          <p className="text-xs text-muted-foreground">
            {((analysis.potentialTotalSavings / analysis.totalSize) * 100).toFixed(1)}% reduction
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
          <AlertCircle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analysis.recommendations.length}</div>
          <p className="text-xs text-muted-foreground">
            {analysis.recommendations.filter(r => r.priority === 'high').length} high priority
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RecommendationItem({ recommendation }: { recommendation: CompressionRecommendation }) {
  const priorityColors = {
    high: 'destructive',
    medium: 'secondary',
    low: 'default',
  } as const;

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium truncate">{recommendation.image.name}</p>
            <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
          </div>
          <Badge variant={priorityColors[recommendation.priority]}>
            {recommendation.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Current:</span>{' '}
            <span className="font-medium">{formatFileSize(recommendation.currentSize)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">After:</span>{' '}
            <span className="font-medium text-green-600">
              {formatFileSize(recommendation.estimatedSize)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Savings:</span>{' '}
            <span className="font-medium text-green-600">
              {recommendation.savingsPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Progress value={recommendation.savingsPercent} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {recommendation.suggestedQuality} quality
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function StorageAnalyzer() {
  const [analysis, setAnalysis] = useState<StorageAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeGalleryStorage();
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze storage. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  if (isLoading && !analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing gallery storage...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return null;
  }

  if (analysis.totalImages === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Images Found</AlertTitle>
        <AlertDescription>
          Your gallery is empty. Upload some images to see storage analysis.
        </AlertDescription>
      </Alert>
    );
  }

  const highPriorityCount = analysis.recommendations.filter(r => r.priority === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Storage Analyzer</h2>
          <p className="text-muted-foreground">
            Optimize your gallery storage with compression recommendations
          </p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <StorageOverview analysis={analysis} />

      {/* Recommendations Alert */}
      {highPriorityCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>High Priority Recommendations</AlertTitle>
          <AlertDescription>
            {highPriorityCount} image{highPriorityCount !== 1 ? 's' : ''} could significantly
            benefit from compression. These should be optimized as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">
            Recommendations ({analysis.recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="oversized">
            Oversized ({analysis.oversizedImages.length})
          </TabsTrigger>
          <TabsTrigger value="largest">Largest Files (10)</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {analysis.recommendations.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                  <p className="font-medium">All images are well optimized!</p>
                  <p className="text-sm text-muted-foreground">
                    No compression recommendations at this time.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Compression Recommendations</CardTitle>
                <CardDescription>
                  Images that could benefit from compression to save storage space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <RecommendationItem key={index} recommendation={rec} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Oversized Tab */}
        <TabsContent value="oversized" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Oversized Images</CardTitle>
              <CardDescription>
                Images exceeding the 10MB size limit that must be compressed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.oversizedImages.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                  <p className="font-medium">No oversized images!</p>
                  <p className="text-sm text-muted-foreground">
                    All images are within the size limit.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {analysis.oversizedImages.map((img, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5"
                      >
                        <div>
                          <p className="font-medium">{img.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {new Date(img.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="destructive">{formatFileSize(img.size)}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Largest Files Tab */}
        <TabsContent value="largest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Largest Files</CardTitle>
              <CardDescription>Top 10 largest images in your gallery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.largestImages.map((img, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{img.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(img.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{formatFileSize(img.size)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      {analysis.recommendations.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      )}
    </div>
  );
}
