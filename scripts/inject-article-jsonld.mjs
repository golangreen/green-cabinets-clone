#!/usr/bin/env node
/**
 * Postbuild: emits per-route static HTML for each guide page with the
 * Article + (optional) FAQ JSON-LD baked into <head>. Ensures Google &
 * any limited-JS crawler sees the schema even before client hydration.
 *
 * Writes dist/<slug>/index.html for each guide. Static-host exact-file
 * match wins over SPA fallback, so /best-wood-for-kitchen-cabinets
 * serves the enriched HTML; React then hydrates normally.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist");
const SHELL = resolve(DIST, "index.html");

if (!existsSync(SHELL)) {
  console.warn(`[inject-article-jsonld] no dist/index.html found at ${SHELL} — skipping.`);
  process.exit(0);
}

const ORG_ID = "https://greencabinetsny.com/#organization";
const AUTHOR_GOLAN = "https://greencabinetsny.com/about#golan-achdary";
const DEFAULT_IMAGE = "https://greencabinetsny.com/og-image.jpg";
const TODAY = new Date().toISOString().slice(0, 10);

/** @type {Array<{slug:string,title:string,description:string,datePublished:string,keywords?:string}>} */
const GUIDES = [
  {
    slug: "best-wood-for-kitchen-cabinets",
    title: "Best Wood for Kitchen Cabinets in 2026 — Honest Picks by Use Case",
    description:
      "Pick the right cabinet wood for your NYC kitchen. Honest pros, cons, durability, and price for maple, oak, walnut, cherry, hickory & more.",
    datePublished: "2026-05-13",
    keywords:
      "best wood for kitchen cabinets, cabinet wood types, hardwood cabinets, maple vs oak cabinets, walnut kitchen cabinets",
  },
  {
    slug: "cabinet-wood-types-and-costs",
    title: "Cabinet Wood Types and Costs — Per-Linear-Foot Guide (2026)",
    description:
      "What every cabinet wood actually costs per linear foot in 2026 — maple, oak, walnut, cherry, hickory, ash, MDF & plywood. NYC pricing baseline.",
    datePublished: "2026-05-13",
    keywords:
      "cabinet wood types and costs, kitchen cabinet wood prices, cabinet wood cost per linear foot, hardwood cabinet pricing",
  },
  {
    slug: "natural-wood-kitchen-cabinets",
    title: "Natural Wood Kitchen Cabinets — Species, Finishes & 2026 Cost Guide",
    description:
      "A practical guide to natural wood kitchen cabinets: species comparison, grain & color, finish options, durability, and real NYC pricing.",
    datePublished: "2026-05-13",
    keywords:
      "natural wood kitchen cabinets, real wood cabinets, solid wood cabinets, wood species cabinets, custom wood cabinets nyc",
  },
  {
    slug: "double-sink-vanity-guide",
    title: "Double Sink Vanity — Sizes, Layouts & NYC Cost Guide (2026)",
    description:
      "Everything to plan a double sink vanity in NYC: minimum widths, layouts, plumbing rough-in, storage, and 2026 custom build pricing.",
    datePublished: "2026-05-13",
    keywords:
      "double sink vanity, double vanity, 60 inch double vanity, 72 inch double vanity, custom double vanity nyc",
  },
  {
    slug: "floating-bathroom-vanity",
    title: "Floating Bathroom Vanity — NYC Install Guide & Cost (2026)",
    description:
      "Floating (wall-mounted) bathroom vanities for NYC apartments: pros/cons, wall requirements, plumbing, lighting, and custom build pricing.",
    datePublished: "2026-05-13",
    keywords:
      "floating bathroom vanity, wall mounted vanity, floating vanity nyc, custom floating vanity, wall hung vanity",
  },
  {
    slug: "small-bathroom-vanity-ideas",
    title: 'Small Bathroom Vanity Ideas — 18" to 36" That Actually Work',
    description:
      "Small bathroom vanity ideas that actually fit NYC powder rooms — 18\" to 36\" widths, smart storage, and custom build options.",
    datePublished: "2026-05-13",
    keywords:
      "small bathroom vanity, small vanity ideas, 24 inch vanity, 30 inch vanity, powder room vanity, narrow bathroom vanity",
  },
  {
    slug: "reach-in-closet-systems-nyc",
    title: "Reach-In Closet Systems for NYC Apartments — Custom Build Guide",
    description:
      "Custom reach-in closet systems for NYC apartments. Layouts, hanging vs shelving zones, materials, and real install pricing for Brooklyn & Manhattan.",
    datePublished: "2026-05-13",
    keywords:
      "reach in closet, reach in closet systems, custom closet nyc, custom reach in closet, closet system brooklyn, closet organizer nyc",
  },
  {
    slug: "kitchen-renovation-brooklyn",
    title: "Kitchen Renovation Brooklyn | Costs, Permits & Timeline (2026)",
    description:
      "Brooklyn kitchen renovation guide: real 2026 costs by tier, NYC permit & co-op rules, realistic timelines, and how cabinetry drives the budget.",
    datePublished: "2026-01-15",
    keywords:
      "kitchen renovation brooklyn, brooklyn kitchen remodel, kitchen renovation cost nyc, brooklyn brownstone kitchen",
  },
];

