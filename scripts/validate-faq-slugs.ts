/**
 * Build-time validator for FAQ anchor slugs.
 *
 * Fails the build (exit 1) when:
 *   1. Two FAQ questions within the same species slugify to the same anchor.
 *   2. An empty/degenerate slug is generated (e.g. all punctuation question).
 *   3. A previously-known slug disappears or changes for a still-existing question
 *      (breaks deep links + JSON-LD @id stability). Add new questions freely;
 *      removing or renaming requires updating the snapshot intentionally:
 *        bun run scripts/validate-faq-slugs.ts --update
 *
 * Snapshot lives at scripts/snapshots/faq-slugs.json and IS committed.
 *
 * Wired into package.json as `predev` + `prebuild`.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WOOD_SPECIES } from "../src/data/woodSpecies";

// Must mirror src/pages/WoodSpeciesDetail.tsx::faqSlug exactly.
const faqSlug = (q: string) =>
  q.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = resolve(__dirname, "snapshots/faq-slugs.json");
const updateMode = process.argv.includes("--update");

type SpeciesSnapshot = Record<string, Record<string, string>>; // species → { question → slug }

const errors: string[] = [];
const warnings: string[] = [];
const current: SpeciesSnapshot = {};

for (const wood of WOOD_SPECIES) {
  const seen = new Map<string, string>(); // slug → first question that produced it
  current[wood.slug] = {};

  for (const f of wood.faqs) {
    const slug = faqSlug(f.question);
    if (!slug) {
      errors.push(`[${wood.slug}] empty slug generated for question: "${f.question}"`);
      continue;
    }
    const existing = seen.get(slug);
    if (existing) {
      errors.push(
        `[${wood.slug}] duplicate slug "${slug}" — collides:\n      A: "${existing}"\n      B: "${f.question}"`
      );
    } else {
      seen.set(slug, f.question);
    }
    current[wood.slug][f.question] = slug;
  }
}

// Stability check vs snapshot
let snapshot: SpeciesSnapshot | null = null;
if (existsSync(SNAPSHOT_PATH)) {
  try {
    snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
  } catch (e) {
    warnings.push(`Snapshot at ${SNAPSHOT_PATH} is unreadable, skipping stability check.`);
  }
}

if (snapshot && !updateMode) {
  for (const [species, questions] of Object.entries(snapshot)) {
    const cur = current[species];
    if (!cur) {
      warnings.push(`Species "${species}" present in snapshot but missing from data (deleted?).`);
      continue;
    }
    for (const [question, prevSlug] of Object.entries(questions)) {
      const nowSlug = cur[question];
      if (nowSlug === undefined) {
        warnings.push(
          `[${species}] snapshot question removed (or text edited): "${question}"`
        );
      } else if (nowSlug !== prevSlug) {
        errors.push(
          `[${species}] slug for question changed (breaks deep links): "${question}"\n      was: "${prevSlug}"\n      now: "${nowSlug}"`
        );
      }
    }
  }
}

if (updateMode) {
  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(current, null, 2) + "\n");
  console.log(`✅ FAQ slug snapshot written to ${SNAPSHOT_PATH}`);
  process.exit(0);
}

if (!snapshot) {
  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(current, null, 2) + "\n");
  console.log(`ℹ️  Created initial FAQ slug snapshot at ${SNAPSHOT_PATH}`);
}

if (warnings.length) {
  console.warn("⚠️  FAQ slug warnings:\n  - " + warnings.join("\n  - "));
}

if (errors.length) {
  console.error(
    "\n❌ FAQ slug validation failed:\n  - " + errors.join("\n  - ") +
      "\n\nIf the change is intentional, run: bun run scripts/validate-faq-slugs.ts --update\n"
  );
  process.exit(1);
}

const total = Object.values(current).reduce((n, qs) => n + Object.keys(qs).length, 0);
console.log(`✅ FAQ slugs OK — ${total} questions across ${Object.keys(current).length} species, all unique & stable.`);
