// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes a sitemap index at public/sitemap.xml plus per-section sitemaps in
// public/sitemaps/. Splitting by section keeps each file well under the
// 50k URL / 50MB limit and lets crawlers ingest sections independently.
import { writeFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import { resolve } from "path";
import { NEIGHBORHOODS } from "../src/data/neighborhoodSeo";
import { BOROUGHS } from "../src/data/boroughSeo";
import { WOOD_SPECIES } from "../src/data/woodSpecies";
import { CASE_STUDIES } from "../src/data/caseStudies";

const BASE_URL = "https://greencabinetsny.com";

// Sitemap protocol caps a urlset at 50k URLs / 50MB and an index at 50k
// children. Split well below that so files stay small and cacheable.
const MAX_URLS_PER_SITEMAP = Number(process.env.SITEMAP_MAX_URLS ?? 5000);
const MAX_SITEMAPS_PER_INDEX = 50_000;

function chunk<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
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
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "weekly", priority: "0.9" },
  { path: "/designer", changefreq: "monthly", priority: "0.7" },
  { path: "/gallery", changefreq: "weekly", priority: "0.8" },
  { path: "/finishes-colors", changefreq: "monthly", priority: "0.8" },
  { path: "/wood-species", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/case-studies", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/landing", changefreq: "monthly", priority: "0.7" },
];

const guides: SitemapEntry[] = [
  { path: "/kitchen-renovation-brooklyn", changefreq: "monthly", priority: "0.9" },
  { path: "/kitchen-renovation-manhattan", changefreq: "monthly", priority: "0.9" },
  { path: "/kitchen-cabinets-staten-island", changefreq: "monthly", priority: "0.9" },
  // /custom-kitchen-cabinets-queens lives in the locations sitemap (borough page) —
  // listing it here too produced a duplicate <loc> across child sitemaps.

  { path: "/best-wood-for-kitchen-cabinets", changefreq: "monthly", priority: "0.85" },
  { path: "/cabinet-wood-types-and-costs", changefreq: "monthly", priority: "0.85" },
  { path: "/natural-wood-kitchen-cabinets", changefreq: "monthly", priority: "0.85" },
  { path: "/double-sink-vanity-guide", changefreq: "monthly", priority: "0.85" },
  { path: "/floating-bathroom-vanity", changefreq: "monthly", priority: "0.85" },
  { path: "/small-bathroom-vanity-ideas", changefreq: "monthly", priority: "0.85" },
  { path: "/reach-in-closet-systems-nyc", changefreq: "monthly", priority: "0.85" },
  { path: "/custom-vs-semi-custom-cabinets", changefreq: "monthly", priority: "0.85" },
  { path: "/shaker-vs-slim-shaker-cabinets", changefreq: "monthly", priority: "0.85" },
  { path: "/white-oak-vs-walnut-cabinets", changefreq: "monthly", priority: "0.85" },
  { path: "/luxury-kitchen-design-nyc", changefreq: "monthly", priority: "0.9" },
];

const locations: SitemapEntry[] = [
  ...Object.values(BOROUGHS).map((b) => ({
    path: `/custom-kitchen-cabinets-${b.slug}`,
    changefreq: "monthly" as const,
    priority: "0.9",

  })),
  ...Object.values(NEIGHBORHOODS).map((n) => ({
    path: `/custom-kitchen-cabinets-${n.slug}`,
    changefreq: "monthly" as const,
    priority: "0.85",

  })),
];

const woodSpecies: SitemapEntry[] = WOOD_SPECIES.map((w) => ({
  path: `/wood-species/${w.slug}`,
  changefreq: "monthly",
  priority: "0.7",

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

function renderIndex(sitemaps: { loc: string; lastmod?: string }[]) {
  const items = sitemaps.map((s) =>
    [
      `  <sitemap>`,
      `    <loc>${s.loc}</loc>`,
      s.lastmod ? `    <lastmod>${s.lastmod}</lastmod>` : null,
      `  </sitemap>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...items,
    `</sitemapindex>`,
  ].join("\n");
}

// Latest authoritative entry lastmod for the index; omitted when no entry
// carries a page-specific timestamp (never fall back to the build date).
function maxLastmod(entries: SitemapEntry[]): string | undefined {
  const dates = entries.map((e) => e.lastmod).filter((x): x is string => Boolean(x));
  return dates.length ? dates.sort().slice(-1)[0] : undefined;
}

async function main() {
  const shopifyProducts = await fetchShopifyProductHandles();
  const products: SitemapEntry[] = shopifyProducts.map((p) => ({
    path: `/product/${p.handle}`,
    changefreq: "weekly",
    priority: "0.8",
    lastmod: p.updatedAt.slice(0, 10),
  }));

  const blogArticles = await fetchBlogArticles();
  const blog: SitemapEntry[] = blogArticles.map((b) => ({
    path: `/blog/${b.slug}`,
    changefreq: "weekly",
    priority: "0.7",
    lastmod: b.updated_at ? b.updated_at.slice(0, 10) : undefined,
  }));

  const sections: { name: string; entries: SitemapEntry[] }[] = [
    { name: "core", entries: core },
    { name: "guides", entries: guides },
    { name: "locations", entries: locations },
    { name: "wood-species", entries: woodSpecies },
    { name: "case-studies", entries: caseStudies },
    { name: "products", entries: products },
    { name: "blog", entries: blog },
  ];

  // Global dedupe across sections — a duplicate <loc> anywhere in the index
  // fails crawlability verification. First section wins.
  const seen = new Set<string>();
  const deduped = sections
    .map((s) => ({
      name: s.name,
      entries: s.entries.filter((e) => {
        const path = e.path.replace(/\/+$/, "") || "/";
        if (seen.has(path)) {
          console.warn(`  ! duplicate path dropped from "${s.name}": ${path}`);
          return false;
        }
        seen.add(path);
        return true;
      }),
    }))
    .filter((s) => s.entries.length > 0);

  mkdirSync(resolve("public/sitemaps"), { recursive: true });

  // Remove stale part files so shrinking a section never leaves orphaned
  // sitemaps behind (they'd 404 or serve dead URLs from a cached index).
  for (const f of readdirSync(resolve("public/sitemaps"))) {
    if (/^sitemap-.*\.xml$/.test(f)) rmSync(resolve("public/sitemaps", f));
  }

  const indexEntries: { loc: string; lastmod?: string }[] = [];
  let total = 0;
  for (const s of deduped) {
    const parts = chunk(s.entries, MAX_URLS_PER_SITEMAP);
    parts.forEach((entries, i) => {
      // Single-part sections keep their stable filename; split sections get
      // -1, -2, … suffixes so the index stays parseable as they grow.
      const name = parts.length === 1 ? s.name : `${s.name}-${i + 1}`;
      const path = `public/sitemaps/sitemap-${name}.xml`;
      writeFileSync(resolve(path), renderUrlset(entries));
      indexEntries.push({
        loc: `${BASE_URL}/sitemaps/sitemap-${name}.xml`,
        lastmod: maxLastmod(entries),
      });
      total += entries.length;
      console.log(`  ${path} (${entries.length} urls)`);
    });
  }

  if (indexEntries.length > MAX_SITEMAPS_PER_INDEX) {
    throw new Error(
      `sitemap index has ${indexEntries.length} children (limit ${MAX_SITEMAPS_PER_INDEX}); nested indexes required.`,
    );
  }

  writeFileSync(resolve("public/sitemap.xml"), renderIndex(indexEntries));
  console.log(`sitemap.xml index written (${indexEntries.length} sitemaps, ${total} urls)`);
}

main();
