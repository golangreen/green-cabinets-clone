import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getOptimalObserverConfig, decodeImage } from '@/lib/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  onLoad?: () => void;
  /**
   * Priority for loading this image
   * 'high' = above the fold, load immediately
   * 'low' = below the fold, use IntersectionObserver
   * @default 'low'
   */
  priority?: 'high' | 'low';
  /**
   * Show blur-up effect while loading
   * @default true
   */
  blurUp?: boolean;
}

export const LazyImage = ({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  onClick, 
  onLoad,
  priority = 'low',
  blurUp = true,
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority === 'high');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // High priority images load immediately
    if (priority === 'high' || !imgRef.current) return;

    // Get optimal observer config based on device capabilities
    const observerConfig = getOptimalObserverConfig();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      observerConfig
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    
    // Decode image off main thread for smoother rendering
    await decodeImage(img);
    
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div className="relative overflow-hidden bg-gray-100">
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority === 'high' ? 'eager' : 'lazy'}
        fetchPriority={priority}
        className={cn(
          'transition-all duration-500',
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          blurUp && !isLoaded && isInView && 'blur-sm',
          className
        )}
        onClick={onClick}
        onLoad={handleLoad}
      />
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
    </div>
  );
};
