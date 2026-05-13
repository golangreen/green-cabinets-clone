#!/usr/bin/env node
/**
 * Post-deploy crawlability check.
 * Parses production robots.txt into per-User-agent groups and asserts:
 *  - the `*` group has every expected Disallow + Allow rule
 *  - sitemap.xml returns 200 and contains every guide URL
 *  - every guide URL returns 200 with no `noindex` X-Robots-Tag
 *
 * Exits non-zero on any failure (CI-friendly).
 */
const HOST = "https://greencabinetsny.com";

// --- expectations for the `*` user-agent group ---------------------------
const EXPECTED_DISALLOW = [
  "/admin/",
  "/admin",
  "/auth",
  "/checkout",
  "/payment-success",
  "/performance",
];

const EXPECTED_ALLOW = [
  "/",
  "/assets/",
  "/icons/",
  "/images/",
  "/*.css$",
  "/*.js$",
  "/*.mjs$",
  "/*.woff2$",
  "/*.woff$",
  "/*.svg$",
  "/*.png$",
  "/*.jpg$",
  "/*.jpeg$",
  "/*.webp$",
  "/*.avif$",
  "/*.ico$",
  "/*.json$",
  "/*.xml$",
];

const EXPECTED_SITEMAP = `${HOST}/sitemap.xml`;

const CORE_PAGES = [
  "/",
  "/about",
  "/shop",
  "/gallery",
  "/wood-species",
  "/finishes-colors",
  "/case-studies",
];

// Canonical guide URLs migrated from jeton.com. Sitemap must contain
// EXACTLY these guide entries — no missing, no extras.
const EXPECTED_GUIDES = [
  "/best-wood-for-kitchen-cabinets",
  "/cabinet-wood-types-and-costs",
  "/natural-wood-kitchen-cabinets",
  "/double-sink-vanity-guide",
  "/floating-bathroom-vanity",
  "/small-bathroom-vanity-ideas",
  "/reach-in-closet-systems-nyc",
  "/kitchen-renovation-brooklyn",
];

const MUST_BE_INDEXED = [...CORE_PAGES, ...EXPECTED_GUIDES];

import { parseRobots, makeGuideLike } from "./lib/robots-parser.mjs";

const GUIDE_LIKE = makeGuideLike({
  corePages: CORE_PAGES,
  excludePrefixes: ["/custom-kitchen-cabinets-"],
});

// --- runner --------------------------------------------------------------
const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};
const fails = [];
const log = (ok, msg) => console.log(`${ok ? c.green("✓") : c.red("✗")} ${msg}`);

console.log(c.dim(`→ Verifying ${HOST}\n`));

// 1. robots.txt — full parse + per-rule assertions
const rRes = await fetch(`${HOST}/robots.txt`);
const rBody = await rRes.text();
if (rRes.status !== 200) {
  fails.push(`robots.txt status ${rRes.status}`);
  log(false, `robots.txt status ${rRes.status}`);
} else {
  log(true, "robots.txt 200");
  const { groups, sitemaps } = parseRobots(rBody);
  const star = groups.get("*");
  if (!star) {
    fails.push("robots.txt missing User-agent: * group");
    log(false, "User-agent: * group present");
  } else {
    log(true, `User-agent: * group parsed (${star.allow.size} allow, ${star.disallow.size} disallow)`);
    for (const rule of EXPECTED_DISALLOW) {
      const ok = star.disallow.has(rule);
      log(ok, `  Disallow: ${rule}`);
      if (!ok) fails.push(`* group missing Disallow: ${rule}`);
    }
    for (const rule of EXPECTED_ALLOW) {
      const ok = star.allow.has(rule);
      log(ok, `  Allow: ${rule}`);
      if (!ok) fails.push(`* group missing Allow: ${rule}`);
    }
  }
  const hasSitemap = sitemaps.includes(EXPECTED_SITEMAP);
  log(hasSitemap, `Sitemap: ${EXPECTED_SITEMAP}`);
  if (!hasSitemap) fails.push(`robots.txt missing Sitemap: ${EXPECTED_SITEMAP} (got ${JSON.stringify(sitemaps)})`);
}