/** @type {Array<{slug:string,title:string,description:string,datePublished:string,keywords?:string}>} */
const BLOG_POSTS = [
  {
    slug: "reach-in-closet-millwork-manhattan-coops",
    title: "Reach-In Closet Millwork for Manhattan Co-ops",
    description:
      "Custom reach-in closet millwork for Manhattan co-ops — measured to the inch, COI-ready, by appointment. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-11",
    keywords:
      "reach in closet millwork manhattan co-op, custom closet manhattan apartment, co-op closet renovation upper east side, manhattan hallway closet cabinets, custom reach in closet nyc",
  },
  {
    slug: "custom-bathroom-vanity-upper-west-side",
    title: "Custom Bathroom Vanity for Upper West Side Apartments",
    description:
      "Custom bathroom vanities for Upper West Side co-ops and condos — measured to the inch, by appointment. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-11",
    keywords:
      "custom bathroom vanity upper west side, upper west side bathroom vanity, co-op bathroom vanity nyc, condo bathroom vanity nyc, custom vanity upper west side",
  },
  {
    slug: "freight-elevator-kitchen-cabinet-delivery-nyc",
    title: "Freight Elevator Kitchen Cabinet Delivery in NYC",
    description:
      "How freight elevators, COI, and building logistics shape custom kitchen cabinet delivery in Brooklyn, Manhattan, and Queens — Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-10",
    keywords:
      "freight elevator kitchen cabinet delivery nyc, kitchen cabinet delivery manhattan co-op, cabinet delivery brooklyn, cabinet delivery queens, coi kitchen renovation nyc",
  },
  {
    slug: "home-office-built-ins-nyc",
    title: "Home Office Built-Ins for NYC Apartments",
    description:
      "Custom home office built-ins and desk millwork for Brooklyn, Manhattan, and Queens apartments — Green Cabinets NY by appointment. (718) 804-5488.",
    datePublished: "2026-09-10",
    keywords:
      "home office built-ins nyc, custom desk millwork, home office cabinets, built-in desk brooklyn, manhattan home office, queens apartment office",
  },
];

function buildArticleSchema({ slug, title, description, datePublished, keywords, isBlog = false }) {
  const url = isBlog ? `https://greencabinetsny.com/blog/${slug}` : `https://greencabinetsny.com/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description,
    author: {
      "@type": "Person",
      "@id": AUTHOR_GOLAN,
      name: "Golan Achdary",
      url: AUTHOR_GOLAN,
    },
    publisher: { "@id": ORG_ID },
    datePublished,
    dateModified: TODAY,
    image: [DEFAULT_IMAGE],
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(keywords ? { keywords } : {}),
  };
}

const shellHtml = readFileSync(SHELL, "utf8");
const HEAD_CLOSE = "</head>";

if (!shellHtml.includes(HEAD_CLOSE)) {
  console.error("[inject-article-jsonld] dist/index.html missing </head> — aborting.");
  process.exit(1);
}

function writeRouteHtml(slug, title, description, datePublished, keywords, isBlog = false) {
  const schema = buildArticleSchema({ slug, title, description, datePublished, keywords, isBlog });
  const url = isBlog ? `https://greencabinetsny.com/blog/${slug}` : `https://greencabinetsny.com/${slug}`;
  const tag =
    `\n    <link rel="canonical" href="${url}" />\n` +
    `    <title>${title.replace(/</g, "&lt;")}</title>\n` +
    `    <meta name="description" content="${description.replace(/"/g, "&quot;")}" />\n` +
    `    <script type="application/ld+json" data-static-article>` +
    JSON.stringify(schema) +
    `</script>\n  `;

  // Strip the existing default <title>/<meta description>/<link canonical> so
  // the per-route ones win on initial paint (Helmet still updates on hydrate).
  let html = shellHtml
    .replace(/<title>[^<]*<\/title>/i, "")
    .replace(/<meta\s+name="title"[^>]*>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/i, "")
    .replace(/<link\s+rel="canonical"[^>]*>/i, "");

  html = html.replace(HEAD_CLOSE, `${tag}${HEAD_CLOSE}`);

  const outDir = isBlog ? resolve(DIST, "blog", slug) : resolve(DIST, slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.html"), html);
}

let count = 0;
for (const guide of GUIDES) {
  writeRouteHtml(guide.slug, guide.title, guide.description, guide.datePublished, guide.keywords);
  count++;
}
for (const post of BLOG_POSTS) {
  writeRouteHtml(post.slug, post.title, post.description, post.datePublished, post.keywords, true);
  count++;
}

console.log(`[inject-article-jsonld] wrote ${count} per-route HTML files with Article JSON-LD.`);
