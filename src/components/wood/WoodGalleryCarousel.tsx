/**
 * Wood species image carousel — shown at the top of each /wood-species/:slug page.
 * Lets users smoothly browse multiple panel/grain shots with arrows, dots, and swipe.
 */
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface WoodGalleryCarouselProps {
  speciesName: string;
  images: string[];
}

const WoodGalleryCarousel = ({ speciesName, images }: WoodGalleryCarouselProps) => {
  // De-duplicate while preserving order so single-image species don't show repeats.
  const slides = Array.from(new Set(images.filter(Boolean)));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (slides.length === 0) return null;

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        opts={{ loop: slides.length > 1, align: "start" }}
        className="rounded-xl overflow-hidden shadow-2xl"
      >
        <CarouselContent>
          {slides.map((src, i) => (
            <CarouselItem key={src + i}>
              <img
                src={src}
                alt={`${speciesName} cabinet wood panel ${i + 1} of ${slides.length}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="w-full aspect-[4/3] object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {slides.length > 1 && (
          <>
            <CarouselPrevious
              aria-label="Previous wood panel"
              className="left-3 bg-white/90 hover:bg-white text-[#1a1a1a] border-0 shadow-md"
            />
            <CarouselNext
              aria-label="Next wood panel"
              className="right-3 bg-white/90 hover:bg-white text-[#1a1a1a] border-0 shadow-md"
            />
          </>
        )}
      </Carousel>

      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label={`${speciesName} gallery`}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={current === i}
              aria-label={`Show ${speciesName} panel ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                current === i ? "w-6 bg-[#5C7650]" : "w-2 bg-[#5C7650]/30 hover:bg-[#5C7650]/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WoodGalleryCarousel;
