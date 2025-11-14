/**
 * GalleryContext
 * Provides gallery state and actions throughout the component tree
 */

import { createContext, useContext, ReactNode } from 'react';
import { useGalleryManager } from '../hooks/useGalleryManager';

type GalleryContextType = ReturnType<typeof useGalleryManager>;

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

interface GalleryProviderProps {
  children: ReactNode;
}

export function GalleryProvider({ children }: GalleryProviderProps) {
  const gallery = useGalleryManager();

  return (
    <GalleryContext.Provider value={gallery}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGalleryContext() {
  const context = useContext(GalleryContext);
  
  if (context === undefined) {
    throw new Error('useGalleryContext must be used within a GalleryProvider');
  }
  
  return context;
}
