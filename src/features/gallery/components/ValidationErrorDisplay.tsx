/**
 * Validation Error Display Component
 * Shows validation errors and warnings in an accessible format with retry options
 */

import { AlertCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { ValidationResult } from '../services/validationService';

// ============================================================================
// Types
// ============================================================================

export interface ValidationErrorDisplayProps {
  fileName: string;
  validation: ValidationResult;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export interface ValidationSummaryProps {
  validationResults: Map<string, ValidationResult>;
  onRetryFile?: (fileName: string) => void;
  onDismiss?: () => void;
  className?: string;
}

// ============================================================================
// Single File Validation Display
// ============================================================================

export function ValidationErrorDisplay({
  fileName,
  validation,
  onRetry,
  onDismiss,
  className,
}: ValidationErrorDisplayProps) {
  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  return (
    <Alert
      variant={hasErrors ? 'destructive' : 'default'}
      className={className}
    >
      <div className="flex items-start gap-3">
        {hasErrors ? (
          <AlertCircle className="h-5 w-5 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 mt-0.5 text-warning" />
        )}
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <AlertTitle className="text-base font-semibold mb-0">
              {fileName}
            </AlertTitle>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={onDismiss}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Errors */}
          {hasErrors && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  {validation.errors.length} Error{validation.errors.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <ul className="space-y-1 text-sm">
                {validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <AlertDescription className="mb-0 flex-1">
                      <span className="font-medium">{error.field}:</span> {error.message}
                    </AlertDescription>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {validation.warnings.length} Warning{validation.warnings.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <ul className="space-y-1 text-sm">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <AlertDescription className="mb-0 flex-1 text-muted-foreground">
                      <span className="font-medium">{warning.field}:</span> {warning.message}
                    </AlertDescription>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Retry button */}
          {hasErrors && onRetry && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Fix and Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

// ============================================================================
// Multiple Files Validation Summary
// ============================================================================

export function ValidationSummary({
  validationResults,
  onRetryFile,
  onDismiss,
  className,
}: ValidationSummaryProps) {
  const results = Array.from(validationResults.entries());
  
  const errorCount = results.filter(([_, v]) => v.errors.length > 0).length;
  const warningCount = results.filter(([_, v]) => v.warnings.length > 0 && v.errors.length === 0).length;
  const successCount = results.filter(([_, v]) => v.isValid && v.warnings.length === 0).length;

  if (results.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Summary header */}
      <Alert className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            
            <div className="flex-1">
              <AlertTitle className="text-base font-semibold mb-2">
                Validation Results
              </AlertTitle>
              
              <div className="flex flex-wrap gap-2 text-sm">
                {successCount > 0 && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    {successCount} Passed
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="secondary">
                    {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive">
                    {errorCount} Failed
                  </Badge>
                )}
              </div>

              {errorCount > 0 && (
                <AlertDescription className="mt-2">
                  Please fix the errors below before uploading.
                </AlertDescription>
              )}
            </div>
          </div>

          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onDismiss}
              aria-label="Dismiss all"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>

      {/* Individual file results */}
      <ScrollArea className="max-h-[400px] pr-4">
        <div className="space-y-3">
          {results.map(([fileName, validation]) => {
            const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0;
            
            if (!hasIssues) {
              return null;
            }

            return (
              <ValidationErrorDisplay
                key={fileName}
                fileName={fileName}
                validation={validation}
                onRetry={onRetryFile ? () => onRetryFile(fileName) : undefined}
              />
            );
          })}
        </div>
      </ScrollArea>

      <Separator className="my-4" />

      {/* Help text */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p className="font-medium">Common fixes:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>Compress large images before uploading</li>
          <li>Convert unsupported formats to JPEG or PNG</li>
          <li>Ensure images meet minimum size requirements (800x600px)</li>
          <li>Use valid file names without special characters</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// Inline Validation Badge (for use in file lists)
// ============================================================================

interface ValidationBadgeProps {
  validation: ValidationResult;
  className?: string;
}

export function ValidationBadge({ validation, className }: ValidationBadgeProps) {
  if (validation.isValid && validation.warnings.length === 0) {
    return (
      <Badge variant="default" className={`bg-green-600 hover:bg-green-700 ${className}`}>
        Valid
      </Badge>
    );
  }

  if (validation.errors.length > 0) {
    return (
      <Badge variant="destructive" className={className}>
        {validation.errors.length} Error{validation.errors.length !== 1 ? 's' : ''}
      </Badge>
    );
  }

  if (validation.warnings.length > 0) {
    return (
      <Badge variant="secondary" className={className}>
        {validation.warnings.length} Warning{validation.warnings.length !== 1 ? 's' : ''}
      </Badge>
    );
  }

  return null;
}
