import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

import luxuryKitchenMarbleDining from "@/assets/gallery/luxury-kitchen-marble-dining.jpeg";
import modernKitchenWoodCabinetsCloseup from "@/assets/gallery/modern-kitchen-wood-cabinets-closeup.webp";
import contemporaryWhiteKitchenMarbleIsland from "@/assets/gallery/contemporary-white-kitchen-marble-island.webp";
import luxuryWalkInClosetWoodShelving from "@/assets/gallery/luxury-walk-in-closet-wood-shelving.jpg";
import luxuryWalkInClosetIntegratedLighting from "@/assets/gallery/luxury-walk-in-closet-integrated-lighting.jpg";
import darkWalkInClosetCenterIsland from "@/assets/gallery/dark-walk-in-closet-center-island.jpg";
import naturalWoodHallwayCabinets from "@/assets/gallery/natural-wood-hallway-cabinets.jpeg";
import modernWorkspaceWoodDeskBrick from "@/assets/gallery/modern-workspace-wood-desk-brick.jpeg";
import modernStudioWoodCabinetry from "@/assets/gallery/modern-studio-wood-cabinetry.jpeg";
import loftKitchenExposedBrickNaturalWood from "@/assets/gallery/loft-kitchen-exposed-brick-natural-wood.jpeg";
import modernOpenLivingWoodKitchen from "@/assets/gallery/modern-open-living-wood-kitchen.jpeg";

type Category = "Kitchens" | "Closets" | "Built-ins" | "Commercial Millwork";

interface Item {
  src: string;
  alt: string;
  category: Category;
}

const items: Item[] = [
  { src: luxuryKitchenMarbleDining, alt: "Luxury kitchen with marble island and integrated dining", category: "Kitchens" },
  { src: modernKitchenWoodCabinetsCloseup, alt: "Modern wood kitchen cabinets with marble countertops", category: "Kitchens" },
  { src: contemporaryWhiteKitchenMarbleIsland, alt: "Contemporary white kitchen with marble waterfall island", category: "Kitchens" },
  { src: luxuryWalkInClosetWoodShelving, alt: "Luxury walk-in closet with custom wood shelving", category: "Closets" },
  { src: luxuryWalkInClosetIntegratedLighting, alt: "Walk-in closet with integrated lighting", category: "Closets" },
  { src: darkWalkInClosetCenterIsland, alt: "Dark walk-in closet with center island", category: "Closets" },
  { src: naturalWoodHallwayCabinets, alt: "Natural wood hallway built-in cabinets", category: "Built-ins" },
  { src: modernStudioWoodCabinetry, alt: "Modern studio with floor-to-ceiling wood cabinetry", category: "Built-ins" },
  { src: modernWorkspaceWoodDeskBrick, alt: "Commercial workspace with custom wood desk and millwork", category: "Commercial Millwork" },
  { src: loftKitchenExposedBrickNaturalWood, alt: "Loft commercial kitchen with natural wood millwork", category: "Commercial Millwork" },
  { src: modernOpenLivingWoodKitchen, alt: "Open commercial space with wood kitchen millwork", category: "Commercial Millwork" },
];

const categories: ("All" | Category)[] = ["All", "Kitchens", "Closets", "Built-ins", "Commercial Millwork"];

const LuxuryMillworkGallery = () => {
  const [active, setActive] = useState<"All" | Category>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "All" ? items : items.filter((i) => i.category === active)),
    [active]
  );

  const current = openIndex !== null ? filtered[openIndex] : null;

  const go = (delta: number) => {
    if (openIndex === null) return;
    const next = (openIndex + delta + filtered.length) % filtered.length;
    setOpenIndex(next);
  };

  return (
    <section
      id="luxury-millwork-gallery"
      className="py-16 sm:py-20 md:py-24 bg-[#d5d5d5]"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Luxury Millwork Gallery
          </h2>
          <p className="text-lg text-[#555555] leading-relaxed">
            Explore our recent work across kitchens, closets, built-ins, and commercial millwork in NYC.
          </p>
        </div>

        <div className="sticky top-24 sm:top-32 md:top-40 z-30 -mx-6 mb-10 py-3 bg-[#d5d5d5]/85 supports-[backdrop-filter]:bg-[#d5d5d5]/70 backdrop-blur-md border-b border-border/40">
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#d5d5d5] to-transparent z-10" aria-hidden="true" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#d5d5d5] to-transparent z-10" aria-hidden="true" />
            <div
              role="tablist"
              aria-label="Filter gallery by category"
              className="flex flex-nowrap items-center gap-3 md:gap-4 overflow-x-auto scrollbar-none px-6 py-1 [-webkit-overflow-scrolling:touch] md:justify-center"
            >
              {categories.map((c, idx) => {
                const isActive = active === c;
                return (
                  <div key={c} className="flex items-center gap-3 md:gap-4 shrink-0">
                    {idx > 0 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    )}
                    <button
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(c)}
                      className={[
                        "shrink-0 whitespace-nowrap text-base md:text-lg tracking-wide transition-colors duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm",
                        isActive
                          ? "text-[#1a1a1a] font-semibold"
                          : "text-muted-foreground font-normal hover:text-[#1a1a1a]",
                      ].join(" ")}
                    >
                      {c}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="-mx-6">
          <div className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-proximity scrollbar-none px-6 pb-4 [-webkit-overflow-scrolling:touch] [scroll-padding-inline-start:1.5rem] md:[scroll-padding-inline-start:2rem] [scroll-snap-stop:normal] overscroll-x-contain">
            {filtered.map((item, i) => (
              <button
                key={item.src}
                onClick={() => setOpenIndex(i)}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-card focus:outline-none focus:ring-2 focus:ring-primary snap-start md:snap-start shrink-0 w-[80vw] sm:w-[48vw] md:w-[36vw] lg:w-[28vw] scroll-ml-6 md:scroll-ml-8"
                aria-label={`Open image: ${item.alt}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-sm font-medium">{item.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-background border-0">
          <DialogTitle className="sr-only">{current?.alt ?? "Gallery image"}</DialogTitle>
          <DialogDescription className="sr-only">{current?.category}</DialogDescription>
          {current && (
            <div className="relative">
              <img src={current.src} alt={current.alt} className="w-full h-auto max-h-[85vh] object-contain bg-black" />
              <button
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="p-4 text-center text-sm text-[#555555]">
                {current.alt} — <span className="font-medium text-[#1a1a1a]">{current.category}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LuxuryMillworkGallery;
