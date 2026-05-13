/**
 * /about — team & expertise page. Hosts the canonical Person nodes
 * (Golan Achdary, Andy Lopez) so other pages can reference them by @id
 * via the central src/data/authors.ts module — strengthens E-E-A-T
 * for both Google and AI-citation engines.
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Hammer, Award } from "lucide-react";
import { PEOPLE, ORG_ID, AUTHOR_IDS } from "@/data/authors";

const URL = "https://greencabinetsny.com/about";
const TITLE = "About Green Cabinets NY — Bushwick Cabinet Shop Since 2009";
const DESC =
  "Meet the team behind Green Cabinets NY — founder Golan Achdary and project lead Andy Lopez. Custom kitchen cabinets, vanities, and millwork built in our Bushwick, Brooklyn shop since 2009.";

const aboutSchema = {
  "@context": "https://schema.org",
  "@graph": [
    ...PEOPLE,
    {
      "@type": "AboutPage",
      "@id": `${URL}#aboutpage`,
      url: URL,
      name: TITLE,
      description: DESC,
      mainEntity: { "@id": ORG_ID },
      about: [{ "@id": AUTHOR_IDS.golan }, { "@id": AUTHOR_IDS.andy }],
      isPartOf: { "@id": "https://greencabinetsny.com/#website" },
    },
  ],
};

const About = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <link rel="canonical" href={URL} />
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={URL} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESC} />
      <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESC} />
      <script type="application/ld+json">{JSON.stringify(aboutSchema)}</script>
    </Helmet>

    <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "About", url: URL }]} />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Bushwick · Since 2009
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            About Green Cabinets NY
          </h1>
          <p className="text-base sm:text-lg text-[#444] max-w-2xl mx-auto">
            We're a small Brooklyn cabinet shop building custom kitchens, vanities, closets, and
            millwork for NYC homes — milled, sprayed, and crated at 10 Montieth St since 2009.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 border border-border rounded-lg">
              <Hammer className="h-6 w-6 text-[#5C7650] mb-3" />
              <h3 className="font-semibold text-lg mb-1">Built in Brooklyn</h3>
              <p className="text-sm text-muted-foreground">
                Every cabinet is milled, sanded, and sprayed in our Bushwick shop. You're welcome
                to visit while yours is in raw wood.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <Award className="h-6 w-6 text-[#5C7650] mb-3" />
              <h3 className="font-semibold text-lg mb-1">15+ years</h3>
              <p className="text-sm text-muted-foreground">
                Founded in 2009. Hundreds of NYC kitchens, vanities, and built-ins shipped across
                the five boroughs.
              </p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <MapPin className="h-6 w-6 text-[#5C7650] mb-3" />
              <h3 className="font-semibold text-lg mb-1">All five boroughs</h3>
              <p className="text-sm text-muted-foreground">
                Brooklyn, Manhattan, Queens, the Bronx, and Staten Island — brownstones, lofts,
                co-ops, and new construction.
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-8">The team</h2>

          <article id="golan-achdary" className="mb-12 scroll-mt-32">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-1">Golan Achdary</h3>
            <p className="text-[#5C7650] font-semibold mb-3">Founder & Master Cabinetmaker</p>
            <p className="text-base text-[#444] leading-relaxed mb-3">
              Golan founded Green Cabinets NY in 2009 after years on NYC job sites. He runs design,
              millwork, and finish QC personally — every door, drawer, and panel gets eyes on
              before it ships. Specialty: shaker and slim-shaker construction, FSC-certified
              hardwoods, and hand-tuned door reveals.
            </p>
            <p className="text-sm text-muted-foreground">
              Knows: custom kitchens, bathroom vanities, walk-in closets, architectural millwork,
              low-VOC finishes, NYC co-op approval workflows.
            </p>
          </article>

          <article id="andy-lopez" className="mb-12 scroll-mt-32">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-1">Andy Lopez</h3>
            <p className="text-[#5C7650] font-semibold mb-3">Project Manager & Installation Lead</p>
            <p className="text-base text-[#444] leading-relaxed mb-3">
              Andy schedules installs, coordinates GCs and trades, and runs walkthroughs. If your
              kitchen lands clean and on schedule in a 4th-floor Bushwick walk-up, that's Andy.
            </p>
            <p className="text-sm text-muted-foreground">
              Knows: install in occupied apartments, brownstone logistics, board approvals,
              alteration agreements.
            </p>
          </article>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
              <Link to="/#contact">Get in touch <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hover:scale-105 transition-all">
              <Link to="/gallery">See completed projects</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default About;
