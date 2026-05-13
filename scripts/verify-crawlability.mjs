#!/usr/bin/env node
/**
 * Post-deploy crawlability check.
 * Fetches production robots.txt + sitemap.xml, asserts:
 *  - both return 200
 *  - robots.txt has Allow:/, Sitemap:, and disallows admin/auth/checkout
 *  - every public guide URL is reachable AND not blocked by robots
 *
 * Usage: node scripts/verify-crawlability.mjs
 * Exits non-zero on any failure (CI-friendly).
 */
const HOST = "https://greencabinetsny.com";

const REQUIRED_ROBOTS = [
  /^User-agent:\s*\*/m,
  /^Allow:\s*\/$/m,
  /^Disallow:\s*\/admin/m,
  /^Disallow:\s*\/auth/m,
  /^Disallow:\s*\/checkout/m,
  /^Sitemap:\s*https:\/\/greencabinetsny\.com\/sitemap\.xml/m,
];

const MUST_BE_INDEXED = [
  "/",
  "/about",
  "/shop",
  "/gallery",
  "/wood-species",
  "/finishes-colors",
  "/case-studies",
  "/best-wood-for-kitchen-cabinets",
  "/cabinet-wood-types-and-costs",
  "/natural-wood-kitchen-cabinets",
  "/double-sink-vanity-guide",
  "/floating-bathroom-vanity",
  "/small-bathroom-vanity-ideas",
  "/reach-in-closet-systems-nyc",
  "/kitchen-renovation-brooklyn",
];

const c = { red: (s) => `\x1b[31m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m` };
const fails = [];

async function head(url) {
  const r = await fetch(url, { method: "HEAD", redirect: "follow" });
  return { status: r.status, robots: r.headers.get("x-robots-tag") || "" };
}

console.log(c.dim(`→ Verifying ${HOST}\n`));

// 1. robots.txt
const rRes = await fetch(`${HOST}/robots.txt`);
const rBody = await rRes.text();
if (rRes.status !== 200) fails.push(`robots.txt status ${rRes.status}`);
for (const re of REQUIRED_ROBOTS) {
  if (!re.test(rBody)) fails.push(`robots.txt missing directive: ${re}`);
}
console.log(rRes.status === 200 ? c.green("✓ robots.txt 200") : c.red(`✗ robots.txt ${rRes.status}`));

// 2. sitemap.xml
const sRes = await fetch(`${HOST}/sitemap.xml`);
const sBody = await sRes.text();
if (sRes.status !== 200) fails.push(`sitemap.xml status ${sRes.status}`);
const sitemapLocs = new Set([...sBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
console.log(sRes.status === 200 ? c.green(`✓ sitemap.xml 200 (${sitemapLocs.size} urls)`) : c.red(`✗ sitemap.xml ${sRes.status}`));

// 3. Each guide URL: must be in sitemap, return 200, no noindex
console.log("");
for (const path of MUST_BE_INDEXED) {
  const url = `${HOST}${path}`;
  const inSitemap = sitemapLocs.has(url) || sitemapLocs.has(url.replace(/\/$/, ""));
  const { status, robots } = await head(url);
  const noindex = /noindex/i.test(robots);
  const ok = status === 200 && inSitemap && !noindex;
  if (!ok) {
    fails.push(`${path} → status=${status} sitemap=${inSitemap} noindex=${noindex}`);
    console.log(c.red(`✗ ${path}`) + c.dim(`  status=${status} sitemap=${inSitemap} noindex=${noindex}`));
  } else {
    console.log(c.green(`✓ ${path}`));
  }
}

console.log("");
if (fails.length) {
  console.log(c.red(`FAIL — ${fails.length} issue(s):`));
  fails.forEach((f) => console.log(c.red(`  • ${f}`)));
  process.exit(1);
}
console.log(c.green(`PASS — robots, sitemap, and ${MUST_BE_INDEXED.length} guide URLs all crawlable.`));
