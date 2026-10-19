/**
 * Post-build SEO/GEO step (runs after scripts/prerender.mjs, before
 * scripts/inline-critical-css.mjs). Works only from the pre-rendered pages in
 * dist/, so it never adds a fact that isn't already on the site.
 *
 *  1. BreadcrumbList JSON-LD for every indexable page that has none, built
 *     from the URL path and the page's own <h1> (Home › Section › Page).
 *  2. dist/llms-full.txt: the plain-text body of the core, service-area,
 *     guide, wood-species and case-study pages, for AI assistants that read
 *     llms.txt's companion file.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "dist");
const ORIGIN = "https://greencabinetsny.com";

const decode = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"').replace(/&#x27;|&#39;|&rsquo;|&lsquo;/g, "'").replace(/&mdash;/g, "—")
   .replace(/&ndash;/g, "–").replace(/&ldquo;|&rdquo;/g, '"').replace(/&hellip;/g, "…")
   .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const SECTIONS = {
  blog: ["Blog", "/blog"],
  "wood-species": ["Wood Species", "/wood-species"],
  "case-studies": ["Case Studies", "/case-studies"],
  guides: ["Guides", "/guides"],
};

function fileFor(path) {
  return path === "/" ? resolve(DIST, "index.html") : resolve(DIST, `.${path}/index.html`);
}

function sitemapPaths() {
  const idx = readFileSync(resolve(ROOT, "public/sitemap.xml"), "utf8");
  const files = [...idx.matchAll(/<loc>https:\/\/greencabinetsny\.com\/(sitemaps\/[^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = [];
  for (const f of files) {
    const p = resolve(ROOT, "public", f);
    if (!existsSync(p)) continue;
    for (const m of readFileSync(p, "utf8").matchAll(/<loc>https:\/\/greencabinetsny\.com([^<]*)<\/loc>/g)) {
      paths.push({ path: m[1] || "/", sitemap: f });
    }
  }
  return paths;
}

const h1Of = (html) => {
  const m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? text(m[1]) : "";
};

// ── 0. <meta charset> first ───────────────────────────────────────────
// The early module-recovery script is prepended to <head> (vite.config.ts),
// which pushed the charset declaration below other content. Browsers want it
// in the first 1024 bytes (Lighthouse "charset" audit).
{
  let moved = 0;
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = resolve(dir, name);
      if (["assets", "img", "fonts", "sitemaps"].includes(name)) continue;
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".html")) {
        const html = readFileSync(p, "utf8");
        const m = html.match(/[ \t]*<meta charset="UTF-8"\s*\/?>\n?/i);
        if (!m || html.indexOf(m[0]) < 200) continue;
        writeFileSync(p, html.replace(m[0], "").replace(/<head>/i, '<head>\n    <meta charset="UTF-8" />'));
        moved++;
      }
    }
  };
  walk(DIST);
  console.log(`[postbuild-seo] moved <meta charset> to the top of ${moved} pages`);
}

// ── 1. Breadcrumbs ───────────────────────────────────────────────────────
let added = 0;
const pages = sitemapPaths();
for (const { path } of pages) {
  if (path === "/" || /^\/blog\/page\//.test(path)) continue;
  const file = fileFor(path);
  if (!existsSync(file)) continue;
  let html = readFileSync(file, "utf8");
  if (html.includes('"BreadcrumbList"') || /name="robots" content="noindex/.test(html)) continue;
  const name = h1Of(html);
  if (!name) continue;
  const segs = path.split("/").filter(Boolean);
  const crumbs = [["Home", "/"]];
  if (segs.length > 1 && SECTIONS[segs[0]]) crumbs.push(SECTIONS[segs[0]]);
  crumbs.push([name, path]);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(([n, p], i) => ({
      "@type": "ListItem", position: i + 1, name: n, item: `${ORIGIN}${p === "/" ? "/" : p}`,
    })),
  };
  const tag = `<script type="application/ld+json" data-breadcrumbs="auto">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
  html = html.replace("</head>", () => `    ${tag}\n  </head>`);
  writeFileSync(file, html);
  added++;
}
console.log(`[postbuild-seo] added BreadcrumbList to ${added} pages`);

// ── 2. llms-full.txt ─────────────────────────────────────────────────────
const FULL_SITEMAPS = /sitemap-(core|locations|guides|wood-species|case-studies)\.xml$/;
const skip = new Set(["/designer", "/estimator", "/privacy", "/terms", "/scan"]);
const parts = [];
for (const { path, sitemap } of pages) {
  if (!FULL_SITEMAPS.test(sitemap) || skip.has(path)) continue;
  const file = fileFor(path);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  if (/name="robots" content="noindex/.test(html)) continue;
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) continue;
  const body = main
    .replace(/<(script|style|svg|noscript|form|button)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, l, t) => `\n\n${"#".repeat(+l + 1)} ${text(t)}\n\n`)
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${text(t)}`)
    .replace(/<(p|div|section|tr|dt|dd)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const clean = decode(body).split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim()).filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
  const title = text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || path);
  parts.push(`---\n\n# ${title}\nURL: ${ORIGIN}${path === "/" ? "/" : path}\n\n${clean}\n`);
}
const head = readFileSync(resolve(ROOT, "public/llms.txt"), "utf8").split("\n## ")[0].trim();
writeFileSync(
  resolve(DIST, "llms-full.txt"),
  `${head}\n\nThis file is the full text of the main pages of ${ORIGIN}, generated from the published pages at build time. See ${ORIGIN}/llms.txt for the short index.\n\n${parts.join("\n")}`,
);
console.log(`[postbuild-seo] wrote llms-full.txt (${parts.length} pages)`);
