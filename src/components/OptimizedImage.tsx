import { useLazyImage } from '@/hooks/useLazyImage';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  eager = false,
  ...props 
}: OptimizedImageProps) => {
  const { imgRef, imageSrc, isLoading } = useLazyImage(src, {
    threshold: 0.01,
    rootMargin: '50px',
  });

  if (eager) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="eager"
        decoding="sync"
        {...props}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoading && imageSrc ? 'opacity-0' : 'opacity-100',
        className
      )}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};
