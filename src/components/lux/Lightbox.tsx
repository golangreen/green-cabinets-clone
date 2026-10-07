import { useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface LightboxProps {
  images: { src: string; alt: string }[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/**
 * Full-screen photo viewer. Arrow keys and swipe step through; Esc, the close
 * button or a tap on the backdrop closes. Radix handles focus and scroll lock.
 */
const Lightbox = ({ images, index, onIndex, onClose }: LightboxProps) => {
  const open = index !== null && !!images[index];
  const n = images.length;
  const touchX = useRef<number | null>(null);

  const step = (d: number) => {
    if (index === null) return;
    onIndex((index + d + n) % n);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const img = open ? images[index] : null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="lux-lightbox-backdrop fixed inset-0 z-[60] bg-ink" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="lux-lightbox fixed inset-0 z-[61] flex flex-col outline-none"
          onPointerDown={(e) => e.target === e.currentTarget && onClose()}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <DialogPrimitive.Title className="sr-only">{img?.alt ?? "Photo"}</DialogPrimitive.Title>
          <div
            className="flex items-center justify-between px-4 pb-2 sm:px-6"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
          >
            <p className="font-display text-xs tabular-nums text-stone">
              {index !== null ? index + 1 : 0} / {n}
            </p>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ivory/80 transition-colors hover:bg-white/10 hover:text-ivory"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
            {img && (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                className="lux-lightbox-img h-full w-full select-none object-contain"
                draggable={false}
              />
            )}
            {n > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => step(-1)}
                  className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-ivory/80 transition-colors hover:border-white/40 hover:text-ivory sm:flex"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => step(1)}
                  className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-ivory/80 transition-colors hover:border-white/40 hover:text-ivory sm:flex"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <p
            className="mx-auto max-w-2xl px-6 pt-4 text-center font-display text-sm text-ivory/70"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}
          >
            {img?.alt}
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Lightbox;
