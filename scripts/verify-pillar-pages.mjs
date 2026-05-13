#!/usr/bin/env node
/**
 * Verifies each pillar URL:
 *  1. responds with HTTP 200
 *  2. has a <link rel="canonical"> matching its own URL
 *  3. all same-origin <a href> links resolve to 2xx (HEAD, with GET fallback)
 *
 * Usage:
 *   node scripts/verify-pillar-pages.mjs
 *   BASE=https://greencabinetsny.com node scripts/verify-pillar-pages.mjs
 *   node scripts/verify-pillar-pages.mjs --quick   # skip internal-link checks
 */
const BASE = (process.env.BASE || "https://greencabinetsny.com").replace(/\/$/, "");
const QUICK = process.argv.includes("--quick");
const CONCURRENCY = 8;

const PILLARS = [
  "/best-wood-for-kitchen-cabinets",
  "/cabinet-wood-types-and-costs",
  "/natural-wood-kitchen-cabinets",
  "/double-sink-vanity-guide",
  "/floating-bathroom-vanity",
  "/small-bathroom-vanity-ideas",
  "/reach-in-closet-systems-nyc",
];

const UA = "GreenCabinetsPillarVerifier/1.0 (+https://greencabinetsny.com)";
const norm = (u) => u.replace(/#.*$/, "").replace(/\/$/, "") || "/";

async function head(url) {
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": UA } });
    if (r.status === 405 || r.status === 403) {
      r = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": UA } });
      await r.body?.cancel?.();
    }
    return { status: r.status, finalUrl: r.url };
  } catch (e) {
    return { status: 0, error: String(e) };
  }
}

async function pool(items, worker, size = CONCURRENCY) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await worker(items[idx], idx);
      }
    }),
  );
  return out;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (!m) return null;
  const href = m[0].match(/href=["']([^"']+)["']/i);
  return href ? href[1] : null;
}

function extractInternalLinks(html, origin) {
  const seen = new Set();
  for (const m of html.matchAll(/<a\s+[^>]*href=["']([^"'#][^"']*)["'][^>]*>/gi)) {
    let href = m[1].trim();
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    let abs;
    try { abs = new URL(href, origin); } catch { continue; }
    if (abs.origin !== origin) continue;
    seen.add(abs.origin + norm(abs.pathname + abs.search));
  }
  return [...seen];
}

const C = { red: (s) => `\x1b[31m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, yellow: (s) => `\x1b[33m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m` };
const ok = (s) => C.green(`✓ ${s}`);
const bad = (s) => C.red(`✗ ${s}`);
const warn = (s) => C.yellow(`! ${s}`);

let totalErrors = 0;

for (const path of PILLARS) {
  const url = BASE + path;
  console.log(`\n${C.dim("───")} ${url}`);

  const r = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA } });
  const html = await r.text();

  // 1. Status
  if (r.status === 200) console.log(ok(`HTTP 200`));
  else { console.log(bad(`HTTP ${r.status}`)); totalErrors++; continue; }

  // 2. Canonical
  const canonical = extractCanonical(html);
  const expect = norm(url);
  const got = canonical ? norm(canonical) : null;
  if (!canonical) { console.log(bad(`canonical: missing`)); totalErrors++; }
  else if (got === expect) console.log(ok(`canonical: ${canonical}`));
  else { console.log(bad(`canonical mismatch — expected ${expect} got ${got}`)); totalErrors++; }

  if (QUICK) continue;

  // 3. Internal links
  const origin = new URL(url).origin;
  const links = extractInternalLinks(html, origin).filter((u) => u !== norm(url) && u !== origin + norm(url));
  if (!links.length) { console.log(warn(`no internal links found`)); continue; }

  const results = await pool(links, async (link) => ({ link, ...(await head(link)) }));
  const broken = results.filter((x) => x.status < 200 || x.status >= 400);
  const redirects = results.filter((x) => x.finalUrl && norm(x.finalUrl) !== norm(x.link));

  console.log(ok(`internal links: ${results.length - broken.length}/${results.length} reachable`));
  if (redirects.length) {
    for (const x of redirects) console.log(C.dim(`  → ${x.link} → ${x.finalUrl}`));
  }
  if (broken.length) {
    totalErrors += broken.length;
    for (const x of broken) console.log(bad(`  ${x.status || "ERR"} ${x.link}${x.error ? " " + x.error : ""}`));
  }
}

console.log("");
if (totalErrors > 0) {
  console.log(C.red(`FAILED — ${totalErrors} issue(s)`));
  process.exit(1);
}
console.log(C.green(`ALL CHECKS PASSED (${PILLARS.length} pillar pages)`));
