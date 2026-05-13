/**
 * /small-bathroom-vanity-ideas — long-form pillar targeting
 * "small bathroom vanity" (~9,900/mo, KDI 28).
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb } from "lucide-react";
import AuthorByline from "@/components/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/small-bathroom-vanity-ideas";
const TITLE = "Small Bathroom Vanity Ideas — 18\" to 36\" That Actually Work";
const DESC =
  "Smart small bathroom vanity ideas from a NYC cabinet shop: 18\", 24\", 30\", and 36\" layouts that maximize storage in tight powder rooms, brownstones, and pre-war apartments.";

const IDEAS = [
  {
    width: '18"',
    title: "Powder room console with open shelf",
    storage: "Single shallow drawer + open towel shelf",
    why: "Below 24\" you cannot fit a P-trap inside a closed cabinet. Embrace it — wall-mount faucet, exposed brass trap, one drawer above for soap and a hand towel below.",
  },
  {
    width: '24"',
    title: "Floating single with U-cut drawer",
    storage: "1 deep U-cut drawer around the P-trap",
    why: "The smallest size where one real drawer becomes possible. Floating it adds 6\" of visual floor and lets the toilet bowl tuck closer.",
  },
  {
    width: '30"',
    title: "Two-drawer floating with hidden outlet",
    storage: "Top shallow drawer + bottom U-cut drawer with built-in outlet",
    why: "Our most-built small vanity. Top drawer for daily-use, bottom for backstock. GFCI outlet inside the top drawer makes the counter clean.",
  },
  {
    width: '36"',
    title: "Three-drawer or drawer + door combo",
    storage: "Three stacked drawers (offset basin) or 1 drawer + 1 deep door",
    why: "At 36\" you can offset the sink left and put a real drawer stack on the right — closest a small bath gets to feeling like a primary.",
  },
];

const TRICKS = [
  { title: "Wall-mount the faucet", body: "Frees the entire counter for actual use and lets the basin sit closer to the wall. Adds ~$300–$500 to the rough-in." },
  { title: "Use a vessel-style basin sparingly", body: "They look bigger than they are because the bowl sits above the counter, but they steal real estate and splash in 24\"-and-under setups." },
  { title: "Skip the toe kick", body: "Floating saves visual height and makes the floor cleanable. In a 5x7 bathroom, the floor showing is half the trick." },
  { title: "Mirror the full wall above the vanity", body: "Edge-to-edge mirror, no frame. Doubles the apparent room size for ~$200 in glass." },
  { title: "Tall over the toilet, not over the vanity", body: "Storage tower over the toilet adds 4–6 cu ft without crowding the user-facing zone." },
  { title: "Pick light wood, not white", body: "Rift white oak or natural maple keeps a tiny bath from feeling clinical the way pure white can." },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${URL}#article`,
  headline: TITLE,
  description: DESC,
  author: authorRef("golan"),
  publisher: { "@id": ORG_ID },
  datePublished: "2026-05-13",
  dateModified: new Date().toISOString().slice(0, 10),
  image: ["https://greencabinetsny.com/og-image.jpg"],
  mainEntityOfPage: { "@type": "WebPage", "@id": URL },
  keywords: "small bathroom vanity, small vanity ideas, 24 inch vanity, 30 inch vanity, powder room vanity, narrow bathroom vanity",
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Small bathroom vanity ideas by width",
  itemListElement: IDEAS.map((i, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: `${i.width} — ${i.title}`,
  })),
};

const SmallBathroomVanityIdeas = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={DESC} />
      <meta name="keywords" content="small bathroom vanity, small bathroom vanity ideas, narrow vanity, 24 inch vanity, 30 inch vanity, powder room vanity, small bathroom storage" />
      <link rel="canonical" href={URL} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={URL} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESC} />
      <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
      <meta property="article:author" content="Golan Achdary" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
    </Helmet>

    <BreadcrumbSchema
      items={[
        { name: "Home", url: "/" },
        { name: "Vanities", url: "/vanity-designer" },
        { name: "Small Bathroom Vanity Ideas", url: URL },
      ]}
    />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Vanities", to: "/vanity-designer" },
          { label: "Small Bathroom Vanity Ideas" },
        ]}
      />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Updated 2026 · 18"–36" layouts
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            Small Bathroom Vanity Ideas That Actually Work
          </h1>
          <p className="text-base sm:text-lg text-[#444] mb-6">
            We build vanities for Brooklyn brownstones, Manhattan studios, and Queens pre-wars
            every week. Here are the small-bathroom layouts that earn their square footage,
            broken down by exact width.
          </p>
          <div className="flex justify-center">
            <AuthorByline author="golan" label="Written by" />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">By width — what fits, what doesn't</h2>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            The single biggest mistake in a small bath is choosing a vanity by aesthetic before
            measuring drawer-clearance against the door swing and toilet. Start here.
          </p>

          <div className="space-y-5 mb-16">
            {IDEAS.map((i) => (
              <article key={i.width} className="border border-border rounded-lg p-6 hover:border-[#5C7650] transition-colors">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-mono font-bold text-[#5C7650] text-xl">{i.width}</span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">{i.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2"><strong className="text-foreground">Storage:</strong> {i.storage}</p>
                <p className="text-base text-muted-foreground leading-relaxed">{i.why}</p>
              </article>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-[#5C7650]" /> Six tricks that actually move the needle
          </h2>
          <div className="space-y-4 mb-16">
            {TRICKS.map((t) => (
              <div key={t.title} className="border-l-2 border-[#5C7650] pl-4 py-1">
                <h3 className="font-bold text-foreground mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Cost expectations</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>18" powder console:</strong> $1,400–$2,200</li>
            <li><strong>24" floating single:</strong> $2,400–$3,200</li>
            <li><strong>30" two-drawer floating:</strong> $2,800–$3,800</li>
            <li><strong>36" three-drawer floating:</strong> $3,400–$4,400</li>
          </ul>

          <div className="p-6 border border-border rounded-lg bg-muted/30 mb-8">
            <p className="text-sm text-muted-foreground mb-3">
              Configure a small vanity in your exact width and get a price right now.
            </p>
            <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
              <Link to="/vanity-designer">Open the vanity designer <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Related reading</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
            <li><Link to="/floating-bathroom-vanity" className="text-[#5C7650] hover:underline">Floating bathroom vanity install guide</Link></li>
            <li><Link to="/double-sink-vanity-guide" className="text-[#5C7650] hover:underline">Double sink vanity sizing</Link></li>
          </ul>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default SmallBathroomVanityIdeas;
