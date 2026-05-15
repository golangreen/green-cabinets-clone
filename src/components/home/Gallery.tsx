/**
 * Gallery (homepage "Our Work") — 4-image preview per category, mirroring the
 * Finishes & Colors section pattern. Pick a category, see 4 highlights, then
 * click "See all" to open the full filterable gallery on /gallery.
 */
import { useState } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { galleryImages, type GalleryCategory } from "@/data/galleryImages";

const CATEGORIES: { key: GalleryCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "kitchens", label: "Kitchens" },
  { key: "vanities", label: "Vanities" },
  { key: "closets", label: "Closets" },
  { key: "design-to-reality", label: "Design to Reality" },
];

const PREVIEW_COUNT = 4;

const Gallery = () => {
  const [active, setActive] = useState<GalleryCategory>("all");

  const filtered =
    active === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === active);

  const previews = filtered.slice(0, PREVIEW_COUNT);
  const activeLabel = CATEGORIES.find((c) => c.key === active)?.label ?? "All";
  const seeAllHref = active === "all" ? "/gallery" : `/gallery?category=${active}`;

  return (
    <section
      id="gallery"
      className="py-16 sm:py-20 md:py-28 lg:py-32 bg-muted/30"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Real Projects · Real Craftsmanship
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Work
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our portfolio of custom cabinetry. Pick a category to see a
            preview, then view the full gallery.
          </p>
        </div>

        {/* Category breadcrumb selector */}
        <div className="sticky top-24 sm:top-32 md:top-40 z-30 -mx-4 sm:-mx-6 mb-6 bg-muted/85 backdrop-blur-md border-b border-border/40">
          <div className="relative">
            <div
              className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none px-6 py-2 md:justify-center [-webkit-overflow-scrolling:touch] [scroll-padding-inline:1.8rem]"
              role="tablist"
              aria-label="Filter projects by category"
            >
              {CATEGORIES.map((c, idx) => {
                const isActive = active === c.key;
                return (
                  <div key={c.key} className="flex items-center gap-2 shrink-0">
                    {idx > 0 && (
                      <ChevronRight
                        className="h-4 w-4 text-muted-foreground/60 shrink-0"
                        aria-hidden
                      />
                    )}
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(c.key)}
                      className={`shrink-0 text-base md:text-lg transition-all active:scale-95 ${
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground font-normal hover:text-foreground"
                      }`}
                    >
                      {c.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Horizontal preview rail — 4 projects per category, swipe to reveal */}
        {previews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No projects in this category yet.
          </div>
        ) : (
          <div
            className="-mx-4 sm:-mx-6 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scroll-padding-inline:1rem] sm:[scroll-padding-inline:1.5rem] [scroll-snap-stop:always] [overscroll-behavior-x:contain]"
            aria-label={`${activeLabel} project previews`}
          >
            <ul className="flex flex-nowrap gap-4 px-4 sm:px-6 pb-2">
              {previews.map((image, idx) => (
                <li
                  key={idx}
                  className="snap-start shrink-0 w-[70%] sm:w-[40%] md:w-[28%] lg:w-[22%]"
                >
                  <Link
                    to={seeAllHref}
                    className="group block rounded-lg overflow-hidden border border-border bg-card hover:border-[#5C7650] hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            className="border-[#5C7650] text-[#5C7650] hover:bg-[#5C7650] hover:text-white"
          >
            <Link to={seeAllHref}>
              See all {activeLabel} projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