// 2. sitemap.xml
console.log("");
const sRes = await fetch(`${HOST}/sitemap.xml`);
const sBody = await sRes.text();
if (sRes.status !== 200) fails.push(`sitemap.xml status ${sRes.status}`);
const sitemapLocs = new Set([...sBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
log(sRes.status === 200, `sitemap.xml 200 (${sitemapLocs.size} urls)`);

const sitemapPaths = new Set(
  [...sitemapLocs].map((u) => {
    try { return new URL(u).pathname.replace(/\/+$/, "") || "/"; }
    catch { return u; }
  }),
);

// 2b. Exact guide-set match — no missing, no extras.
console.log("");
const expectedSet = new Set(EXPECTED_GUIDES);
const sitemapGuides = new Set([...sitemapPaths].filter(GUIDE_LIKE));
const missingGuides = [...expectedSet].filter((p) => !sitemapGuides.has(p));
const extraGuides = [...sitemapGuides].filter((p) => !expectedSet.has(p));
log(missingGuides.length === 0, `sitemap contains all ${EXPECTED_GUIDES.length} expected guide URLs`);
for (const p of missingGuides) {
  fails.push(`sitemap missing guide: ${p}`);
  log(false, `  missing: ${p}`);
}
log(extraGuides.length === 0, `sitemap has no unexpected guide URLs`);
for (const p of extraGuides) {
  fails.push(`sitemap has unexpected guide: ${p}`);
  log(false, `  extra:   ${p}`);
}

// 3. Each guide URL: must be in sitemap, return 200, advertise the correct
//    canonical, and not declare meta-robots `noindex` (header or HTML).
console.log("");
const CANONICAL_RE = /<link[^>]+rel=["']canonical["'][^>]*>/i;
const HREF_RE = /href=["']([^"']+)["']/i;
const META_ROBOTS_RE = /<meta[^>]+name=["']robots["'][^>]*>/i;
const CONTENT_RE = /content=["']([^"']+)["']/i;

for (const path of MUST_BE_INDEXED) {
  const url = `${HOST}${path}`;
  const expectedCanonical = `${HOST}${path}`;
  const inSitemap = sitemapLocs.has(url) || sitemapLocs.has(url.replace(/\/$/, "")) || sitemapPaths.has(path);
  const r = await fetch(url, { redirect: "follow" });
  const html = await r.text();
  const headerNoindex = /noindex/i.test(r.headers.get("x-robots-tag") || "");

  const canonTag = html.match(CANONICAL_RE)?.[0] ?? "";
  const canonHref = canonTag.match(HREF_RE)?.[1] ?? "";
  const canonNorm = canonHref.replace(/\/$/, "") || "/";
  const expectNorm = expectedCanonical.replace(/\/$/, "") || "/";
  const canonicalOk = canonNorm === expectNorm;

  const metaTag = html.match(META_ROBOTS_RE)?.[0] ?? "";
  const metaContent = metaTag.match(CONTENT_RE)?.[1] ?? "";
  const metaNoindex = /noindex/i.test(metaContent);

  const ok =
    r.status === 200 && inSitemap && !headerNoindex && !metaNoindex && canonicalOk;
  if (!ok) {
    fails.push(
      `${path} → status=${r.status} sitemap=${inSitemap} headerNoindex=${headerNoindex} metaNoindex=${metaNoindex} canonical=${canonHref || "<none>"} (expected ${expectedCanonical})`,
    );
  }
  log(
    ok,
    `${path}${ok ? c.dim(`  canonical=${canonHref}`) : c.dim(`  status=${r.status} sitemap=${inSitemap} headerNoindex=${headerNoindex} metaNoindex=${metaNoindex} canonical=${canonHref || "<none>"}`)}`,
  );
}

console.log("");
if (fails.length) {
  console.log(c.red(`FAIL — ${fails.length} issue(s):`));
  fails.forEach((f) => console.log(c.red(`  • ${f}`)));
  process.exit(1);
}
console.log(c.green(`PASS — robots groups, sitemap, and ${MUST_BE_INDEXED.length} guide URLs all verified.`));
