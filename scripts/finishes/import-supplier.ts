#!/usr/bin/env bun
/**
 * Automatic finishes importer.
 *
 *   bun scripts/finishes/import-supplier.ts <brand> <feed.csv|feed.json> [--catalog-url=...]
 *
 * - Reads a supplier feed (CSV or JSON) → maps rows to MaterialPanel[].
 * - Writes src/data/finishes/<brand-slug>.ts (auto-generated, hand edits lost).
 * - Honours overrides in scripts/finishes/overrides/<brand-slug>.json (per-id patch).
 * - Regenerates src/data/finishes/index.ts and the MaterialBrand union in
 *   src/types/materials.ts by scanning every brand file in the folder.
 *
 * No manual edits required to add a new supplier — just drop the feed and run.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';

// ─────────────────────────── Types ────────────────────────────────────
interface RawPanel {
  id?: string;
  slug?: string;
  name: string;
  codes?: string[] | string;
  category?: string;
  finish?: string;
  thumb?: string;
  hiRes?: string;
  detailUrl?: string;
  swatchHex?: string;
}

interface ImportConfig {
  brand: string;                // Display brand name, e.g. "Tafisa"
  feedPath: string;             // Path to CSV / JSON
  catalogUrl?: string;          // Optional manufacturer catalog URL
}

// ─────────────────────────── Helpers ──────────────────────────────────
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const brandSlug = (b: string) => slugify(b);
const brandConst = (b: string) => brandSlug(b).toUpperCase().replace(/-/g, '_');

const ROOT = resolve(import.meta.dirname, '../..');
const FINISHES_DIR = join(ROOT, 'src/data/finishes');
const TYPES_FILE = join(ROOT, 'src/types/materials.ts');
const OVERRIDES_DIR = join(import.meta.dirname, 'overrides');

// ─────────────────────────── Feed parsers ─────────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  // Minimal CSV (handles quoted commas + escaped quotes). Good enough for supplier feeds.
  const rows: string[][] = [];
  let cur: string[] = [];
  let cell = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { cur.push(cell); cell = ''; }
      else if (c === '\n') { cur.push(cell); rows.push(cur); cur = []; cell = ''; }
      else if (c === '\r') { /* skip */ }
      else cell += c;
    }
  }
  if (cell.length || cur.length) { cur.push(cell); rows.push(cur); }
  const [header, ...data] = rows.filter(r => r.some(c => c.trim()));
  return data.map(r => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

function loadFeed(path: string): Record<string, any>[] {
  const raw = readFileSync(path, 'utf8');
  if (path.toLowerCase().endsWith('.json')) {
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : j.panels ?? j.items ?? j.data ?? [];
  }
  return parseCsv(raw);
}

// ─────────────────────────── Row → MaterialPanel ──────────────────────
/** Generic column-name resolver. Suppliers vary; we accept many aliases. */
const FIELD_ALIASES: Record<keyof RawPanel, string[]> = {
  id:        ['id', 'sku'],
  slug:      ['slug'],
  name:      ['name', 'decor_name', 'color', 'colour', 'title', 'product_name'],
  codes:     ['codes', 'code', 'sku', 'decor_number', 'product_code', 'tfl', 'hpl'],
  category:  ['category', 'color_family', 'family', 'group', 'collection'],
  finish:    ['finish', 'texture', 'surface'],
  thumb:     ['thumb', 'thumbnail', 'image', 'image_small', 'swatch'],
  hiRes:     ['hi_res', 'hiRes', 'image_large', 'image_high', 'image_hires', 'image_full'],
  detailUrl: ['detail_url', 'detailUrl', 'url', 'product_url', 'link'],
  swatchHex: ['swatch_hex', 'swatchHex', 'hex', 'color_hex'],
};

function pick(row: Record<string, any>, aliases: string[]): any {
  for (const a of aliases) {
    if (row[a] !== undefined && row[a] !== '') return row[a];
    const lc = Object.keys(row).find(k => k.toLowerCase() === a.toLowerCase());
    if (lc && row[lc] !== undefined && row[lc] !== '') return row[lc];
  }
  return undefined;
}

function rowToPanel(row: Record<string, any>, brand: string): RawPanel | null {
  const name = pick(row, FIELD_ALIASES.name);
  if (!name) return null;

  const codesRaw = pick(row, FIELD_ALIASES.codes);
  const codes = Array.isArray(codesRaw)
    ? codesRaw.map(String)
    : typeof codesRaw === 'string'
      ? codesRaw.split(/[|;]/).map(s => s.trim()).filter(Boolean)
      : [];

  const slug = pick(row, FIELD_ALIASES.slug) ?? slugify(String(name));
  const id   = pick(row, FIELD_ALIASES.id)   ?? `${brandSlug(brand)}-${slug}`;

  return {
    id,
    slug,
    name: String(name),
    codes,
    category:  pick(row, FIELD_ALIASES.category)  ?? '',
    finish:    pick(row, FIELD_ALIASES.finish)    ?? '',
    thumb:     pick(row, FIELD_ALIASES.thumb)     ?? '',
    hiRes:     pick(row, FIELD_ALIASES.hiRes)     ?? '',
    detailUrl: pick(row, FIELD_ALIASES.detailUrl) ?? '',
    swatchHex: pick(row, FIELD_ALIASES.swatchHex),
  };
}

// ─────────────────────────── Overrides merge ──────────────────────────
function applyOverrides(panels: RawPanel[], brand: string): RawPanel[] {
  const file = join(OVERRIDES_DIR, `${brandSlug(brand)}.json`);
  if (!existsSync(file)) return panels;
  const patches: Record<string, Partial<RawPanel>> = JSON.parse(readFileSync(file, 'utf8'));
  return panels.map(p => (p.id && patches[p.id]) ? { ...p, ...patches[p.id] } : p);
}

// ─────────────────────────── Emit brand .ts ───────────────────────────
function emitBrandFile(brand: string, panels: RawPanel[], catalogUrl?: string) {
  const constName = `${brandConst(brand)}_PANELS`;
  const catalogConst = `${brandConst(brand)}_CATALOG_URL`;
  const body = panels.map(p => ({
    id: p.id,
    brand,
    slug: p.slug,
    name: p.name,
    codes: p.codes ?? [],
    category: p.category ?? '',
    finish: p.finish ?? '',
    thumb: p.thumb ?? '',
    hiRes: p.hiRes ?? '',
    detailUrl: p.detailUrl ?? '',
    ...(p.swatchHex ? { swatchHex: p.swatchHex } : {}),
  }));

  const catalogLine = catalogUrl
    ? `\nexport const ${catalogConst} = ${JSON.stringify(catalogUrl)};\n`
    : '';

  const ts = `// AUTO-GENERATED by scripts/finishes/import-supplier.ts — do not edit by hand.
// Source feed re-imported on ${new Date().toISOString().slice(0, 10)} (${panels.length} panels).
// To refresh: bun scripts/finishes/import-supplier.ts ${JSON.stringify(brand)} <feed>

import type { MaterialPanel } from "@/types/materials";
${catalogLine}
export const ${constName}: MaterialPanel[] = ${JSON.stringify(body, null, 2)};
`;

  const outPath = join(FINISHES_DIR, `${brandSlug(brand)}.ts`);
  writeFileSync(outPath, ts);
  console.log(`✓ Wrote ${panels.length} panels → ${outPath}`);
  return outPath;
}

// ─────────────────────────── Scan & regen index/types ─────────────────
interface BrandFile { brand: string; slug: string; constName: string; catalogConst?: string; }

function scanBrands(): BrandFile[] {
  return readdirSync(FINISHES_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => {
      const src = readFileSync(join(FINISHES_DIR, f), 'utf8');
      const panelsMatch = src.match(/export const (\w+_PANELS)\s*:/);
      const catalogMatch = src.match(/export const (\w+_CATALOG_URL)\s*=/);
      const brandMatch = src.match(/brand:\s*["']([^"']+)["']/);
      if (!panelsMatch || !brandMatch) return null;
      return {
        brand: brandMatch[1],
        slug: basename(f, '.ts'),
        constName: panelsMatch[1],
        catalogConst: catalogMatch?.[1],
      };
    })
    .filter(Boolean) as BrandFile[];
}

function regenerateIndex(brands: BrandFile[]) {
  const imports = brands.map(b => {
    const parts = [b.constName];
    if (b.catalogConst) parts.push(b.catalogConst);
    return `import { ${parts.join(', ')} } from "./${b.slug}";`;
  }).join('\n');

  const allPanels = brands.map(b => `  ...${b.constName},`).join('\n');
  const byBrand = brands.map(b => `  ${JSON.stringify(b.brand)}: ${b.constName},`).join('\n');
  const catalog = brands.filter(b => b.catalogConst)
    .map(b => `  ${JSON.stringify(b.brand)}: ${b.catalogConst},`).join('\n');

  const ts = `// AUTO-GENERATED by scripts/finishes/import-supplier.ts.
// Brands are discovered by scanning src/data/finishes/*.ts.
import type { MaterialBrand, MaterialPanel } from "@/types/materials";
${imports}

export const ALL_PANELS: MaterialPanel[] = [
${allPanels}
];

export const PANELS_BY_BRAND: Record<MaterialBrand, MaterialPanel[]> = {
${byBrand}
};

export const BRAND_FULL_CATALOG_URL: Partial<Record<MaterialBrand, string>> = {
${catalog}
};
`;
  writeFileSync(join(FINISHES_DIR, 'index.ts'), ts);
  console.log(`✓ Regenerated ${join(FINISHES_DIR, 'index.ts')}`);
}

function regenerateBrandUnion(brands: BrandFile[]) {
  const src = readFileSync(TYPES_FILE, 'utf8');
  const union = brands.map(b => JSON.stringify(b.brand)).join(' | ');
  const next = src.replace(
    /export type MaterialBrand =[^;]+;/,
    `export type MaterialBrand = ${union};`,
  );
  if (next !== src) {
    writeFileSync(TYPES_FILE, next);
    console.log(`✓ Updated MaterialBrand union → ${union}`);
  }
}

// ─────────────────────────── CLI ──────────────────────────────────────
function parseArgs(): ImportConfig {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      'Usage: bun scripts/finishes/import-supplier.ts <brand> <feed.csv|json> [--catalog-url=...]\n' +
      '       bun scripts/finishes/import-supplier.ts --regen-only',
    );
    process.exit(1);
  }
  const catalog = args.find(a => a.startsWith('--catalog-url='))?.split('=')[1];
  return { brand: args[0], feedPath: resolve(args[1]), catalogUrl: catalog };
}

function main() {
  if (!existsSync(OVERRIDES_DIR)) mkdirSync(OVERRIDES_DIR, { recursive: true });

  if (process.argv.includes('--regen-only')) {
    const brands = scanBrands();
    regenerateIndex(brands);
    regenerateBrandUnion(brands);
    return;
  }

  const cfg = parseArgs();
  const rows = loadFeed(cfg.feedPath);
  const panels = rows
    .map(r => rowToPanel(r, cfg.brand))
    .filter((p): p is RawPanel => !!p);

  const merged = applyOverrides(panels, cfg.brand);
  emitBrandFile(cfg.brand, merged, cfg.catalogUrl);

  const brands = scanBrands();
  regenerateIndex(brands);
  regenerateBrandUnion(brands);

  console.log(`\nDone. ${merged.length} ${cfg.brand} panels imported.`);
  if (!brands.find(b => b.brand === cfg.brand)) {
    console.warn(`⚠  ${cfg.brand} not detected after import — check feed format.`);
  }
}

main();
