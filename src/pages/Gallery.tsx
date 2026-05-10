import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { galleryImages, type GalleryCategory } from "@/data/galleryImages";

const CATEGORIES: { key: GalleryCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "kitchens", label: "Kitchens" },
  { key: "vanities", label: "Vanities" },
  { key: "closets", label: "Closets" },
  { key: "design-to-reality", label: "Design to Reality" },
];

const isCategory = (v: string | null): v is GalleryCategory =>
  !!v && CATEGORIES.some((c) => c.key === v);

const GalleryPage = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("category");
  const [active, setActive] = useState<GalleryCategory>(
    isCategory(initial) ? initial : "all",
  );

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (active === "all") next.delete("category");
    else next.set("category", active);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const filtered =
    active === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === active);

  const activeLabel = CATEGORIES.find((c) => c.key === active)?.label ?? "All";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Project Gallery — Custom Kitchens, Vanities & Closets | Green Cabinets NY</title>
        <meta
          name="description"
          content="Browse our full gallery of custom kitchens, bathroom vanities, and closets built in Brooklyn for homes across NYC."
        />
        <link rel="canonical" href="https://greencabinetsny.com/gallery" />
      </Helmet>

      <Header />

      <main className="pt-24 pb-20">
        {/* Back link — sticky on mobile so it's always reachable */}
        <div className="sticky top-16 md:top-20 z-40 bg-background/85 backdrop-blur-md border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-2 md:py-3">
            <button
              type="button"
              onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/")}
              className="inline-flex items-center gap-2 text-sm text-[#5C7650] hover:text-[#445339] font-medium transition-colors active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <header className="text-center mb-10">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
              Real Projects · Real Craftsmanship
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Work
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse the complete portfolio of custom cabinetry, vanities, and
              closets we've built for NYC homes.
            </p>
          </header>

          {/* Category selector */}
          <div className="sticky top-16 md:top-20 z-30 -mx-4 sm:-mx-6 mb-8 bg-background/85 backdrop-blur-md border-b border-border/40">
            <div
              className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none px-6 py-2 md:justify-center"
              role="tablist"
              aria-label="Filter projects by category"
            >
              {CATEGORIES.map((c, idx) => {
                const isActive = active === c.key;
                return (
                  <div key={c.key} className="flex items-center gap-2 shrink-0">
                    {idx > 0 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" aria-hidden />
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

          <p className="text-center text-sm text-muted-foreground mb-6">
            Showing {filtered.length} {activeLabel.toLowerCase()} project{filtered.length === 1 ? "" : "s"}
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((image, idx) => (
              <li
                key={idx}
                className="group rounded-lg overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{image.alt}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
