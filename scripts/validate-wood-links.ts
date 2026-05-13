/**
 * Build-time validator for internal wood-species links.
 *
 * Fails the build (exit 1) when:
 *   1. Any comparison points at a slug that doesn't exist in WOOD_SPECIES.
 *   2. Any of the five core species (maple, walnut, white-oak, red-oak, hickory)
 *      is missing a link to one of the other four (full-mesh requirement).
 *   3. A comparison entry has empty title/blurb.
 *   4. A species self-references (slug === source slug).
 *
 * Wired into package.json as `predev` + `prebuild`.
 */
import { WOOD_SPECIES } from "../src/data/woodSpecies";
import { WOOD_COMPARISONS } from "../src/data/woodComparisons";

const CORE = ["maple", "walnut", "white-oak", "red-oak", "hickory"] as const;
const validSlugs = new Set(WOOD_SPECIES.map((w) => w.slug));
const errors: string[] = [];
const warnings: string[] = [];

// 1 + 3 + 4: per-entry validity
for (const [src, list] of Object.entries(WOOD_COMPARISONS)) {
  if (!validSlugs.has(src)) {
    errors.push(`Source slug "${src}" in WOOD_COMPARISONS not found in WOOD_SPECIES`);
    continue;
  }
  for (const c of list) {
    if (c.slug === src) errors.push(`[${src}] self-link to "${c.slug}"`);
    if (!validSlugs.has(c.slug))
      errors.push(`[${src}] broken link → "${c.slug}" (not in WOOD_SPECIES)`);
    if (!c.title?.trim()) errors.push(`[${src}] → "${c.slug}" missing title`);
    if (!c.blurb?.trim()) errors.push(`[${src}] → "${c.slug}" missing blurb`);
    if (c.blurb && c.blurb.length > 180)
      warnings.push(`[${src}] → "${c.slug}" blurb is ${c.blurb.length}c (recommend ≤180)`);
  }
}

// 2: full-mesh among CORE 5
for (const a of CORE) {
  const targets = new Set((WOOD_COMPARISONS[a] ?? []).map((c) => c.slug));
  for (const b of CORE) {
    if (a === b) continue;
    if (!targets.has(b)) errors.push(`Missing core link: ${a} → ${b}`);
  }
}

// Reverse-link sanity: every comparison should be bidirectional
for (const [src, list] of Object.entries(WOOD_COMPARISONS)) {
  for (const c of list) {
    const reverse = WOOD_COMPARISONS[c.slug] ?? [];
    if (!reverse.some((r) => r.slug === src))
      warnings.push(`Asymmetric link: ${src} → ${c.slug} but no reverse ${c.slug} → ${src}`);
  }
}

const total = Object.values(WOOD_COMPARISONS).reduce((a, l) => a + l.length, 0);
console.log(
  `[wood-links] validated ${Object.keys(WOOD_COMPARISONS).length} sources / ${total} comparison links`
);

if (warnings.length) {
  console.warn(`\n[wood-links] ${warnings.length} warning(s):`);
  warnings.forEach((w) => console.warn("  ⚠ " + w));
}
if (errors.length) {
  console.error(`\n[wood-links] ${errors.length} ERROR(S):`);
  errors.forEach((e) => console.error("  ✗ " + e));
  process.exit(1);
}
console.log("[wood-links] ✓ all internal links valid");
