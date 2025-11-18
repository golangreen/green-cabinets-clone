/**
 * Validation Example Component
 * Demonstrates how to use the validation error display components
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ValidationSummary, ValidationBadge } from '../components/ValidationErrorDisplay';
import { validateImageFiles, type ValidationResult } from '../services/validationService';

export function ValidationExample() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationResults, setValidationResults] = useState<Map<string, ValidationResult>>(new Map());
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);

    // Validate all files
    setIsValidating(true);
    try {
      const results = await validateImageFiles(fileArray);
      setValidationResults(results);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRetryFile = (fileName: string) => {
    console.log('Retry file:', fileName);
    // In a real implementation, you would prompt the user to fix the file
    // and then revalidate it
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setValidationResults(new Map());
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Validation Example</CardTitle>
          <CardDescription>
            Upload images to see validation in action
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File input */}
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isValidating}
            />
            {isValidating && (
              <p className="text-sm text-muted-foreground">Validating files...</p>
            )}
          </div>

          {/* File list with validation badges */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Selected Files:</h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const validation = validationResults.get(file.name);
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      
                      {validation && (
                        <ValidationBadge validation={validation} className="ml-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Validation summary */}
          {validationResults.size > 0 && (
            <ValidationSummary
              validationResults={validationResults}
              onRetryFile={handleRetryFile}
              onDismiss={handleClear}
            />
          )}

          {/* Action buttons */}
          {selectedFiles.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={handleClear} variant="outline">
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>This example demonstrates the validation error display components:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>ValidationBadge</strong>: Inline badge showing validation status</li>
            <li><strong>ValidationSummary</strong>: Comprehensive display of all validation results</li>
            <li><strong>ValidationErrorDisplay</strong>: Individual file validation details</li>
          </ul>
          
          <p className="pt-2 font-medium">Try these scenarios:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Upload a file larger than 10MB to see size error</li>
            <li>Upload a non-image file to see type error</li>
            <li>Upload small images (&lt;800x600px) to see dimension error</li>
            <li>Upload medium-quality images to see warnings</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
