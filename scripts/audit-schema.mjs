#!/usr/bin/env node
/**
 * Schema audit: scans built HTML in dist/ for the 9 SEO-critical pages
 * (homepage + 8 guides) and reports whether each contains Article, FAQPage,
 * and Product JSON-LD blocks. Exits non-zero if any expected schema is
 * missing, or if Product schema appears on a page that should not have it.
 *
 * Usage:  npm run audit:schema
 * CI:     runs after `npm run build`.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist");

/**
 * @type {Array<{path:string, file:string, expect:{article:boolean, faq:boolean, product:boolean}}>}
 * `expect.product:false` is a hard-fail if found (orange GSC warning regression).
 */
const PAGES = [
  { path: "/",                                 file: "index.html",                                 expect: { article: false, faq: false, product: false } },
  { path: "/best-wood-for-kitchen-cabinets",   file: "best-wood-for-kitchen-cabinets/index.html",  expect: { article: true,  faq: true,  product: false } },
  { path: "/cabinet-wood-types-and-costs",     file: "cabinet-wood-types-and-costs/index.html",    expect: { article: true,  faq: true,  product: false } },
  { path: "/natural-wood-kitchen-cabinets",    file: "natural-wood-kitchen-cabinets/index.html",   expect: { article: true,  faq: true,  product: false } },
  { path: "/double-sink-vanity-guide",         file: "double-sink-vanity-guide/index.html",        expect: { article: true,  faq: false, product: false } },
  { path: "/floating-bathroom-vanity",         file: "floating-bathroom-vanity/index.html",        expect: { article: true,  faq: false, product: false } },
  { path: "/small-bathroom-vanity-ideas",      file: "small-bathroom-vanity-ideas/index.html",     expect: { article: true,  faq: false, product: false } },
  { path: "/reach-in-closet-systems-nyc",      file: "reach-in-closet-systems-nyc/index.html",     expect: { article: true,  faq: false, product: false } },
  { path: "/kitchen-renovation-brooklyn",      file: "kitchen-renovation-brooklyn/index.html",     expect: { article: true,  faq: false, product: false } },
];

/** Count occurrences of `"@type": "X"` (tolerates whitespace + quotes). */
function countType(html, type) {
  const re = new RegExp(`"@type"\\s*:\\s*"${type}"`, "g");
  return (html.match(re) || []).length;
}

const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
const WARN = "\x1b[33m!\x1b[0m";

let errors = 0;
let warnings = 0;
const rows = [];

for (const page of PAGES) {
  const abs = resolve(DIST, page.file);
  if (!existsSync(abs)) {
    console.error(`${FAIL} ${page.path} — missing built file: ${page.file}`);
    errors++;
    rows.push({ path: page.path, article: "—", faq: "—", product: "—", note: "MISSING FILE" });
    continue;
  }
  const html = readFileSync(abs, "utf8");
  const article = countType(html, "Article") + countType(html, "BlogPosting") + countType(html, "NewsArticle") + countType(html, "TechArticle");
  const faq = countType(html, "FAQPage");
  const product = countType(html, "Product");

  const issues = [];
  if (page.expect.article && article === 0) { issues.push("Article missing"); errors++; }
  if (page.expect.faq && faq === 0)         { issues.push("FAQPage missing"); errors++; }
  if (!page.expect.product && product > 0)  { issues.push(`Product found (${product})`); errors++; }
  if (page.expect.article && article > 0 && !page.expect.faq && faq > 0) { warnings++; }

  rows.push({
    path: page.path,
    article: article > 0 ? `${PASS} ${article}` : page.expect.article ? `${FAIL} 0` : "0",
    faq:     faq > 0     ? `${PASS} ${faq}`     : page.expect.faq     ? `${FAIL} 0` : "0",
    product: product > 0 ? `${FAIL} ${product}` : `${PASS} 0`,
    note: issues.join("; "),
  });
}

console.log("\nSchema audit — built HTML in dist/\n");
const pad = (s, n) => String(s).padEnd(n);
console.log(pad("Route", 38), pad("Article", 12), pad("FAQ", 12), pad("Product", 12), "Notes");
console.log("-".repeat(110));
for (const r of rows) {
  console.log(pad(r.path, 38), pad(r.article, 12), pad(r.faq, 12), pad(r.product, 12), r.note);
}

console.log(`\n${errors === 0 ? PASS : FAIL} ${errors} error(s), ${warnings} warning(s) across ${PAGES.length} pages.\n`);
process.exit(errors === 0 ? 0 : 1);
