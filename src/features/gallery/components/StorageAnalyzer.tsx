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
  Zap,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';
import {
  analyzeGalleryStorage,
  getStorageStats,
  type StorageAnalysis,
  type CompressionRecommendation,
} from '../services/storageAnalyzerService';
import { formatBytes, formatFileSize } from '@/utils/formatters';
import {
  bulkCompressImages,
  calculateTotalSavings,
  type BulkCompressionProgress,
  type BulkCompressionResult,
  estimateCompressedSize,
} from '../services/compression';
import type { CompressionQuality } from '../types';
import { BulkCompressionDialog } from './BulkCompressionDialog';

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

function RecommendationItem({ 
  recommendation, 
  isSelected, 
  onSelect 
}: { 
  recommendation: CompressionRecommendation;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}) {
  const priorityColors = {
    high: 'destructive',
    medium: 'secondary',
    low: 'default',
  } as const;

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
        className="mt-1"
      />
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
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<BulkCompressionProgress | null>(null);
  const [compressionResults, setCompressionResults] = useState<BulkCompressionResult[] | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedIndices(new Set());
    setCompressionResults(null);

    try {
      const result = await analyzeGalleryStorage();
      setAnalysis(result);
    } catch (err) {
      logger.error('Storage analysis failed', err, { component: 'StorageAnalyzer' });
      setError('Failed to analyze storage. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (!analysis) return;
    if (selectedIndices.size === analysis.recommendations.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(analysis.recommendations.map((_, i) => i)));
    }
  };

  const handleSelectRecommendation = (index: number, selected: boolean) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

  const handleBulkCompress = async (quality: CompressionQuality) => {
    if (!analysis) return;

    const selectedRecs = Array.from(selectedIndices)
      .map(i => analysis.recommendations[i]);

    if (selectedRecs.length === 0 || selectedRecs.length > 100) {
      toast({
        title: "Invalid Selection",
        description: "Select between 1-100 images",
        variant: "destructive",
      });
      return;
    }

    setShowBulkDialog(false);
    
    try {
      const results = await bulkCompressImages(
        selectedRecs.map(r => ({ ...r.image, bucket_id: r.image.bucket })),
        quality,
        (progress) => setCompressionProgress(progress)
      );

      setCompressionResults(results);
      
      const successCount = results.filter(r => r.success).length;
      const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);

      toast({
        title: "Compression Complete",
        description: `Successfully compressed ${successCount} of ${results.length} images. Saved ${formatFileSize(totalSavings)}.`,
      });

      // Refresh analysis
      setTimeout(() => {
        setCompressionProgress(null);
        runAnalysis();
      }, 2000);
    } catch (err) {
      logger.error('Bulk compression failed', err, { component: 'StorageAnalyzer' });
      toast({
        title: "Compression Failed",
        description: "Failed to compress images. Please try again.",
        variant: "destructive",
      });
      setCompressionProgress(null);
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Compression Recommendations</CardTitle>
                    <CardDescription>
                      Images that could benefit from compression to save storage space
                    </CardDescription>
                  </div>
                  
                  {/* Bulk actions toolbar */}
                  {analysis.recommendations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="gap-2"
                      >
                        {selectedIndices.size === analysis.recommendations.length ? (
                          <>
                            <CheckSquare className="h-4 w-4" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <Square className="h-4 w-4" />
                            Select All
                          </>
                        )}
                      </Button>
                      
                      {selectedIndices.size > 0 && (
                        <Button
                          onClick={() => setShowBulkDialog(true)}
                          className="gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          Compress {selectedIndices.size} Selected
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, index) => (
                      <RecommendationItem 
                        key={index} 
                        recommendation={rec}
                        isSelected={selectedIndices.has(index)}
                        onSelect={(selected) => handleSelectRecommendation(index, selected)}
                      />
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
      {analysis.recommendations.length > 0 && !compressionProgress && (
        <div className="flex justify-end">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      )}

      {/* Compression Progress */}
      {compressionProgress && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {compressionProgress.status === 'downloading' && 'Downloading images...'}
                    {compressionProgress.status === 'compressing' && 'Compressing images...'}
                    {compressionProgress.status === 'uploading' && 'Uploading compressed images...'}
                    {compressionProgress.status === 'complete' && 'Complete!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {compressionProgress.currentFile} ({compressionProgress.currentIndex}/{compressionProgress.totalFiles})
                  </p>
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
              <Progress value={compressionProgress.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compression Results */}
      {compressionResults && !compressionProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Compression Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {compressionResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{result.image.name}</p>
                    {result.success ? (
                      <p className="text-xs text-muted-foreground">
                        Saved {formatFileSize(result.savings)} ({((result.savings / result.originalSize) * 100).toFixed(1)}%)
                      </p>
                    ) : (
                      <p className="text-xs text-destructive">{result.error}</p>
                    )}
                  </div>
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Compression Dialog */}
      <BulkCompressionDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
        recommendations={Array.from(selectedIndices).map(i => analysis.recommendations[i])}
        onCompress={handleBulkCompress}
      />
    </div>
  );
}
