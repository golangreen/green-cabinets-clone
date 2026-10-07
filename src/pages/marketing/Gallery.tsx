import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/lux/PageHero";
import Lightbox from "@/components/lux/Lightbox";
import ContactCta from "@/components/home/lux/ContactCta";
import { useLuxPage } from "@/hooks/useLuxPage";
import { galleryImages, type GalleryCategory } from "@/data/galleryImages";

const CATEGORIES: { key: GalleryCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "kitchens", label: "Kitchens" },
  { key: "vanities", label: "Vanities" },
  { key: "closets", label: "Closets" },
  { key: "design-to-reality", label: "Design to reality" },
];

const isCategory = (v: string | null): v is GalleryCategory =>
  !!v && CATEGORIES.some((c) => c.key === v);

const countFor = (key: GalleryCategory) =>
  key === "all" ? galleryImages.length : galleryImages.filter((i) => i.category === key).length;

const GalleryPage = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("category");
  const [active, setActive] = useState<GalleryCategory>(isCategory(initial) ? initial : "all");
  const [open, setOpen] = useState<number | null>(null);

  useLuxPage(active);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (active === "all") next.delete("category");
    else next.set("category", active);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const filtered = active === "all" ? galleryImages : galleryImages.filter((img) => img.category === active);
  const close = useCallback(() => setOpen(null), []);

  return (
    <div className="min-h-dvh bg-ink text-ivory">
      <Helmet>
        <title>Project Gallery — Kitchens & Vanities | Green Cabinets</title>
        <meta
          name="description"
          content="Browse our full gallery of custom kitchens, bathroom vanities, and closets built in Brooklyn for homes across NYC."
        />
        <link rel="canonical" href="https://greencabinetsny.com/gallery" />
        <meta property="og:title" content="Project Gallery: Custom Kitchens, Vanities & Closets | Green Cabinets" />
        <meta property="og:description" content="Real Brooklyn and NYC projects: custom kitchens, bathroom vanities, and closet systems designed by us and built by vetted millwork suppliers." />
        <meta property="og:url" content="https://greencabinetsny.com/gallery" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Project Gallery — Custom Kitchens, Vanities & Closets",
          description: "Browse our full gallery of custom kitchens, bathroom vanities, and closets built in Brooklyn for homes across NYC.",
          url: "https://greencabinetsny.com/gallery",
          isPartOf: { "@type": "WebSite", name: "Green Cabinets NY", url: "https://greencabinetsny.com" },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: filtered.length,
            itemListElement: filtered.slice(0, 30).map((img, i) => ({
              "@type": "ImageObject",
              position: i + 1,
              contentUrl: img.src,
              name: img.alt,
            })),
          },
        })}</script>
      </Helmet>

      <Header />

      <main>
        <PageHero
          crumbs={[{ label: "Home", to: "/" }, { label: "Work" }]}
          eyebrow="The work"
          title={
            <>
              Rooms we&rsquo;ve <em className="italic text-brass">built</em> for.
            </>
          }
          lede="Kitchens, vanities and closets across Brooklyn, Manhattan and Queens. Every one drawn to the room it lives in, not picked from a catalog."
        />

        {/* Category tabs: stick under the header while the grid scrolls */}
        <div className="lux-material sticky top-[calc(4rem+env(safe-area-inset-top,0px))] md:top-[calc(5rem+env(safe-area-inset-top,0px))] z-30 border-y border-white/10">
          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="mx-auto flex max-w-[1440px] gap-7 overflow-x-auto px-4 scrollbar-none sm:px-6 lg:px-10"
          >
            {CATEGORIES.map((c) => {
              const on = active === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(c.key)}
                  className={`relative shrink-0 whitespace-nowrap py-4 font-display text-sm transition-colors duration-200 ${
                    on ? "text-ivory" : "text-stone hover:text-ivory"
                  }`}
                >
                  {c.label}
                  <span className="ml-1.5 tabular-nums text-xs text-stone">{countFor(c.key)}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-brass transition-transform duration-300 [transition-timing-function:var(--ease-out)] ${
                      on ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <section aria-label={`${filtered.length} projects`} className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-10">
          <ul key={active} className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5">
            {filtered.map((image, idx) => (
              <li
                key={image.src}
                className="break-inside-avoid"
                data-reveal="up"
                style={{ "--d": `${(idx % 3) * 70}ms` } as React.CSSProperties}
              >
                <button
                  type="button"
                  onClick={() => setOpen(idx)}
                  className="group block w-full text-left"
                  aria-label={`View larger: ${image.alt}`}
                >
                  <div className="overflow-hidden bg-ink-3">
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading={idx < 6 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-auto w-full transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-3 font-display text-sm leading-snug text-stone transition-colors group-hover:text-ivory/80">
                    {image.alt}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <ContactCta />
      </main>

      <Footer />

      <Lightbox images={filtered} index={open} onIndex={setOpen} onClose={close} />
    </div>
  );
};

export default GalleryPage;
