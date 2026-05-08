import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface Props {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}

const GalleryLightbox = ({ images, index, onClose, onChange }: Props) => {
  const isOpen = index !== null && index >= 0 && index < images.length;

  const next = useCallback(() => {
    if (index === null) return;
    onChange((index + 1) % images.length);
  }, [index, images.length, onChange]);

  const prev = useCallback(() => {
    if (index === null) return;
    onChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onChange]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, next, prev, onClose]);

  if (!isOpen) return null;
  const current = images[index!];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.caption || current.alt}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 sm:left-6 text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 sm:right-6 text-white/90 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <figure
        className="max-w-[92vw] max-h-[88vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="max-w-[92vw] max-h-[78vh] object-contain rounded-lg shadow-2xl"
        />
        {current.caption && (
          <figcaption className="mt-4 text-center text-white/90 text-sm sm:text-base px-4">
            {current.caption}
            {images.length > 1 && (
              <span className="ml-2 text-white/60">
                ({index! + 1} / {images.length})
              </span>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
};

export default GalleryLightbox;
