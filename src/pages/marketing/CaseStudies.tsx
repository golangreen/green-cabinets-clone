/**
 * /case-studies — index of long-form project write-ups.
 * Each card links to /case-studies/:slug. Emits ItemList schema for the index
 * and individual Article schemas with author = Golan Achdary (via authorRef).
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { ArrowRight } from "lucide-react";
import { CASE_STUDIES } from "@/data/caseStudies";
import { authorRef, ORG_ID } from "@/data/authors";

const URL = "https://greencabinetsny.com/case-studies";
const TITLE = "Case Studies — NYC Kitchen Projects | Green Cabinets NY";
const DESC =
  "Real Green Cabinets NY projects across NYC: budgets, timelines, materials, lessons. Park Slope brownstones, UES co-ops, LIC lofts.";

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Green Cabinets NY case studies",
  numberOfItems: CASE_STUDIES.length,
  itemListElement: CASE_STUDIES.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${URL}/${c.slug}`,
    name: c.title,
  })),
};

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${URL}#collectionpage`,
  url: URL,
  name: TITLE,
  description: DESC,
  isPartOf: { "@id": "https://greencabinetsny.com/#website" },
  publisher: { "@id": ORG_ID },
  hasPart: CASE_STUDIES.map((c) => ({
    "@type": "Article",
    "@id": `${URL}/${c.slug}#article`,
    headline: c.title,
    description: c.summary,
    author: authorRef("golan"),
    publisher: { "@id": ORG_ID },
    datePublished: c.datePublished,
    url: `${URL}/${c.slug}`,
    locationCreated: {
      "@type": "Place",
      name: `${c.neighborhood}, ${c.borough}, NY`,
    },
  })),
};

const CaseStudies = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <link rel="canonical" href={URL} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={URL} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESC} />
      <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(collectionPageSchema)}</script>
    </Helmet>

    <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Case Studies", url: URL }]} />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Case Studies" }]} />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Real numbers · Real timelines · Real NYC projects
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Case Studies
          </h1>
          <p className="text-base sm:text-lg text-[#444] max-w-2xl mx-auto">
            Detailed write-ups of recent installs — budgets, timelines, materials, and what we'd
            do differently next time. Useful if you're planning your own project, or just want to
            see what something actually costs in NYC.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            {CASE_STUDIES.map((c) => (
              <Link
                key={c.slug}
                to={`/case-studies/${c.slug}`}
                className="group block border border-border rounded-lg overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all bg-card"
              >
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.imageAlt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-[#5C7650] font-semibold mb-2">
                    {c.neighborhood}, {c.borough} · {c.year}
                  </p>
                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-[#5C7650] transition-colors">
                    {c.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{c.summary}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#5C7650]">
                    Read case study <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default CaseStudies;
