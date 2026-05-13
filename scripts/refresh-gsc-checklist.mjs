#!/usr/bin/env node
// Regenerates the pillar list, submission log table, and "Last updated" stamp
// in docs/seo/gsc-submission-checklist.md so it stays in sync with the codebase.
//
// Single source of truth: PILLAR_SLUGS below (mirrors scripts/generate-sitemap.ts).
// Usage: npm run refresh:gsc-checklist
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = "https://greencabinetsny.com";
const FILE = resolve("docs/seo/gsc-submission-checklist.md");

const PILLARS = [
  { slug: "best-wood-for-kitchen-cabinets",   intent: '"best wood" pillar' },
  { slug: "cabinet-wood-types-and-costs",     intent: '"wood types and costs" pillar' },
  { slug: "natural-wood-kitchen-cabinets",    intent: "natural wood pillar" },
  { slug: "double-sink-vanity-guide",         intent: "double-sink vanity" },
  { slug: "floating-bathroom-vanity",         intent: "floating vanity" },
  { slug: "small-bathroom-vanity-ideas",      intent: "small-bath vanity" },
  { slug: "reach-in-closet-systems-nyc",      intent: "reach-in closet" },
];

const now = new Date();
const date = now.toISOString().slice(0, 10);
const timestamp = now.toISOString().replace("T", " ").slice(0, 16) + " UTC";

const padCol = (rows) => {
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)));
  return rows.map((r) => "| " + r.map((c, i) => c.padEnd(widths[i])).join(" | ") + " |");
};

const intentRows = [
  ["#", "URL", "Intent"],
  ["---", "---", "---"],
  ...PILLARS.map((p, i) => [String(i + 1), `\`${BASE}/${p.slug}\``, p.intent]),
];

const logRows = [
  ["URL", "Date submitted", "Verdict before", "Verdict after", "Indexed?"],
  ["---", "---", "---", "---", "---"],
  ...PILLARS.map((p) => [`/${p.slug}`, "", "", "", ""]),
];

const intentTable = padCol(intentRows).join("\n");
const logTable = padCol(logRows).join("\n");

let md = readFileSync(FILE, "utf8");

const replaceBlock = (src, startMarker, endMarker, replacement) => {
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker, start + startMarker.length);
  if (start === -1 || end === -1) throw new Error(`Markers not found: ${startMarker} … ${endMarker}`);
  return src.slice(0, start) + startMarker + "\n" + replacement + "\n" + src.slice(end);
};

// Stamp "Last updated"
md = md.replace(/\*\*Last updated:\*\* .+/, `**Last updated:** ${date} (${timestamp})`);

// Replace intent table (between "The 7 new pages:" and the next blank-line + "**For each URL:**")
md = md.replace(
  /(The \d+ new pages:\n\n)([\s\S]*?)(\n\n\*\*For each URL:\*\*)/,
  `The ${PILLARS.length} new pages:\n\n${intentTable}$3`,
);

// Replace submission log table
md = md.replace(
  /(### Submission log\n\n)([\s\S]*?)(\n\n---)/,
  `$1${logTable}$3`,
);

writeFileSync(FILE, md);
console.log(`✓ Refreshed ${FILE}`);
console.log(`  ${PILLARS.length} pillar URLs · stamped ${timestamp}`);
