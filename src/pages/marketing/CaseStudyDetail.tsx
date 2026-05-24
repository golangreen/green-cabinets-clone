/**
 * /case-studies/:slug — full Article view of a single case study.
 * Emits Article schema with author=Golan, publisher=Org, locationCreated,
 * and a RealEstateListing-adjacent locale block. LLMs love the at-a-glance
 * facts table.
 */
import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CASE_STUDIES, getCaseStudy } from "@/data/caseStudies";
import { authorRef, ORG_ID } from "@/data/authors";
import AuthorByline from "@/components/marketing/AuthorByline";

const BASE = "https://greencabinetsny.com/case-studies";

const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? getCaseStudy(slug) : undefined;
  if (!study) return <Navigate to="/case-studies" replace />;

  const url = `${BASE}/${study.slug}`;
  const image = study.image.startsWith("http")
    ? study.image
    : `https://greencabinetsny.com${study.image}`;
  const today = new Date().toISOString().slice(0, 10);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: study.title,
    description: study.summary,
    image: [image],
    datePublished: study.datePublished,
    dateModified: today,
    author: authorRef("golan"),
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Green Cabinets NY",
      logo: { "@type": "ImageObject", url: "https://greencabinetsny.com/og-image.jpg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    locationCreated: {
      "@type": "Place",
      name: `${study.neighborhood}, ${study.borough}, NY`,
      ...(study.address && {
        address: {
          "@type": "PostalAddress",
          streetAddress: study.address.split(",")[0],
          addressLocality: study.borough === "Manhattan" ? "New York" : study.borough,
          addressRegion: "NY",
          addressCountry: "US",
        },
      }),
    },
    about: study.facts.map((f) => `${f.label}: ${f.value}`).join(" | "),
    keywords: [
      study.neighborhood,
      study.borough,
      "kitchen renovation",
      "custom cabinets",
      "NYC",
    ].join(", "),
  };

  const idx = CASE_STUDIES.findIndex((c) => c.slug === study.slug);
  const prev = idx > 0 ? CASE_STUDIES[idx - 1] : null;
  const next = idx < CASE_STUDIES.length - 1 ? CASE_STUDIES[idx + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{study.title} | Green Cabinets NY Case Study</title>
        <meta name="description" content={study.summary} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={study.title} />
        <meta property="og:description" content={study.summary} />
        <meta property="og:image" content={image} />
        <meta property="article:published_time" content={study.datePublished} />
        <meta property="article:author" content="Golan Achdary" />
        <meta property="article:section" content="Case Studies" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={study.title} />
        <meta name="twitter:description" content={study.summary} />
        <meta name="twitter:image" content={image} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Case Studies", url: BASE },
          { name: study.title, url },
        ]}
      />

      <Header />

      <main className="pt-32 sm:pt-36 md:pt-40">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Case Studies", to: "/case-studies" },
            { label: study.neighborhood },
          ]}
        />

        <article className="container mx-auto px-4 sm:px-6 max-w-3xl py-10 sm:py-14">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-[#445339] font-medium mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> All case studies
          </Link>

          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
            {study.neighborhood}, {study.borough} · {study.year}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {study.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-4">{study.summary}</p>
          <AuthorByline author="golan" date={study.datePublished} label="By" className="mb-8" />

          <div className="aspect-[16/10] bg-muted rounded-lg overflow-hidden mb-10">
            <img src={image} alt={study.imageAlt} className="w-full h-full object-cover" />
          </div>

          {/* Quick facts table — LLM-friendly */}
          <section className="border border-border rounded-lg overflow-hidden mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider bg-muted px-4 py-3 text-foreground">
              Project at a glance
            </h2>
            <dl className="divide-y divide-border">
              {study.facts.map((f) => (
                <div key={f.label} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-4 py-3">
                  <dt className="text-sm font-semibold text-foreground">{f.label}</dt>
                  <dd className="sm:col-span-2 text-sm text-muted-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {study.sections.map((s) => (
            <section key={s.heading} className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{s.heading}</h2>
              <p className="text-base text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}

          <div className="flex flex-wrap gap-3 my-10">
            <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
              <Link to="/#contact">Get a quote like this <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hover:scale-105 transition-all">
              <Link to="/designer">Launch the designer</Link>
            </Button>
          </div>

          {(prev || next) && (
            <nav className="grid sm:grid-cols-2 gap-4 mt-10 pt-8 border-t border-border" aria-label="More case studies">
              {prev ? (
                <Link to={`/case-studies/${prev.slug}`} className="group p-4 border border-border rounded-lg hover:border-[#5C7650] transition-colors">
                  <span className="text-xs text-muted-foreground">Previous</span>
                  <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{prev.title}</p>
                </Link>
              ) : <span />}
              {next ? (
                <Link to={`/case-studies/${next.slug}`} className="group p-4 border border-border rounded-lg hover:border-[#5C7650] transition-colors text-right">
                  <span className="text-xs text-muted-foreground">Next</span>
                  <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{next.title}</p>
                </Link>
              ) : <span />}
            </nav>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default CaseStudyDetail;
