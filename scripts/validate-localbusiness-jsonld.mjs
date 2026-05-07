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

  // ---------- HowTo validation ----------
  const howtos = [];
  for (const raw of blocks) {
    let data; try { data = JSON.parse(raw); } catch { continue; }
    const graph = data["@graph"] || [data];
    for (const node of graph) {
      const t = node?.["@type"];
      if (t === "HowTo" || (Array.isArray(t) && t.includes("HowTo"))) howtos.push(node);
    }
  }
  for (const h of howtos) {
    const label = h.name || h["@id"] || "(unnamed HowTo)";
    if (!h.name) err(`HowTo[${label}].name is required`);
    if (!Array.isArray(h.step) || h.step.length === 0) {
      err(`HowTo[${label}].step must be a non-empty array`);
    } else {
      h.step.forEach((s, i) => {
        if (s["@type"] !== "HowToStep") err(`HowTo[${label}] step ${i + 1}: @type must be "HowToStep"`);
        if (!s.name) err(`HowTo[${label}] step ${i + 1}: name is required`);
        if (!s.text) err(`HowTo[${label}] step ${i + 1}: text is required`);
        if (s.position !== undefined && s.position !== i + 1) {
          warn(`HowTo[${label}] step ${i + 1}: position ${s.position} doesn't match index`);
        }
      });
    }
    if (h.totalTime && !/^P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/.test(h.totalTime)) {
      err(`HowTo[${label}].totalTime "${h.totalTime}" is not a valid ISO 8601 duration`);
    }
  }

  console.log(`Parsed ${blocks.length} JSON-LD block(s).`);
  if (howtos.length) console.log(`Found ${howtos.length} HowTo node(s).`);

  // ---------- Per-field report ----------
  if (lb) {
    const required = ["name", "address"];
    const recommended = ["@id", "url", "telephone", "image", "priceRange", "description", "geo", "openingHoursSpecification", "email"];
    const fmt = (v) => v === undefined ? "—" : (typeof v === "string" ? (v.length > 60 ? v.slice(0, 57) + "…" : v) : (Array.isArray(v) ? `[${v.length}]` : "[object]"));
    const status = (cond, req) => cond ? "✓" : (req ? "✗" : "○");
    const rows = [
      ...required.map((f) => [status(!!lb[f], true), "required", f, fmt(lb[f])]),
      ...recommended.map((f) => [status(!!lb[f], false), "recommended", f, fmt(lb[f])]),
    ];
    if (lb.address && typeof lb.address === "object") {
      for (const f of ["streetAddress", "addressLocality", "addressRegion", "postalCode", "addressCountry"]) {
        rows.push([status(!!lb.address[f], true), "address", `address.${f}`, fmt(lb.address[f])]);
      }
    }
    const widths = [3, 12, 32, 62];
    const pad = (s, w) => String(s).padEnd(w);
    console.log("\n=== LocalBusiness Field Report ===");
    console.log(pad("", widths[0]) + pad("level", widths[1]) + pad("field", widths[2]) + "value");
    console.log("-".repeat(widths.reduce((a, b) => a + b, 0)));
    for (const r of rows) console.log(pad(r[0], widths[0]) + pad(r[1], widths[1]) + pad(r[2], widths[2]) + r[3]);

    // ---------- OHS Summary Table ----------
    const ohs = Array.isArray(lb.openingHoursSpecification) ? lb.openingHoursSpecification : [];
    if (ohs.length) {
      console.log("\n=== OpeningHoursSpecification Summary ===");
      const head = ["#", "name / kind", "dayOfWeek", "opens", "closes", "validFrom", "validThrough"];
      const w = [3, 32, 28, 7, 7, 12, 14];
      console.log(head.map((h, i) => pad(h, w[i])).join(""));
      console.log("-".repeat(w.reduce((a, b) => a + b, 0)));
      ohs.forEach((o, i) => {
        const dow = o.dayOfWeek === undefined ? "—" : (Array.isArray(o.dayOfWeek) ? (o.dayOfWeek.length === 7 ? "All days" : o.dayOfWeek.map((d) => d.slice(0, 3)).join(",")) : o.dayOfWeek);
        const name = o.name || (o.validFrom ? "(dated)" : "(recurring)");
        const row = [
          String(i + 1),
          fmt(name),
          dow.length > w[2] - 2 ? dow.slice(0, w[2] - 3) + "…" : dow,
          o.opens ?? "—",
          o.closes ?? "—",
          o.validFrom ?? "—",
          o.validThrough ?? "—",
        ];
        console.log(row.map((c, j) => pad(c, w[j])).join(""));
      });
      console.log(`\nTotal entries: ${ohs.length}`);
    }
  }

  // ---------- Errors / Warnings ----------
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warning(s):`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (errors.length) {
    // Group errors by leading field token, e.g. "OHS[Purim]" or "address.streetAddress"
    const groups = new Map();
    for (const e of errors) {
      const key = (e.match(/^([A-Za-z@][\w.\[\]'\-/ ]*)/)?.[1] || "general").trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    console.log(`\n✗ ${errors.length} error(s) across ${groups.size} field(s):`);
    for (const [field, list] of groups) {
      console.log(`  • ${field} (${list.length})`);
      list.forEach((e) => console.log(`      - ${e}`));
    }
    process.exit(1);
  }
  console.log("\n✅ LocalBusiness JSON-LD valid");
}

main();
