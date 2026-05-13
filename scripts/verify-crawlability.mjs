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

    const diffSet = (label, expected, actual) => {
      const exp = new Set(expected);
      const act = new Set(actual);
      const missing = [...exp].filter((r) => !act.has(r));
      const extra = [...act].filter((r) => !exp.has(r));
      const ok = missing.length === 0 && extra.length === 0;
      log(ok, `* group ${label} rules ${ok ? "match" : "DIFFER"} (expected ${exp.size}, got ${act.size})`);
      if (ok) return;

      // Pretty diff: -missing (red), +unexpected (yellow)
      const rows = [
        ...missing.map((r) => ({ sign: "-", rule: r, color: c.red })),
        ...extra.map((r) => ({ sign: "+", rule: r, color: c.yellow })),
      ].sort((a, b) => a.rule.localeCompare(b.rule));
      for (const { sign, rule, color } of rows) {
        console.log(`    ${color(`${sign} ${label}: ${rule}`)}`);
      }
      console.log(
        c.dim(`    legend: ${c.red("- missing (expected, not in robots.txt)")} ${c.dim("|")} ${c.yellow("+ unexpected (in robots.txt, not expected)")}`),
      );
      if (missing.length) fails.push(`* group missing ${missing.length} ${label} rule(s): ${missing.join(", ")}`);
      if (extra.length) fails.push(`* group has ${extra.length} unexpected ${label} rule(s): ${extra.join(", ")}`);
    };

    diffSet("Disallow", EXPECTED_DISALLOW, star.disallow);
    diffSet("Allow", EXPECTED_ALLOW, star.allow);
  }
  const hasSitemap = sitemaps.includes(EXPECTED_SITEMAP);
  log(hasSitemap, `Sitemap: ${EXPECTED_SITEMAP}`);
  if (!hasSitemap) fails.push(`robots.txt missing Sitemap: ${EXPECTED_SITEMAP} (got ${JSON.stringify(sitemaps)})`);
}

