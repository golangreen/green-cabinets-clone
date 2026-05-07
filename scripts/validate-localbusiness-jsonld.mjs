#!/usr/bin/env node
/**
 * Validates LocalBusiness JSON-LD in index.html.
 * Fails (exit 1) if any required field is missing or any
 * OpeningHoursSpecification entry is malformed.
 *
 * Usage: node scripts/validate-localbusiness-jsonld.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.resolve(__dirname, "..", "index.html");

const VALID_DAYS = new Set([
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
  "PublicHolidays",
]);

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function extractJsonLdBlocks(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

function isLocalBusiness(node) {
  const t = node?.["@type"];
  return t === "LocalBusiness" || (Array.isArray(t) && t.includes("LocalBusiness"));
}

function findLocalBusiness(blocks) {
  for (const raw of blocks) {
    let data;
    try { data = JSON.parse(raw); }
    catch (e) { err(`JSON-LD block failed to parse: ${e.message}`); continue; }
    const graph = data["@graph"] || [data];
    for (const node of graph) if (isLocalBusiness(node)) return node;
  }
  return null;
}

function validateAddress(addr) {
  if (!addr || typeof addr !== "object") { err("address is missing or not an object"); return; }
  if (addr["@type"] !== "PostalAddress") err(`address.@type must be "PostalAddress", got ${JSON.stringify(addr["@type"])}`);
  for (const f of ["streetAddress", "addressLocality", "addressRegion", "postalCode", "addressCountry"]) {
    if (!addr[f] || typeof addr[f] !== "string") err(`address.${f} missing or not a string`);
  }
}

function validateGeo(geo) {
  if (!geo) { warn("geo is missing (recommended)"); return; }
  if (geo["@type"] !== "GeoCoordinates") err(`geo.@type must be "GeoCoordinates"`);
  for (const f of ["latitude", "longitude"]) {
    if (typeof geo[f] !== "number") err(`geo.${f} must be a number`);
  }
}

function validateOhsEntry(o, idx) {
  const label = o.name || `#${idx}`;
  if (o["@type"] !== "OpeningHoursSpecification") {
    err(`OHS[${label}] @type must be "OpeningHoursSpecification"`);
  }

  // dayOfWeek (optional but if present must be valid)
  if (o.dayOfWeek !== undefined) {
    const days = Array.isArray(o.dayOfWeek) ? o.dayOfWeek : [o.dayOfWeek];
    for (const d of days) {
      if (!VALID_DAYS.has(d)) err(`OHS[${label}] invalid dayOfWeek: ${JSON.stringify(d)}`);
    }
  }

  // opens/closes must come together if present
  const hasOpens = o.opens !== undefined;
  const hasCloses = o.closes !== undefined;
  if (hasOpens !== hasCloses) err(`OHS[${label}] must have both "opens" and "closes" or neither`);
  if (hasOpens && !TIME_RE.test(o.opens)) err(`OHS[${label}] opens "${o.opens}" not HH:MM`);
  if (hasCloses && !TIME_RE.test(o.closes)) err(`OHS[${label}] closes "${o.closes}" not HH:MM`);

  // validFrom/validThrough must be valid ISO dates and ordered
  const hasFrom = o.validFrom !== undefined;
  const hasThru = o.validThrough !== undefined;
  if (hasFrom !== hasThru) err(`OHS[${label}] must have both "validFrom" and "validThrough" or neither`);
  if (hasFrom) {
    if (!DATE_RE.test(o.validFrom)) err(`OHS[${label}] validFrom "${o.validFrom}" not YYYY-MM-DD`);
    if (!DATE_RE.test(o.validThrough)) err(`OHS[${label}] validThrough "${o.validThrough}" not YYYY-MM-DD`);
    if (DATE_RE.test(o.validFrom) && DATE_RE.test(o.validThrough)) {
      if (new Date(o.validThrough) < new Date(o.validFrom)) {
        err(`OHS[${label}] validThrough (${o.validThrough}) is before validFrom (${o.validFrom})`);
      }
    }
  }

  // Must have something meaningful: either recurring days+hours, or dated entry
  if (!hasFrom && !o.dayOfWeek) {
    err(`OHS[${label}] must specify either dayOfWeek (recurring) or validFrom/validThrough (dated)`);
  }
}

function main() {
  if (!fs.existsSync(HTML_PATH)) {
    console.error(`✗ index.html not found at ${HTML_PATH}`);
    process.exit(1);
  }
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const blocks = extractJsonLdBlocks(html);
  if (blocks.length === 0) { err("No JSON-LD blocks found in index.html"); }

  const lb = findLocalBusiness(blocks);
  if (!lb) err("No LocalBusiness node found in any JSON-LD block");

  if (lb) {
    // Required fields per Google
    for (const f of ["name", "address"]) {
      if (!lb[f]) err(`LocalBusiness.${f} is required`);
    }
    // Recommended fields
    for (const f of ["@id", "url", "telephone", "image", "priceRange", "description", "openingHoursSpecification"]) {
      if (!lb[f]) warn(`LocalBusiness.${f} is recommended but missing`);
    }

    validateAddress(lb.address);
    validateGeo(lb.geo);

    const ohs = lb.openingHoursSpecification;
    if (ohs !== undefined) {
      if (!Array.isArray(ohs)) err("openingHoursSpecification should be an array");
      else {
        if (ohs.length === 0) err("openingHoursSpecification is empty");
        ohs.forEach((entry, i) => validateOhsEntry(entry, i));
      }
    }
  }

  console.log(`Parsed ${blocks.length} JSON-LD block(s).`);
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warning(s):`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (errors.length) {
    console.log(`\n✗ ${errors.length} error(s):`);
    errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
  console.log("\n✅ LocalBusiness JSON-LD valid");
}

main();
