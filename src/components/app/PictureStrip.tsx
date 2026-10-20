import { useState } from "react";
import { X } from "lucide-react";
import Lightbox from "@/components/lux/Lightbox";

/** A row of pictures: tap one to see it big, X to take it out. */
const PictureStrip = ({ pictures, label, onRemove }: { pictures: string[]; label: string; onRemove: (i: number) => void }) => {
  const [preview, setPreview] = useState<number | null>(null);
  if (!pictures.length) return null;
  return (
    <>
      <ul aria-label={label} className="flex gap-3 overflow-x-auto pb-2">
        {pictures.map((src, i) => (
          <li key={src.slice(-40) + i} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setPreview(i)}
              aria-label={`See picture ${i + 1}`}
              className="block overflow-hidden border border-white/15"
            >
              <img src={src} alt="" className="h-32 w-auto" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove picture ${i + 1}`}
              className="absolute right-1 top-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/85 text-ivory backdrop-blur active:scale-95"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        images={pictures.map((src, i) => ({ src, alt: `Picture ${i + 1}` }))}
        index={preview}
        onIndex={setPreview}
        onClose={() => setPreview(null)}
      />
    </>
  );
};

export default PictureStrip;
