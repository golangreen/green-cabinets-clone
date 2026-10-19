#!/usr/bin/env node
// Radix components call useLayoutEffect; React warns about it on every
// server render. Harmless here (the browser hydrates), so keep the log quiet.
const origError = console.error;
console.error = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("useLayoutEffect does nothing on the server")) return;
  origError(...args);
};
/**
 * Build-time pre-render (runs after `vite build` and the SSR bundle build).
 *
 * For every public URL it writes dist/<route>/index.html containing:
 *   - that route's own <title>, meta description, canonical, Open Graph,
 *     Twitter tags and JSON-LD (from the page's Helmet tags), and
 *   - the page's full server-rendered HTML inside #root, so crawlers and AI
 *     bots that don't run JavaScript can read it.
 *
 * Route list: every <loc> in the generated sitemaps (which come from the data
 * files: blogIndex, boroughSeo, neighborhoodSeo, woodSpecies, caseStudies and
 * the Supabase blog table), cross-checked against entry-server's dataRoutes(),
 * plus app routes that are not in the sitemap. Nothing is hand-typed per post.
 *
 * Also writes dist/404.html, which Cloudflare serves with a real 404 status
 * for unknown URLs (wrangler.jsonc: not_found_handling = "404-page").
 *
 * A route that fails to render falls back to the plain app shell with its
 * own canonical, so one broken page can never fail the deploy. Set
 * PRERENDER_STRICT=1 to make any failure exit non-zero instead.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const SSR_ENTRY = resolve(ROOT, "dist-ssr/entry-server.js");
const ORIGIN = "https://greencabinetsny.com";
const STRICT = process.env.PRERENDER_STRICT === "1";

// Supabase anon key is public (it ships in the browser bundle); same values
// scripts/generate-sitemap.ts uses.
const SUPABASE_URL = "https://cqkvrqkelzdctlloobos.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa3ZycWtlbHpkY3RsbG9vYm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjc2NDUsImV4cCI6MjEwNjk0MzY0NX0.rM63zdRewZbq1Ix4XuJzEZBCUrvx6Tc_4GH8Dxud1pA";

/** App routes that exist but are not in the sitemap. `noindex` ones are private. */
const EXTRA_ROUTES = [
  { path: "/estimator" },
  { path: "/room-designer" },
  { path: "/estimator/quotes", noindex: true },
  { path: "/auth", noindex: true },
  { path: "/performance", noindex: true },
  { path: "/admin/gallery", noindex: true },
  { path: "/admin/serp-preview", noindex: true },
  { path: "/admin/gsc-indexing", noindex: true },
  { path: "/admin/seo", noindex: true },
  { path: "/admin/compatibility", noindex: true },
  { path: "/admin/estimator-failures", noindex: true },
];

const log = (...a) => console.log("[prerender]", ...a);

if (!existsSync(resolve(DIST, "index.html")) || !existsSync(SSR_ENTRY)) {
  const msg = "dist/index.html or dist-ssr/entry-server.js missing — run vite build and the SSR build first.";
  if (STRICT) { console.error("[prerender]", msg); process.exit(1); }
  console.warn("[prerender]", msg, "Skipping.");
  process.exit(0);
}

const SHELL = readFileSync(resolve(DIST, "index.html"), "utf8");

// ---------------------------------------------------------------- routes
function sitemapPaths() {
  const dir = resolve(DIST, "sitemaps");
  const out = [];
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".xml")) continue;
    const xml = readFileSync(resolve(dir, f), "utf8");
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = new URL(m[1]);
      if (u.origin === ORIGIN) out.push(u.pathname.replace(/\/+$/, "") || "/");
    }
  }
  return out;
}

