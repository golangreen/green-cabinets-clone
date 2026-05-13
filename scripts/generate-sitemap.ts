// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Auto-discovers entries from src/data so the sitemap stays in sync with the codebase.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { NEIGHBORHOODS } from "../src/data/neighborhoodSeo";
import { BOROUGHS } from "../src/data/boroughSeo";
import { WOOD_SPECIES } from "../src/data/woodSpecies";
import { CASE_STUDIES } from "../src/data/caseStudies";

const BASE_URL = "https://greencabinetsny.com";
const today = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
  { path: "/shop", changefreq: "weekly", priority: "0.9", lastmod: today },
  { path: "/gallery", changefreq: "weekly", priority: "0.8", lastmod: today },
  { path: "/finishes-colors", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/wood-species", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/kitchen-renovation-brooklyn", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/about", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/case-studies", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/best-wood-for-kitchen-cabinets", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/cabinet-wood-types-and-costs", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/double-sink-vanity-guide", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/floating-bathroom-vanity", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/small-bathroom-vanity-ideas", changefreq: "monthly", priority: "0.85", lastmod: today },
  { path: "/reach-in-closet-systems-nyc", changefreq: "monthly", priority: "0.85", lastmod: today },

  // Hash-anchored homepage sections (kept for legacy parity)
  { path: "/#about", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/#services", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/#gallery", changefreq: "weekly", priority: "0.8", lastmod: today },
  { path: "/#contact", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/#suppliers", changefreq: "monthly", priority: "0.6", lastmod: today },
];

// Borough pages
for (const b of Object.values(BOROUGHS)) {
  entries.push({
    path: `/custom-kitchen-cabinets-${b.slug}`,
    changefreq: "monthly",
    priority: "0.9",
    lastmod: today,
  });
}

// Neighborhood pages
for (const n of Object.values(NEIGHBORHOODS)) {
  entries.push({
    path: `/custom-kitchen-cabinets-${n.slug}`,
    changefreq: "monthly",
    priority: "0.85",
    lastmod: today,
  });
}

// Wood species detail pages
for (const w of WOOD_SPECIES) {
  entries.push({
    path: `/wood-species/${w.slug}`,
    changefreq: "monthly",
    priority: "0.7",
    lastmod: today,
  });
}

// Case study detail pages
for (const c of CASE_STUDIES) {
  entries.push({
    path: `/case-studies/${c.slug}`,
    changefreq: "yearly",
    priority: "0.75",
    lastmod: c.datePublished,
  });
}

function generateSitemap(entries: SitemapEntry[]) {
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

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
