/**
 * Per-species deep page — /wood-species/:slug
 * Long-form SEO content with multi-paragraph copy, spec table,
 * pros/cons, FAQ, related species, and CTA.
 */
import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { WOOD_SPECIES, getWoodSpecies } from "@/data/woodSpecies";
import { getComparisonsFor } from "@/data/woodComparisons";
import WoodGalleryCarousel from "@/components/wood/WoodGalleryCarousel";

const WoodSpeciesDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const wood = slug ? getWoodSpecies(slug) : undefined;

  if (!wood) return <Navigate to="/wood-species" replace />;

  const url = `https://greencabinetsny.com/wood-species/${wood.slug}`;
  const comparisons = getComparisonsFor(wood.slug);
  const comparisonSlugs = new Set(comparisons.map((c) => c.slug));
  // Prefer species not already shown in the comparison block, fall back to any other.
  const relatedPool = WOOD_SPECIES.filter((w) => w.slug !== wood.slug && !comparisonSlugs.has(w.slug));
  const related = (relatedPool.length >= 3 ? relatedPool : WOOD_SPECIES.filter((w) => w.slug !== wood.slug)).slice(0, 3);

  const isoToday = new Date().toISOString().slice(0, 10);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${wood.name} Cabinets — Complete Guide`,
    description: wood.shortDescription,
    image: [wood.image.startsWith("http") ? wood.image : `https://greencabinetsny.com${wood.image}`],
    datePublished: "2024-01-15",
    dateModified: isoToday,
    author: { "@type": "Organization", name: "Green Cabinets NY", url: "https://greencabinetsny.com" },
    publisher: {
      "@type": "Organization",
      name: "Green Cabinets NY",
      logo: { "@type": "ImageObject", url: "https://greencabinetsny.com/og-image.jpg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: wood.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{wood.metaTitle ?? `${wood.name} Kitchen Cabinets — Grain, Hardness, Cost & Finishes | Green Cabinets NY`}</title>
        <meta
          name="description"
          content={wood.metaDescription ?? `${wood.shortDescription} Janka hardness ${wood.jankaHardness} lbf. Built in Brooklyn since 2009.`}
        />
        <meta name="keywords" content={wood.keywords.join(", ")} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={`${wood.name} Cabinets — Complete Guide`} />
        <meta property="og:description" content={wood.shortDescription} />
        <meta property="og:image" content={wood.image.startsWith("http") ? wood.image : `https://greencabinetsny.com${wood.image}`} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Wood Species", to: "/wood-species" },
          { label: wood.name },
        ]}
      />

      <main className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
        {/* Hero */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4">
                <Link
                  to="/wood-species"
                  className="inline-flex items-center gap-1 text-sm text-[#5C7650] hover:text-[#445339]"
                >
                  <ArrowLeft className="w-4 h-4" /> All wood species
                </Link>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-10 h-10 rounded-full border-2 border-border shrink-0"
                    style={{ backgroundColor: wood.swatch }}
                    aria-hidden="true"
                  />
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a]">
                    {wood.h1 ?? wood.name}
                  </h1>
                </div>
                <p className="text-lg text-[#5C7650] italic">{wood.tagline}</p>
                <p className="text-base text-[#555555] leading-relaxed">{wood.shortDescription}</p>
                <p className="text-xs text-[#999999]">
                  <em>{wood.scientificName}</em> · {wood.origin}
                </p>
              </div>
              <WoodGalleryCarousel
                speciesName={wood.name}
                images={[wood.image, wood.grainImage, ...(wood.gallery ?? [])]}
              />
            </div>
          </div>
        </section>

        {/* Spec table */}
        <section className="py-10 bg-muted/40 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <Spec label="Janka Hardness" value={`${wood.jankaHardness.toLocaleString()} lbf`} />
              <Spec label="Cost Tier" value={wood.costTier} />
              <Spec label="Workability" value={wood.workability} />
              <Spec label="Stain Take" value={wood.stainTake} />
              <Spec label="Stability (1–5)" value={String(wood.stability)} />
              <Spec label="Specific Gravity" value={wood.specificGravity.toFixed(2)} />
              <Spec label="Color" value={wood.color} small />
              <Spec label="Grain" value={wood.grain} small />
            </div>
          </div>
        </section>

        {/* Long-form */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl prose prose-neutral max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-6">
              {wood.aboutHeading ?? `About ${wood.name}`}
            </h2>
            <div className="space-y-5 text-[#1a1a1a] leading-relaxed">
              {wood.longDescription.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Grain image */}
        <section className="pb-12 sm:pb-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src={wood.grainImage}
                alt={`Close-up of ${wood.name} grain pattern`}
                loading="lazy"
                className="w-full aspect-[16/7] object-cover"
              />
            </div>
            <p className="text-xs text-[#999999] text-center mt-2">
              Close-up of {wood.name.toLowerCase()} grain — {wood.grain.toLowerCase()}.
            </p>
          </div>
        </section>

        {/* Pros & Cons */}
        <section className="py-12 sm:py-16 bg-muted/40">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-8 text-center">
              The Honest Tradeoffs
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-[#5C7650] mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5" /> What we love
                  </h3>
                  <ul className="space-y-2">
                    {wood.pros.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-[#1a1a1a]">
                        <Check className="w-4 h-4 text-[#5C7650] shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                    <X className="w-5 h-5" /> What to watch for
                  </h3>
                  <ul className="space-y-2">
                    {wood.cons.map((c) => (
                      <li key={c} className="flex gap-2 text-sm text-[#1a1a1a]">
                        <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Best uses / finishes / styles */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="grid md:grid-cols-3 gap-6">
              <DetailList title="Common Uses" items={wood.uses} />
              <DetailList title="Best Finishes" items={wood.bestFinishes} />
              <DetailList title="Door Styles That Suit It" items={wood.bestDoorStyles} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        {wood.faqs.length > 0 && (
          <section className="py-12 sm:py-16 bg-muted/40">
            <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <dl className="space-y-6">
                {wood.faqs.map((f) => (
                  <div key={f.question}>
                    <dt className="font-semibold text-[#1a1a1a] mb-2">{f.question}</dt>
                    <dd className="text-[#555555] leading-relaxed">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* Direct head-to-head comparisons (internal linking for topical authority) */}
        {comparisons.length > 0 && (
          <section className="py-12 sm:py-16 bg-[#f7f7f5]">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-3 text-center">
                {wood.name} Comparisons
              </h2>
              <p className="text-center text-[#555555] mb-8 max-w-2xl mx-auto">
                Choosing between species or cuts? These head-to-head guides break down grain, cost, durability, and best use.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {comparisons.map((c) => {
                  const target = getWoodSpecies(c.slug)!;
                  return (
                    <Link
                      key={c.slug}
                      to={`/wood-species/${c.slug}`}
                      className="group flex flex-col rounded-lg border border-border bg-background p-5 hover:border-[#5C7650] hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          aria-hidden="true"
                          className="inline-block w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: wood.swatch }}
                        />
                        <span className="text-[#999] text-sm">vs</span>
                        <span
                          aria-hidden="true"
                          className="inline-block w-6 h-6 rounded border border-border"
                          style={{ backgroundColor: target.swatch }}
                        />
                      </div>
                      <h3 className="font-semibold text-[#1a1a1a] group-hover:text-[#5C7650] transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-sm text-[#555555] mt-2 leading-relaxed flex-1">{c.blurb}</p>
                      <span className="inline-flex items-center text-[#5C7650] text-sm font-medium mt-4">
                        Read the comparison <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Related */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-8 text-center">
              Compare with Other Species
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((w) => (
                <Link
                  key={w.slug}
                  to={`/wood-species/${w.slug}`}
                  className="group block rounded-lg border border-border overflow-hidden hover:border-[#5C7650] hover:shadow-lg transition-all"
                >
                  <img
                    src={w.image}
                    alt={`${w.name} cabinet wood`}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a]">{w.name}</h3>
                    <p className="text-xs text-[#555555] mt-1 line-clamp-2">{w.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" className="border-[#5C7650] text-[#5C7650] hover:bg-[#5C7650] hover:text-white">
                <Link to="/wood-species">
                  See all wood species <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-[#5C7650] text-white">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Want a real {wood.name.toLowerCase()} sample in your hand?
            </h2>
            <p className="text-base sm:text-lg text-white/90">
              Visit our Bushwick showroom or have us bring samples to your home anywhere in NYC.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-white text-[#5C7650] hover:bg-white/90 hover:scale-105 transition-all">
                <Link to="/#contact">Book a free consultation</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#5C7650] hover:scale-105 transition-all">
                <Link to="/designer">Launch the designer</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const Spec = ({ label, value, small }: { label: string; value: string; small?: boolean }) => (
  <div className="bg-background rounded-lg p-3 border border-border">
    <p className="text-xs text-[#999999] uppercase tracking-wider">{label}</p>
    <p className={`font-semibold text-[#1a1a1a] mt-1 ${small ? "text-xs" : "text-base"}`}>{value}</p>
  </div>
);

const DetailList = ({ title, items }: { title: string; items: string[] }) => (
  <div className="bg-muted/40 rounded-lg p-5 border border-border">
    <h3 className="font-semibold text-[#5C7650] mb-3">{title}</h3>
    <ul className="space-y-1.5">
      {items.map((it) => (
        <li key={it} className="text-sm text-[#1a1a1a] flex gap-2">
          <span className="text-[#5C7650]">•</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default WoodSpeciesDetail;
