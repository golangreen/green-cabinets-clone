import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth';
import Header from './Header';
import Footer from './Footer';
import FeatureErrorBoundary from './FeatureErrorBoundary';

interface ProtectedLayoutProps {
  children: ReactNode;
  /** Optional feature error boundary configuration */
  errorBoundary?: {
    featureName: string;
    featureTag: string;
    fallbackRoute: string;
  };
  /** Custom className for main container */
  containerClassName?: string;
  /** Whether to include container wrapper (default: true) */
  withContainer?: boolean;
}

export default function ProtectedLayout({
  children,
  errorBoundary,
  containerClassName = 'container mx-auto px-4 py-8',
  withContainer = true,
}: ProtectedLayoutProps) {
  const content = withContainer ? (
    <main className="flex-1">
      <div className={containerClassName}>{children}</div>
    </main>
  ) : (
    <main className="flex-1">{children}</main>
  );

  const layout = (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        {content}
        <Footer />
      </div>
    </ProtectedRoute>
  );

  if (errorBoundary) {
    return (
      <FeatureErrorBoundary
        featureName={errorBoundary.featureName}
        featureTag={errorBoundary.featureTag}
        fallbackRoute={errorBoundary.fallbackRoute}
      >
        {layout}
      </FeatureErrorBoundary>
    );
  }

  return layout;
}