// 2. sitemap.xml — fetch + structural validation of every <loc>
console.log("");
const sRes = await fetch(`${HOST}/sitemap.xml`);
const sBody = await sRes.text();
if (sRes.status !== 200) fails.push(`sitemap.xml status ${sRes.status}`);
const rawLocs = [...sBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapLocs = new Set(rawLocs);
log(sRes.status === 200, `sitemap.xml 200 (${rawLocs.length} urls)`);

// 2a. Per-loc validation: absolute HTTPS, expected host, no query/fragment,
//     no `//` in path, no trailing slash (except root), no uppercase, lowercase host.
const EXPECTED_HOST = new URL(HOST).host;
const locIssues = [];
const seen = new Set();
for (const loc of rawLocs) {
  const issues = [];
  let parsed;
  try { parsed = new URL(loc); }
  catch { locIssues.push({ loc, issues: ["not a valid absolute URL"] }); continue; }

  if (parsed.protocol !== "https:") issues.push(`protocol=${parsed.protocol} (must be https:)`);
  if (parsed.host !== EXPECTED_HOST) issues.push(`host=${parsed.host} (expected ${EXPECTED_HOST})`);
  if (parsed.host !== parsed.host.toLowerCase()) issues.push("host has uppercase chars");
  if (parsed.search) issues.push(`has query string: ${parsed.search}`);
  if (parsed.hash) issues.push(`has fragment: ${parsed.hash}`);
  if (parsed.username || parsed.password) issues.push("has userinfo");
  if (parsed.port) issues.push(`has explicit port: ${parsed.port}`);

  const path = parsed.pathname;
  if (path !== path.toLowerCase()) issues.push(`path has uppercase chars: ${path}`);
  if (path.includes("//")) issues.push(`path has empty segment ("//"): ${path}`);
  if (!path.startsWith("/")) issues.push(`path not rooted: ${path}`);
  if (path.length > 1 && path.endsWith("/")) issues.push(`path has trailing slash: ${path}`);
  if (/\s/.test(path)) issues.push(`path has whitespace: ${path}`);
  // Reconstruct the canonical absolute URL and compare.
  const canonical = `${parsed.protocol}//${parsed.host}${path === "/" ? "/" : path}`;
  if (loc !== canonical) issues.push(`not normalized — got "${loc}", canonical "${canonical}"`);

  if (seen.has(loc)) issues.push("duplicate <loc>");
  seen.add(loc);

  if (issues.length) locIssues.push({ loc, issues });
}
const allLocsValid = locIssues.length === 0;
log(allLocsValid, `every <loc> is absolute HTTPS + normalized (${rawLocs.length} checked)`);
for (const { loc, issues } of locIssues) {
  log(false, `  ${loc}`);
  for (const i of issues) console.log(`      ${c.red("· " + i)}`);
  fails.push(`sitemap loc invalid: ${loc} → ${issues.join("; ")}`);
}

const sitemapPaths = new Set(
  [...sitemapLocs].map((u) => {
    try { return new URL(u).pathname.replace(/\/+$/, "") || "/"; }
    catch { return u; }
  }),
);

// 2b. Exact guide-set match — no missing, no extras, exact-form match.
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

// 2b.1 Hard count safeguard — total guide-like URLs must equal expected count.
//      Catches accidental new pages slipping into the indexable guide namespace
//      even if they happen to satisfy individual checks.
const expectedCount = EXPECTED_GUIDES.length;
const actualCount = sitemapGuides.size;
const countOk = actualCount === expectedCount;
log(
  countOk,
  `guide-like URL count = ${actualCount} (expected exactly ${expectedCount})`,
);
if (!countOk) {
  const delta = actualCount - expectedCount;
  const sign = delta > 0 ? "+" : "";
  fails.push(
    `sitemap guide count mismatch: expected ${expectedCount}, got ${actualCount} (${sign}${delta}). ` +
      `Update EXPECTED_GUIDES in scripts/verify-crawlability.mjs if this is intentional.`,
  );
  console.log(c.dim(`    all guide-like URLs in sitemap (${actualCount}):`));
  for (const p of [...sitemapGuides].sort()) {
    const marker = expectedSet.has(p) ? c.green("✓") : c.yellow("?");
    console.log(`      ${marker} ${p}`);
  }
}

// 2c. Each expected guide must appear with the EXACT canonical absolute form.
const exactGuideMismatches = [];
for (const p of EXPECTED_GUIDES) {
  const expected = `${HOST}${p}`;
  if (!sitemapLocs.has(expected)) {
    exactGuideMismatches.push({ expected, found: rawLocs.find((l) => {
      try { return new URL(l).pathname.replace(/\/+$/, "") === p; } catch { return false; }
    }) ?? null });
  }
}
log(exactGuideMismatches.length === 0, `every expected guide appears with exact canonical form`);
for (const { expected, found } of exactGuideMismatches) {
  fails.push(`sitemap guide form mismatch — expected "${expected}", found "${found ?? "<absent>"}"`);
  log(false, `  expected: ${expected}`);
  log(false, `  found:    ${found ?? "<absent>"}`);
}

// 3. Each guide URL: must be in sitemap, return 200, advertise the correct
//    canonical, and not declare meta-robots `noindex` (header or HTML).
console.log("");
const CANONICAL_RE = /<link[^>]+rel=["']canonical["'][^>]*>/i;
const HREF_RE = /href=["']([^"']+)["']/i;
const META_ROBOTS_RE = /<meta[^>]+name=["']robots["'][^>]*>/i;
const CONTENT_RE = /content=["']([^"']+)["']/i;

const normPath = (u) => {
  try {
    const x = new URL(u);
    const p = x.pathname.replace(/\/+$/, "") || "/";
    return `${x.origin}${p}`;
  } catch {
    return u.replace(/\/+$/, "");
  }
};

for (const path of MUST_BE_INDEXED) {
  const url = `${HOST}${path}`;
  const expectedCanonical = `${HOST}${path}`;
  const inSitemap = sitemapLocs.has(url) || sitemapLocs.has(url.replace(/\/$/, "")) || sitemapPaths.has(path);

  // First, manual mode catches a single-hop redirect cleanly (3xx Location).
  const headRes = await fetch(url, { redirect: "manual" });
  const isRedirect = headRes.status >= 300 && headRes.status < 400;
  const redirectTo = isRedirect ? headRes.headers.get("location") : null;
  const redirectedAway =
    isRedirect && !!redirectTo && normPath(new URL(redirectTo, url).href) !== normPath(url);

  // Then follow to inspect the final landed page (canonical, noindex, etc.).
  const r = await fetch(url, { redirect: "follow" });
  const html = await r.text();
  const finalUrl = r.url || url;
  const finalDifferent = normPath(finalUrl) !== normPath(url);
  const headerNoindex = /noindex/i.test(r.headers.get("x-robots-tag") || "");

  const canonTag = html.match(CANONICAL_RE)?.[0] ?? "";
  const canonHref = canonTag.match(HREF_RE)?.[1] ?? "";
  const canonNorm = canonHref.replace(/\/$/, "") || "/";
  const expectNorm = expectedCanonical.replace(/\/$/, "") || "/";
  const canonicalOk = canonNorm === expectNorm;

  const metaTag = html.match(META_ROBOTS_RE)?.[0] ?? "";
  const metaContent = metaTag.match(CONTENT_RE)?.[1] ?? "";
  const metaNoindex = /noindex/i.test(metaContent);

  const status200 = r.status === 200;
  const noRedirect = !redirectedAway && !finalDifferent;
  const ok =
    status200 && inSitemap && noRedirect && !headerNoindex && !metaNoindex && canonicalOk;

  if (!ok) {
    const reasons = [];
    if (!status200) reasons.push(`status=${r.status}`);
    if (!inSitemap) reasons.push(`not in sitemap`);
    if (redirectedAway) reasons.push(`redirected ${headRes.status} → ${redirectTo}`);
    else if (finalDifferent) reasons.push(`final URL ${finalUrl} ≠ requested`);
    if (headerNoindex) reasons.push(`X-Robots-Tag: noindex`);
    if (metaNoindex) reasons.push(`<meta robots> noindex`);
    if (!canonicalOk) reasons.push(`canonical=${canonHref || "<none>"} (expected ${expectedCanonical})`);
    fails.push(`${path} → ${reasons.join("; ")}`);
  }
  log(
    ok,
    `${path}${ok ? c.dim(`  200, no-redirect, canonical=${canonHref}`) : c.dim(`  status=${r.status}${redirectedAway ? ` redirect→${redirectTo}` : finalDifferent ? ` finalUrl=${finalUrl}` : ""} canonical=${canonHref || "<none>"}`)}`,
  );
}

console.log("");
if (fails.length) {
  console.log(c.red(`FAIL — ${fails.length} issue(s):`));
  fails.forEach((f) => console.log(c.red(`  • ${f}`)));
  process.exit(1);
}
console.log(c.green(`PASS — robots groups, sitemap, and ${MUST_BE_INDEXED.length} guide URLs all verified.`));