async function fetchDbArticles() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/blog_articles?select=*`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn("[prerender] could not fetch blog_articles from Supabase:", e.message);
    return [];
  }
}

// ---------------------------------------------------------------- html helpers
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decode = (s) =>
  String(s)
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Key for a head tag so route tags replace the shell's generic ones. */
function tagKey(tag) {
  if (/^<title/i.test(tag)) return "title";
  const name = tag.match(/\sname="([^"]+)"/i)?.[1];
  if (/^<meta/i.test(tag) && name) return `name:${name.toLowerCase()}`;
  const prop = tag.match(/\sproperty="([^"]+)"/i)?.[1];
  if (/^<meta/i.test(tag) && prop) return `property:${prop.toLowerCase()}`;
  const rel = tag.match(/\srel="([^"]+)"/i)?.[1];
  if (/^<link/i.test(tag) && rel === "canonical") return "canonical";
  return null;
}

function splitTags(str) {
  return (str.match(/<(title|meta|link|script)\b[^>]*?(\/>|>[\s\S]*?<\/\1>|>)/gi) || []).map((t) => t.trim());
}

function attr(tag, name) {
  const v = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];
  return v === undefined ? undefined : decode(v);
}

function buildPage({ path, html, helmet, noindex, status404 }) {
  const url = `${ORIGIN}${path === "/" ? "/" : path}`;
  const routeTags = helmet
    ? [helmet.title, helmet.meta, helmet.link, helmet.script].map((h) => h?.toString() || "").flatMap(splitTags)
    : [];

  // Helmet emits an empty <title> when a route sets none; treat it as unset.
  const tags = routeTags.filter((t) => !/^<title[^>]*>\s*<\/title>$/i.test(t));
  const byKey = new Map();
  for (const t of tags) {
    const k = tagKey(t);
    if (k) byKey.set(k, t);
  }

  let title = byKey.has("title") ? decode(byKey.get("title").replace(/<[^>]+>/g, "")) : "";
  if (!title) title = attr(SHELL.match(/<meta name="title"[^>]*>/)?.[0] || "", "content") || "Green Cabinets NY";
  const desc =
    attr(byKey.get("name:description") || "", "content") ||
    attr(SHELL.match(/<meta name="description"[^>]*>/)?.[0] || "", "content") ||
    "";
  const canonical = attr(byKey.get("canonical") || "", "href") || url;

  // Fill in whatever the route didn't set, marked so the browser app's
  // Helmet / CanonicalManager take them over after load.
  const extra = [];
  const ensure = (key, tag) => { if (!byKey.has(key)) { byKey.set(key, tag); extra.push(tag); } };
  ensure("title", `<title data-rh="true">${esc(title)}</title>`);
  ensure("name:description", `<meta data-rh="true" name="description" content="${esc(desc)}" />`);
  if (!status404) ensure("canonical", `<link rel="canonical" href="${esc(canonical)}" data-canonical-auto="true" />`);
  ensure("property:og:title", `<meta data-rh="true" property="og:title" content="${esc(title)}" />`);
  ensure("property:og:description", `<meta data-rh="true" property="og:description" content="${esc(desc)}" />`);
  if (!status404) ensure("property:og:url", `<meta property="og:url" content="${esc(canonical)}" data-canonical-auto="true" />`);
  ensure("name:twitter:title", `<meta data-rh="true" name="twitter:title" content="${esc(title)}" />`);
  ensure("name:twitter:description", `<meta data-rh="true" name="twitter:description" content="${esc(desc)}" />`);
  ensure("name:twitter:url", `<meta data-rh="true" name="twitter:url" content="${esc(canonical)}" />`);
  if (noindex || status404) ensure("name:robots", `<meta data-rh="true" name="robots" content="noindex, nofollow" />`);

  const routeKeys = new Set(byKey.keys());
  // Drop the shell's generic versions of every tag the route now owns.
  let head = SHELL.replace(/<(title|meta|link)\b[^>]*?(\/>|>[^<]*<\/title>|>)/gi, (tag) => {
    const k = tagKey(tag);
    if (k === "name:title") return "";
    return k && routeKeys.has(k) ? "" : tag;
  });

  const inject = [...tags, ...extra].join("\n    ");
  // function replacements: "$" in page content must not be read as a pattern
  head = head.replace("</head>", () => `    ${inject}\n  </head>`);
  return head.replace('<div id="root"></div>', () => `<div id="root" data-prerendered>${html}</div>`);
}

function outFile(path) {
  if (path === "/") return resolve(DIST, "index.html");
  return resolve(DIST, `.${path}`, "index.html");
}

// ---------------------------------------------------------------- main
// supabase-js creates its realtime client on import and, on Node < 22,
// throws if there is no global WebSocket. The pre-render never opens a
// socket, so a stub is enough (CI runs Node 20).
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class PrerenderNoWebSocket {
    constructor() {
      throw new Error("WebSocket is not available during pre-render");
    }
  };
}

const ssr = await import(pathToFileURL(SSR_ENTRY).href);
const dbArticles = await fetchDbArticles();
ssr.setPrerenderedArticles(dbArticles);
const staticPaths = new Set(ssr.dataRoutes());
const dbBySlug = new Map(dbArticles.map((a) => [a.slug, a]));

/** Database articles ship their data with the page so the browser hydrates
 *  the same content instead of re-rendering after its own fetch. */
function articleDataScript(path) {
  const m = path.match(/^\/blog\/([^/]+)$/);
  if (!m || staticPaths.has(path) || !dbBySlug.has(m[1])) return "";
  const json = JSON.stringify(dbBySlug.get(m[1])).replace(/</g, "\\u003c");
  return `<script id="prerendered-article" type="application/json">${json}</script>`;
}

const routes = new Map();
for (const p of sitemapPaths()) routes.set(p, { path: p });
for (const p of ssr.dataRoutes()) {
  if (!routes.has(p)) {
    console.warn(`[prerender] ${p} is in the data files but not the sitemap — pre-rendering anyway`);
    routes.set(p, { path: p });
  }
}
for (const r of EXTRA_ROUTES) if (!routes.has(r.path)) routes.set(r.path, r);
// "/" is written last because it overwrites the shell template file.
const ordered = [...routes.values()].sort((a, b) => (a.path === "/") - (b.path === "/"));

// Old per-route files from a previous build must not linger.
for (const r of ordered) if (r.path !== "/") rmSync(outFile(r.path), { force: true });

let ok = 0;
const failures = [];
const thin = [];
for (const r of ordered) {
  let page;
  try {
    const { html, helmet } = await ssr.render(r.path);
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length < 400 && !r.noindex) thin.push(`${r.path} (${text.length} chars)`);
    page = buildPage({ path: r.path, html, helmet, noindex: r.noindex });
    const data = articleDataScript(r.path);
    if (data) page = page.replace("</body>", () => `${data}\n</body>`);
    ok++;
  } catch (e) {
    failures.push(`${r.path}: ${String(e?.message || e).split("\n")[0]}`);
    page = buildPage({ path: r.path, html: "", helmet: undefined, noindex: r.noindex });
  }
  const file = outFile(r.path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
}

// 404 page: the NotFound route, noindex, no canonical.
try {
  const { html, helmet } = await ssr.render("/__not-found__");
  writeFileSync(resolve(DIST, "404.html"), buildPage({ path: "/404", html, helmet, status404: true }));
} catch (e) {
  failures.push(`404.html: ${e.message}`);
  writeFileSync(resolve(DIST, "404.html"), buildPage({ path: "/404", html: "", helmet: undefined, status404: true }));
}

log(`wrote ${ordered.length} routes (${ok} fully rendered, ${failures.length} shell fallback) + 404.html; ${dbArticles.length} database articles loaded`);
if (thin.length) log(`thin pages (<400 chars of text): ${thin.join(", ")}`);
if (failures.length) {
  console.warn("[prerender] render failures:\n  " + failures.join("\n  "));
  if (STRICT) process.exit(1);
}
process.exit(0);
