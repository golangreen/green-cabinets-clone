import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Chatbot from "@/components/Chatbot";
import NeighborhoodDialog from "@/components/NeighborhoodDialog";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BOROUGHS, BoroughSlug } from "@/data/boroughSeo";
import { NEIGHBORHOODS } from "@/data/neighborhoodSeo";
import Neighborhood from "@/pages/Neighborhood";
import NotFound from "@/pages/NotFound";

const PREFIX = "custom-kitchen-cabinets-";

const Borough = () => {
  const { boroughPath } = useParams<{ boroughPath: string }>();
  const hasPrefix = !!boroughPath && boroughPath.startsWith(PREFIX);
  const slug = hasPrefix ? boroughPath!.slice(PREFIX.length) : undefined;
  const borough = slug ? BOROUGHS[slug as BoroughSlug] : undefined;
  const neighborhood = slug ? NEIGHBORHOODS[slug] : undefined;
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null);

  if (neighborhood) return <Neighborhood neighborhood={neighborhood} />;
  if (!borough) return <NotFound />;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: borough.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Custom Kitchen Cabinets",
    provider: {
      "@type": "LocalBusiness",
      name: "Green Cabinets NY",
      telephone: "+1-718-804-5488",
      url: "https://greencabinetsny.com",
    },
    areaServed: { "@type": "City", name: borough.name },
    url: borough.url,
    description: borough.description,
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{borough.title}</title>
        <meta name="title" content={borough.title} />
        <meta name="description" content={borough.description} />
        <meta name="keywords" content={borough.keywords} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={borough.url} />
        <meta property="og:title" content={borough.title} />
        <meta property="og:description" content={borough.description} />
        <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://greencabinetsny.com/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1216" />
        <meta property="og:image:height" content="640" />
        <meta property="og:image:alt" content="Sage green shaker kitchen cabinets with marble countertops in a Brooklyn brownstone — Green Cabinets NY" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={borough.url} />
        <meta property="twitter:title" content={borough.title} />
        <meta property="twitter:description" content={borough.description} />
        <meta name="twitter:image" content="https://greencabinetsny.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="Sage green shaker kitchen cabinets with marble countertops in a Brooklyn brownstone — Green Cabinets NY" />

        <link rel="canonical" href={borough.url} />

        <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: borough.name, url: borough.url }]} />

      <Header />

      <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Neighborhoods", to: "/#neighborhoods" },
            { label: borough.name },
          ]}
        />
      </div>

      <section className="pt-10 pb-16 sm:pb-20 md:pb-28 lg:pb-32 bg-background">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wide text-sm">
              Serving {borough.name}, NY
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
            Custom Kitchen Cabinets in {borough.name}
          </h1>
          <p className="text-xl text-[#555555] mb-8">{borough.heroTagline}</p>
          <p className="text-lg text-[#555555]">{borough.intro}</p>
          <p className="text-sm text-[#555555] mt-6">
            Browse all{" "}
            <Link to="/#neighborhoods" className="text-primary font-semibold hover:underline">
              neighborhoods we serve
            </Link>{" "}
            across NYC, or jump straight to our{" "}
            <Link to="/#faq" className="text-primary font-semibold hover:underline">
              cabinetry FAQs
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#d5d5d5]">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8 text-center">
            {borough.name} Neighborhoods We Serve
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {borough.neighborhoods.map((n) => (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => setActiveNeighborhood(n)}
                  className="w-full block bg-background rounded-lg px-4 py-3 text-center text-[#1a1a1a] font-medium hover:text-primary transition-colors"
                >
                  {n}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
            {borough.name} Custom Cabinetry FAQs
          </h2>
          <div className="space-y-6">
            {borough.faqs.map((f) => (
              <div key={f.question} className="bg-[#d5d5d5] rounded-xl p-6">
                <h3 className="font-display text-lg font-bold text-[#1a1a1a] mb-2">
                  {f.question}
                </h3>
                <p className="text-[#555555]">{f.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-[#555555]">
            Also serving{" "}
            {Object.values(BOROUGHS)
              .filter((b) => b.slug !== borough.slug)
              .map((b, i, arr) => (
                <span key={b.slug}>
                  <Link
                    to={`/custom-kitchen-cabinets-${b.slug}`}
                    className="text-primary font-semibold hover:underline"
                  >
                    {b.name}
                  </Link>
                  {i < arr.length - 1 ? " and " : ""}
                </span>
              ))}
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
        boroughSlug={borough.slug}
        onClose={() => setActiveNeighborhood(null)}
      />
    </div>
  );
};

export default Borough;
