// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes a sitemap index at public/sitemap.xml plus per-section sitemaps in
// public/sitemaps/. Splitting by section keeps each file well under the
// 50k URL / 50MB limit and lets crawlers ingest sections independently.
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { NEIGHBORHOODS } from "../src/data/neighborhoodSeo";
import { BOROUGHS } from "../src/data/boroughSeo";
import { WOOD_SPECIES } from "../src/data/woodSpecies";
import { CASE_STUDIES } from "../src/data/caseStudies";

const BASE_URL = "https://greencabinetsny.com";
const today = new Date().toISOString().slice(0, 10);

const SHOPIFY_STORE = "green-cabinets-clone-5eeb3.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_TOKEN = "585dda31c3bbc355eb6f937d3307f76b";

const SUPABASE_URL = "https://mczagaaiyzbhjvtrojia.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jemFnYWFpeXpiaGp2dHJvamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODcxOTMsImV4cCI6MjA3NzE2MzE5M30.j7Cg7ULJklrohMgYZ1BqYurgR01eUHYHFWHwI9_zae0";

async function fetchBlogArticles(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_articles?select=slug,updated_at&order=updated_at.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  }
}

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

async function fetchShopifyProductHandles(): Promise<{ handle: string; updatedAt: string }[]> {
  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query GetProductHandles($first: Int!) {
              products(first: $first) {
                edges { node { handle updatedAt } }
              }
            }
          `,
          variables: { first: 250 },
        }),
      }
    );
    if (!response.ok) {
      console.warn(`Shopify API returned ${response.status}; skipping product sitemap entries.`);
      return [];
    }
    const data = await response.json();
    const edges = data?.data?.products?.edges || [];
    return edges.map((e: { node: { handle: string; updatedAt: string } }) => ({
      handle: e.node.handle,
      updatedAt: e.node.updatedAt,
    }));
  } catch (err) {
    console.warn("Failed to fetch Shopify products for sitemap:", err);
    return [];
  }
}

const core: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
  { path: "/shop", changefreq: "weekly", priority: "0.9", lastmod: today },
  { path: "/designer", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/gallery", changefreq: "weekly", priority: "0.8", lastmod: today },
  { path: "/finishes-colors", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/wood-species", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/about", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/case-studies", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/blog", changefreq: "weekly", priority: "0.8", lastmod: today },
  { path: "/landing", changefreq: "monthly", priority: "0.7", lastmod: today },
];

const guides: SitemapEntry[] = [
  { path: "/kitchen-renovation-brooklyn", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/best-wood-for-kitchen-cabinets", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/cabinet-wood-types-and-costs", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/natural-wood-kitchen-cabinets", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/double-sink-vanity-guide", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/floating-bathroom-vanity", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/small-bathroom-vanity-ideas", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/reach-in-closet-systems-nyc", changefreq: "monthly", priority: "0.85", lastmod: today },
];

const locations: SitemapEntry[] = [
  ...Object.values(BOROUGHS).map((b) => ({
    path: `/custom-kitchen-cabinets-${b.slug}`,
    changefreq: "monthly" as const,
    priority: "0.9",
    lastmod: today,
  })),
  ...Object.values(NEIGHBORHOODS).map((n) => ({
    path: `/custom-kitchen-cabinets-${n.slug}`,
    changefreq: "monthly" as const,
    priority: "0.85",
    lastmod: today,
  })),
];

const woodSpecies: SitemapEntry[] = WOOD_SPECIES.map((w) => ({
  path: `/wood-species/${w.slug}`,
  changefreq: "monthly",
  priority: "0.7",
  lastmod: today,
}));

const caseStudies: SitemapEntry[] = CASE_STUDIES.map((c) => ({
  path: `/case-studies/${c.slug}`,
  changefreq: "yearly",
  priority: "0.75",
  lastmod: c.datePublished,
}));

function renderUrlset(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

function renderIndex(sitemaps: { loc: string; lastmod: string }[]) {
  const items = sitemaps.map(
    (s) =>
      `  <sitemap>\n    <loc>${s.loc}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`,
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...items,
    `</sitemapindex>`,
  ].join("\n");
}

// Latest entry lastmod for the index — falls back to today.
function maxLastmod(entries: SitemapEntry[]): string {
  const dates = entries.map((e) => e.lastmod).filter((x): x is string => Boolean(x));
  return dates.length ? dates.sort().slice(-1)[0] : today;
}

async function main() {
  const shopifyProducts = await fetchShopifyProductHandles();
  const products: SitemapEntry[] = shopifyProducts.map((p) => ({
    path: `/product/${p.handle}`,
    changefreq: "weekly",
    priority: "0.8",
    lastmod: p.updatedAt.slice(0, 10),
  }));

  const sections: { name: string; entries: SitemapEntry[] }[] = [
    { name: "core", entries: core },
    { name: "guides", entries: guides },
    { name: "locations", entries: locations },
    { name: "wood-species", entries: woodSpecies },
    { name: "case-studies", entries: caseStudies },
    { name: "products", entries: products },
  ].filter((s) => s.entries.length > 0);

  mkdirSync(resolve("public/sitemaps"), { recursive: true });

  const indexEntries: { loc: string; lastmod: string }[] = [];
  let total = 0;
  for (const s of sections) {
    const path = `public/sitemaps/sitemap-${s.name}.xml`;
    writeFileSync(resolve(path), renderUrlset(s.entries));
    indexEntries.push({
      loc: `${BASE_URL}/sitemaps/sitemap-${s.name}.xml`,
      lastmod: maxLastmod(s.entries),
    });
    total += s.entries.length;
    console.log(`  ${path} (${s.entries.length} urls)`);
  }

  writeFileSync(resolve("public/sitemap.xml"), renderIndex(indexEntries));
  console.log(`sitemap.xml index written (${sections.length} sitemaps, ${total} urls)`);
}

main();
