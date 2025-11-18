import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { validateConfiguration, formatValidationErrors, type ValidationResult } from '@/config';
import { logger } from '@/lib/logger';

export function ConfigValidationAlert() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Run validation on mount
    const result = validateConfiguration();
    setValidationResult(result);

    // Log validation results
    if (!result.isValid) {
      logger.error('Configuration validation failed', {
        errors: result.errors,
        warnings: result.warnings,
      });
    } else if (result.warnings.length > 0) {
      logger.warn('Configuration has warnings', { warnings: result.warnings });
    } else {
      logger.info('Configuration validated successfully');
    }
  }, []);

  // Don't render anything if validation passed without warnings or if dismissed
  if (!validationResult || (validationResult.isValid && validationResult.warnings.length === 0) || dismissed) {
    return null;
  }

  // Critical errors - block app usage
  if (!validationResult.isValid) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
        <Card className="max-w-2xl w-full border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-destructive">Configuration Error</CardTitle>
            </div>
            <CardDescription>
              The application cannot start due to invalid configuration. Please fix the errors below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.errors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle className="font-mono text-sm">{error.field}</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{error.message}</p>
                  {error.suggestion && (
                    <p className="text-xs opacity-90">
                      <strong>Suggestion:</strong> {error.suggestion}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ))}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                For help with configuration, see the documentation:
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="/docs/configuration" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Configuration Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Warnings only - show dismissible banner
  if (validationResult.warnings.length > 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 p-4">
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Configuration Warnings ({validationResult.warnings.length})
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            <div className="space-y-2 mb-3">
              {validationResult.warnings.map((warning, index) => (
                <div key={index} className="text-sm">
                  <strong className="font-mono">{warning.field}:</strong> {warning.message}
                  {warning.suggestion && (
                    <div className="text-xs mt-1 opacity-90">→ {warning.suggestion}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDismissed(true)}
                className="text-yellow-800 dark:text-yellow-200 border-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="text-yellow-800 dark:text-yellow-200 border-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900"
              >
                <a href="/docs/configuration" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  View Docs
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
