import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export function useResponsiveDesigner() {
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mobile: vertical stack, bottom sheet controls
  // Tablet: side panel, collapsible sections  
  // Desktop: full sidebar, all features
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    // Layout preferences
    shouldUseBottomSheet: isMobile,
    shouldCollapseSidebar: isTablet,
    shouldShowFullSidebar: isDesktop,
    // Touch optimizations
    touchTargetSize: isMobile ? 'min-h-12 min-w-12' : 'min-h-10 min-w-10',
    fontSize: isMobile ? 'text-sm' : 'text-base',
    spacing: isMobile ? 'gap-2' : 'gap-4',
    // Canvas optimizations
    canvasPadding: isMobile ? 'p-2' : isTablet ? 'p-4' : 'p-6',
    toolbarLayout: isMobile ? 'flex-wrap' : 'flex-nowrap',
  };
}
