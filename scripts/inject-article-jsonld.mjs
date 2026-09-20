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
    slug: "custom-kitchen-cabinets-greenpoint-brooklyn",
    title: "Custom Kitchen Cabinets for Greenpoint Brooklyn",
    description:
      "Custom kitchen cabinets for Greenpoint Brooklyn — loft conversions, townhouses, and newer condos. By appointment. (718) 804-5488.",
    datePublished: "2026-09-20",
    keywords:
      "greenpoint, brooklyn kitchen cabinets, greenpoint loft kitchen, greenpoint townhouse kitchen, greenpoint condo kitchen, custom millwork, by appointment",
  },
  {
    slug: "custom-kitchen-cabinets-fort-greene-brooklyn",
    title: "Custom Kitchen Cabinets for Fort Greene Brooklyn",
    description:
      "Custom kitchen cabinets for Fort Greene Brooklyn — brownstones, co-ops, and newer condos near the park. By appointment. (718) 804-5488.",
    datePublished: "2026-09-19",
    keywords:
      "fort greene, brooklyn kitchen cabinets, fort greene brownstone kitchen, fort greene condo kitchen, fort greene park, custom millwork, by appointment",
  },
  {
    slug: "custom-kitchen-cabinets-williamsburg-brooklyn",
    title: "Custom Kitchen Cabinets for Williamsburg Brooklyn",
    description:
      "Custom kitchen cabinets for Williamsburg Brooklyn — lofts, condos, townhouses. Northside, Southside, East Williamsburg. By appointment. (718) 804-5488.",
    datePublished: "2026-09-19",
    keywords:
      "williamsburg, brooklyn kitchen cabinets, williamsburg loft kitchen, condo kitchen, townhouse kitchen, east williamsburg, custom millwork, by appointment",
  },
  {
    slug: "painted-vs-wood-veneer-cabinets-nyc-humidity",
    title: "Painted vs Wood Veneer Cabinets in NYC Humidity",
    description: "Painted vs wood veneer cabinets in NYC humidity — steam heat, AC cycles, coastal moisture. Honest millwork tradeoffs by appointment. (718) 804-5488.",
    datePublished: "2026-09-18",
    keywords: "painted vs wood veneer cabinets nyc, painted mdf vs veneer kitchen cabinets nyc, laminate vs painted cabinets apartment humidity, nyc kitchen cabinet humidity, tafisa egger shinnoki wilsonart agt cabinets",
  },
  {
    slug: "custom-closet-systems-long-island-city",
    title: "Custom Closet Systems for Long Island City Apartments",
    description: "Custom closet systems for Long Island City condos and rentals — measured walk-ins and reach-ins, COI-ready install. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-18",
    keywords: "custom closet systems long island city, closet millwork lic, custom closets long island city queens, walk-in closet long island city, reach-in closet condo coi",
  },
  {
    slug: "condo-board-kitchen-renovation-rules-nyc",
    title: "Condo Board Kitchen Renovation Rules in NYC",
    description: "How NYC condo board kitchen renovation rules work — house rules, alteration agreements, COI, work hours. Green Cabinets NY by appointment. (718) 804-5488.",
    datePublished: "2026-09-17",
    keywords: "condo board kitchen renovation rules nyc, nyc condo kitchen remodel board approval, condo alteration agreement kitchen cabinets nyc, condo house rules kitchen remodel, custom kitchen cabinets manhattan condo",
  },
  {
    slug: "reception-desk-commercial-millwork-brooklyn-retail",
    title: "Reception Desk and Light Commercial Millwork for Brooklyn Retail",
    description: "Custom reception desks and light commercial millwork for Brooklyn retail — measured for real storefronts, landlord COIs, after-hours install. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-17",
    keywords: "reception desk millwork brooklyn, custom retail reception desk brooklyn, light commercial millwork brooklyn retail, cash wrap millwork brooklyn, commercial casework brooklyn, after hours install nyc",
  },
  {
    slug: "library-bookcase-wall-millwork-manhattan",
    title: "Library and Bookcase Wall Millwork for Manhattan Apartments",
    description: "Floor-to-ceiling bookcase walls for Manhattan co-ops and condos — measured to the inch, board-ready. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-16",
    keywords: "library wall manhattan, bookcase wall nyc, floor to ceiling bookcases apartment, custom built in bookcases nyc, book nook millwork, built in desk bookcase wall",
  },
  {
    slug: "window-seat-banquette-millwork-brooklyn",
    title: "Window Seat and Banquette Millwork in Brooklyn",
    description: "Built-in window seats and banquettes for Brooklyn brownstones and apartments — storage, cushions, NYC install. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-15",
    keywords: "window seat brooklyn, banquette brooklyn, built in window seat nyc, banquette seating brownstone, custom bench millwork brooklyn, storage bench nyc, built in seating nyc",
  },
  {
    slug: "custom-vanity-small-nyc-bathrooms",
    title: "Custom Vanity for Small NYC Bathrooms",
    description: "Tiny NYC bath? Custom vanity to the inch — drawers, trap cuts, live price in the designer. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-15",
    keywords: "small bathroom vanity nyc, custom vanity small bathroom, tiny bathroom vanity brooklyn, powder room vanity manhattan, custom bathroom vanity queens",
  },
  {
    slug: "occupied-unit-kitchen-install-logistics-nyc",
    title: "Occupied-Unit Kitchen Install Logistics in NYC",
    description: "Kitchen cabinet install while you still live there — dust, hours, freight, staging for NYC co-ops and apartments. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-14",
    keywords: "occupied apartment kitchen remodel nyc, live-in kitchen cabinet install brooklyn, kitchen renovation while living in apartment, dust control kitchen cabinets queens, occupied unit millwork install nyc",
  },
  {
    slug: "certificate-of-insurance-kitchen-remodel-nyc",
    title: "Certificate of Insurance (COI) for NYC Kitchen Remodels",
    description: "Need a COI for a NYC kitchen remodel? What co-ops and condos ask, what millwork covers. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-14",
    keywords: "certificate of insurance kitchen remodel, COI kitchen renovation nyc, co-op renovation insurance, condo alteration agreement insurance, nyc kitchen remodel COI",
  },
  {
    slug: "soft-close-blum-vs-hettich-nyc",
    title: "Soft-Close Hardware Blum vs Hettich for NYC Millwork",
    description: "Blum vs Hettich soft-close for NYC kitchens and built-ins — co-ops, brownstones, by appointment. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-13",
    keywords: "blum vs hettich, soft close hinges nyc, soft close drawer slides, blum blumotion, hettich quadro, cabinet hardware nyc, custom millwork hardware",
  },
  {
    slug: "dovetail-drawer-boxes-nyc-kitchens",
    title: "Dovetail Drawer Boxes for NYC Kitchen Cabinets",
    description: "Dovetail drawer boxes for NYC kitchens — why joinery matters in co-ops and brownstones. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-13",
    keywords: "dovetail drawer boxes, dovetail drawers nyc, drawer joinery, kitchen cabinet drawers, custom drawer boxes brooklyn, co-op kitchen cabinets",
  },
  {
    slug: "custom-kitchen-cabinets-astoria-queens",
    title: "Custom Kitchen Cabinets for Astoria Queens Rowhouses and Co-ops",
    description:
      "Custom kitchen cabinets for Astoria Queens — Ditmars, Steinway, Broadway walk-ups and co-ops, by appointment. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-12",
    keywords:
      "custom kitchen cabinets astoria, astoria queens kitchen cabinets, kitchen cabinets ditmars, steinway street kitchen renovation, astoria co-op kitchen, queens custom millwork",
  },
  {
    slug: "custom-kitchen-cabinets-park-slope-brownstones",
    title: "Custom Kitchen Cabinets for Park Slope Brownstones",
    description:
      "Custom kitchen cabinets for Park Slope brownstones — parlor and garden floors, out-of-square walls, by appointment. Green Cabinets NY. (718) 804-5488.",
    datePublished: "2026-09-12",
    keywords:
      "custom kitchen cabinets park slope, park slope brownstone kitchen, brownstone kitchen renovation brooklyn, custom cabinets park slope, kitchen millwork brooklyn brownstone",
  },
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
