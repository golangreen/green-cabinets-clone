import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Chatbot from "@/components/Chatbot";
import { BOROUGHS, BoroughSlug } from "@/data/boroughSeo";

const Borough = () => {
  const { slug } = useParams<{ slug: string }>();
  const borough = slug ? BOROUGHS[slug as BoroughSlug] : undefined;

  if (!borough) return <Navigate to="/" replace />;

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
        <meta property="og:image" content="https://greencabinetsny.com/images/green-cabinets-og-image.jpg" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={borough.url} />
        <meta property="twitter:title" content={borough.title} />
        <meta property="twitter:description" content={borough.description} />

        <link rel="canonical" href={borough.url} />

        <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <Header />

      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background">
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
        </div>
      </section>

      <section className="py-16 bg-[#d5d5d5]">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8 text-center">
            {borough.name} Neighborhoods We Serve
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {borough.neighborhoods.map((n) => (
              <li
                key={n}
                className="bg-background rounded-lg px-4 py-3 text-center text-[#1a1a1a] font-medium"
              >
                {n}
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
    </div>
  );
};

export default Borough;
