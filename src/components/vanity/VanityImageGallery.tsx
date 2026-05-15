import { useState } from "react";
import { ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { ShopifyProduct } from "@/types";

interface VanityImageGalleryProps {
  product: ShopifyProduct;
}

export const VanityImageGallery = ({ product }: VanityImageGalleryProps) => {
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(null);
  const images = product.node.images.edges;
  const hero = images[0];

  const open = (url: string, alt: string) => setLightbox({ url, alt });

  return (
    <div className="space-y-4 lg:col-span-1">
      {hero && (
        <div
          className="aspect-square overflow-hidden rounded-lg bg-secondary/20 cursor-pointer group relative touch-manipulation"
          onClick={() => open(hero.node.url, hero.node.altText || product.node.title)}
        >
          <img
            src={hero.node.url}
            alt={hero.node.altText || product.node.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-active:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 group-active:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <ZoomIn className="w-10 h-10 sm:w-12 sm:h-12 text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {images.slice(1).map((image, idx) => (
          <div
            key={idx}
            className="aspect-square overflow-hidden rounded-lg bg-secondary/20 cursor-pointer group relative touch-manipulation"
            onClick={() => open(image.node.url, image.node.altText || `${product.node.title} ${idx + 2}`)}
          >
            <img
              src={image.node.url}
              alt={image.node.altText || `${product.node.title} ${idx + 2}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-active:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 group-active:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!lightbox} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-0">
          {lightbox && (
            <img src={lightbox.url} alt={lightbox.alt} className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
