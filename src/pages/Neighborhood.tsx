import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { neighborhoodGalleryService } from "@/services/neighborhoodGalleryService";
import type { PublicNeighborhoodGalleryItem } from "@/types/neighborhoodGallery";
import { MapPin } from "lucide-react";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Chatbot from "@/components/Chatbot";
import NeighborhoodDialog from "@/components/NeighborhoodDialog";
import GalleryLightbox from "@/components/GalleryLightbox";
import type { NeighborhoodSeo } from "@/data/neighborhoodSeo";
import { BOROUGHS } from "@/data/boroughSeo";

// Eagerly resolve every gallery asset URL once at build time.
const GALLERY_ASSETS = import.meta.glob(
  "@/assets/gallery/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

const resolveGallery = (file: string): string | undefined => {
  const match = Object.entries(GALLERY_ASSETS).find(([path]) =>
    path.endsWith(`/${file}`),
  );
  return match?.[1];
};

interface Props {
  neighborhood: NeighborhoodSeo;
}

const Neighborhood = ({ neighborhood: n }: Props) => {
  const borough = BOROUGHS[n.boroughSlug];
  const boroughHref = `/custom-kitchen-cabinets-${n.boroughSlug}`;
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [dbItems, setDbItems] = useState<PublicNeighborhoodGalleryItem[]>([]);

  useEffect(() => {
    let active = true;
    neighborhoodGalleryService
      .listPublishedBySlug(n.slug)
      .then((items) => { if (active) setDbItems(items); })
      .catch(() => { /* fall back to static gallery */ });
    return () => { active = false; };
  }, [n.slug]);

  const dbGallery = dbItems.map((i) => ({
    src: i.image_url,
    alt: i.alt_text || `${i.caption} — Green Cabinets NY, custom cabinetry in ${n.name}, ${n.boroughName}`,
    caption: i.caption,
    key: i.id,
  }));

  const staticGallery = n.gallery
    .map((item) => {
      const src = resolveGallery(item.file);
      if (!src) return null;
      return {
        src,
        alt: `${item.caption} — Green Cabinets NY, custom cabinetry in ${n.name}, ${n.boroughName}`,
        caption: item.caption,
      };
    })
    .filter((x): x is { src: string; alt: string; caption: string } => x !== null);

  const lightboxImages = [...dbGallery, ...staticGallery];
  const hasGallery = lightboxImages.length > 0;

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${n.url}#localbusiness`,
    name: `Green Cabinets NY — ${n.name}`,
    url: n.url,
    telephone: "+1-718-804-5488",
    image: "https://greencabinetsny.com/og-image.jpg",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "Place",
      name: `${n.name}, ${n.boroughName}, NY`,
      geo: {
        "@type": "GeoCoordinates",
        latitude: n.geo.latitude,
        longitude: n.geo.longitude,
      },
    },
    description: n.description,
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Custom Kitchen Cabinets",
    provider: { "@id": `${n.url}#localbusiness` },
    areaServed: {
      "@type": "Place",
      name: `${n.name}, ${n.boroughName}, NY`,
    },
    url: n.url,
    description: n.description,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: n.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{n.title}</title>
        <meta name="title" content={n.title} />
        <meta name="description" content={n.description} />
        <meta name="keywords" content={n.keywords} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={n.url} />
        <meta property="og:title" content={n.title} />
        <meta property="og:description" content={n.description} />
        <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={n.url} />
        <meta property="twitter:title" content={n.title} />
        <meta property="twitter:description" content={n.description} />
        <meta name="twitter:image" content="https://greencabinetsny.com/og-image.jpg" />

        <link rel="canonical" href={n.url} />

        <script type="application/ld+json">{JSON.stringify(localBusinessJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: borough.name, url: borough.url },
          { name: n.name, url: n.url },
        ]}
      />

      <Header />

      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wide text-sm">
              Serving {n.name}, {n.boroughName}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
            Custom Kitchen Cabinets in {n.name}
          </h1>
          <p className="text-xl text-[#555555] mb-6">{n.heroTagline}</p>
          <p className="text-lg text-[#555555]">{n.intro}</p>
          <p className="text-sm text-[#555555] mt-6">
            Part of our{" "}
            <Link to={boroughHref} className="text-primary font-semibold hover:underline">
              {borough.name} cabinetry
            </Link>{" "}
            service area · See all{" "}
            <Link to="/#neighborhoods" className="text-primary font-semibold hover:underline">
              NYC neighborhoods we serve
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#d5d5d5]">
        <div className="container mx-auto px-6 max-w-3xl space-y-12">
          {n.body.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-4">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-[#555555] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {n.gallery.length > 0 && (
        <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-3 text-center">
              Recent Green Cabinets projects
            </h2>
            <p className="text-center text-[#555555] mb-10 max-w-2xl mx-auto">
              A small sample of cabinetry styles we build for {n.name} kitchens — each
              one designed, milled, and hand-finished in our Bushwick shop.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {n.gallery.map((item, idx) => {
                const src = resolveGallery(item.file);
                if (!src) return null;
                const lightboxIdx = lightboxImages.findIndex((i) => i.src === src);
                const alt = `${item.caption} — Green Cabinets NY, custom cabinetry in ${n.name}, ${n.boroughName}`;
                return (
                  <li key={item.file}>
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(lightboxIdx >= 0 ? lightboxIdx : idx)}
                      aria-label={`View larger: ${item.caption}`}
                      className="group block w-full text-left bg-[#d5d5d5] rounded-xl overflow-hidden shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={src}
                          alt={alt}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="text-sm text-[#1a1a1a] px-4 py-3">
                        {item.caption}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-10 text-center">
              <Link
                to="/#gallery"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-[#445339] transition-colors"
              >
                See the full project gallery →
              </Link>
            </div>
          </div>
        </section>
      )}

      <GalleryLightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />

      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
            {n.name} Custom Cabinetry FAQs
          </h2>
          <div className="space-y-6">
            {n.faqs.map((f) => (
              <div key={f.question} className="bg-[#d5d5d5] rounded-xl p-6">
                <h3 className="font-display text-lg font-bold text-[#1a1a1a] mb-2">
                  {f.question}
                </h3>
                <p className="text-[#555555]">{f.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-[#555555]">
            Explore more cabinetry in{" "}
            <Link to={boroughHref} className="text-primary font-semibold hover:underline">
              {borough.name}
            </Link>
            , or open the{" "}
            <button
              type="button"
              onClick={() => setActiveNeighborhood(n.name)}
              className="text-primary font-semibold hover:underline"
            >
              {n.name} map
            </button>
            .
          </div>
        </div>
      </section>

      <Contact />
      <CTA />
      <Footer />
      <Chatbot />

      <NeighborhoodDialog
        neighborhood={activeNeighborhood}
        boroughSlug={n.boroughSlug}
        onClose={() => setActiveNeighborhood(null)}
      />
    </div>
  );
};

export default Neighborhood;
