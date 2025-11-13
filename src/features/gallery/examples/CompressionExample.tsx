/**
 * Compression Example Component
 * Demonstrates automatic compression for oversized files
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CompressionDialog } from '../components/CompressionDialog';
import { useAutoCompression } from '../hooks/useAutoCompression';
import { MAX_FILE_SIZE } from '../config/constants';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function CompressionExample() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const {
    oversizedFiles,
    checkForOversizedFiles,
    compressOversizedFiles,
    clearOversizedFiles,
  } = useAutoCompression();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setProcessedFiles([]);

    // Check for oversized files
    const result = await checkForOversizedFiles(fileArray);

    if (result.needsCompression) {
      setShowDialog(true);
    } else {
      // All files are acceptable
      setProcessedFiles(result.acceptable);
    }
  };

  const handleCompress = async (quality: any) => {
    const compressed = await compressOversizedFiles(quality);
    
    // Get acceptable files
    const { acceptable } = await checkForOversizedFiles(selectedFiles);
    
    // Combine compressed and acceptable files
    setProcessedFiles([...compressed, ...acceptable]);
    setShowDialog(false);
  };

  const handleSkip = () => {
    clearOversizedFiles();
    setShowDialog(false);
    
    // Only process acceptable files
    checkForOversizedFiles(selectedFiles).then(result => {
      setProcessedFiles(result.acceptable);
    });
  };

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);
  const maxSizeMB = formatSize(MAX_FILE_SIZE);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatic Compression Example</CardTitle>
          <CardDescription>
            Upload images to test automatic compression for oversized files (limit: {maxSizeMB}MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File input */}
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />

          {/* Selected files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Selected Files:</h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const isOversized = file.size > MAX_FILE_SIZE;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(file.size)}MB
                        </p>
                      </div>
                      
                      <Badge
                        variant={isOversized ? 'destructive' : 'default'}
                        className={!isOversized ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {isOversized ? (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Over Limit
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </>
                        )}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Processed files */}
          {processedFiles.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-medium text-green-600">
                ✓ Ready for Upload ({processedFiles.length} files)
              </h3>
              <div className="space-y-2">
                {processedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(file.size)}MB
                      </p>
                    </div>
                    
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4">
                Upload {processedFiles.length} File{processedFiles.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <p className="font-medium">Automatic Detection:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Files are automatically checked against the {maxSizeMB}MB limit</li>
              <li>Oversized files trigger the compression dialog</li>
              <li>Acceptable files bypass compression and are ready immediately</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Compression Options:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>High Quality</strong>: Minimal quality loss (~70% of original size)</li>
              <li><strong>Medium Quality</strong>: Balanced approach (~50% of original size)</li>
              <li><strong>Low Quality</strong>: Maximum compression (~30% of original size)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Try These Scenarios:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Upload files larger than {maxSizeMB}MB to see compression dialog</li>
              <li>Mix oversized and acceptable files to see selective processing</li>
              <li>Compare original vs compressed file sizes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Compression Dialog */}
      <CompressionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        oversizedFiles={oversizedFiles}
        onCompress={handleCompress}
        onSkip={handleSkip}
      />
    </div>
  );
}
