import * as Sentry from '@sentry/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  featureTag: string;
  fallbackRoute: string;
  onReset?: () => void;
}

interface FallbackProps {
  error: unknown;
  resetError: () => void;
  featureName: string;
  fallbackRoute: string;
  onReset?: () => void;
}

function FeatureFallback({ error, resetError, featureName, fallbackRoute, onReset }: FallbackProps) {
  const navigate = useNavigate();
  
  // Safely extract error message
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const handleRetry = () => {
    if (onReset) {
      onReset();
    }
    resetError();
  };

  const handleGoBack = () => {
    resetError();
    navigate(fallbackRoute);
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">
              {featureName} Error
            </CardTitle>
          </div>
          <CardDescription>
            We encountered an issue with the {featureName.toLowerCase()}. 
            Don't worry - your data is safe and the rest of the application is working.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {import.meta.env.DEV && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error details (Dev only)
              </summary>
              <pre className="mt-2 text-xs bg-destructive/5 p-3 rounded overflow-x-auto max-h-32">
                {errorMessage}
                {errorStack && `\n\n${errorStack}`}
              </pre>
            </details>
          )}
          
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">What you can do:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Try again by clicking "Retry"</li>
              <li>Go back and try a different action</li>
              <li>Refresh your browser if the issue persists</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={handleRetry} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button onClick={handleGoBack} variant="outline" className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Feature-specific error boundary
 * Wraps critical features to prevent errors from crashing the entire app
 */
export default function FeatureErrorBoundary({
  children,
  featureName,
  featureTag,
  fallbackRoute,
  onReset,
}: FeatureErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={(props) => (
        <FeatureFallback
          {...props}
          featureName={featureName}
          fallbackRoute={fallbackRoute}
          onReset={onReset}
        />
      )}
      beforeCapture={(scope) => {
        scope.setTag('feature', featureTag);
        scope.setContext('feature', {
          name: featureName,
          fallbackRoute,
        });
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
