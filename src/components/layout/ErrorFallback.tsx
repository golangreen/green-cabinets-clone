import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface ErrorFallbackProps {
  error: Error;
  componentStack: string | null;
  eventId: string | null;
  resetError: () => void;
}

export default function ErrorFallback({ 
  error, 
  componentStack, 
  eventId, 
  resetError 
}: ErrorFallbackProps) {

  useEffect(() => {
    // Log error details to console in development
    if (import.meta.env.DEV) {
      logger.error('Error Boundary caught an error', error, {
        error,
        componentStack,
        eventId,
      });
    }
  }, [error, componentStack, eventId]);

  const handleReload = () => {
    resetError();
    window.location.reload();
  };

  const handleGoHome = () => {
    resetError();
    window.location.href = ROUTES.HOME;
  };

  const handleReportIssue = () => {
    const subject = encodeURIComponent(`Error Report: ${error.name}`);
    const body = encodeURIComponent(
      `Error: ${error.message}\n\nEvent ID: ${eventId || 'N/A'}\n\nPlease describe what you were doing when this error occurred:\n\n`
    );
    window.open(`mailto:support@greencabinets.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-2xl w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Oops! Something went wrong
          </CardTitle>
          <CardDescription className="text-base mt-2">
            We've encountered an unexpected error. Our team has been notified and will look into it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Details (Development only) */}
          {import.meta.env.DEV && (
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Show error details (Development only)
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm font-mono text-destructive break-all">
                      <strong>Error:</strong> {error.message}
                    </p>
                    {error.stack && (
                      <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto max-h-40">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                  {componentStack && (
                    <div className="bg-muted/50 border rounded-lg p-4">
                      <p className="text-sm font-semibold mb-2">Component Stack:</p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto max-h-40">
                        {componentStack}
                      </pre>
                    </div>
                  )}
                  {eventId && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Event ID:</strong> {eventId}
                    </p>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Production Error ID */}
          {!import.meta.env.DEV && eventId && (
            <div className="bg-muted/50 border rounded-lg p-4">
              <p className="text-sm text-center">
                <span className="text-muted-foreground">Error Reference: </span>
                <code className="font-mono bg-background px-2 py-1 rounded text-xs">
                  {eventId}
                </code>
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Please include this reference when contacting support
              </p>
            </div>
          )}

          {/* Helpful Tips */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">What can you do?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Try refreshing the page</li>
              <li>Go back to the home page</li>
              <li>Clear your browser cache</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleReload} 
            className="w-full sm:w-auto"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
          <Button 
            onClick={handleGoHome}
            variant="outline"
            className="w-full sm:w-auto"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
          <Button 
            onClick={handleReportIssue}
            variant="ghost"
            className="w-full sm:w-auto"
            size="lg"
          >
            <Mail className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
