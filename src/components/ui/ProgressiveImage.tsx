import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  placeholderSrc?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export const ProgressiveImage = ({
  src,
  placeholderSrc,
  alt,
  className,
  width,
  height,
}: ProgressiveImageProps) => {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(!!placeholderSrc);

  useEffect(() => {
    if (!placeholderSrc) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };
  }, [src, placeholderSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        'transition-opacity duration-300',
        isLoading ? 'opacity-50' : 'opacity-100',
        className
      )}
    />
  );
};
