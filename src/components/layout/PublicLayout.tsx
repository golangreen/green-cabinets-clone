import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import OfflineBanner from './OfflineBanner';
import SyncStatusIndicator from './SyncStatusIndicator';
import { SkipLink } from '@/components/accessibility';

interface PublicLayoutProps {
  children: ReactNode;
  /** Whether to show offline banner and sync status (default: true) */
  showOfflineIndicators?: boolean;
  /** Custom className for root div */
  className?: string;
}

export default function PublicLayout({
  children,
  showOfflineIndicators = true,
  className = 'min-h-screen',
}: PublicLayoutProps) {
  return (
    <div className={className}>
      <SkipLink />
      {showOfflineIndicators && (
        <>
          <OfflineBanner />
          <SyncStatusIndicator />
        </>
      )}
      <Header />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
