#!/usr/bin/env node
/**
 * Deploy check: scans the built `dist/` output for forbidden strings to
 * make sure removed contacts (Andy Lopez) are not reintroduced or served
 * from a stale chunk/cache.
 *
 * Usage:
 *   node scripts/deploy-check.mjs           # scans ./dist
 *   node scripts/deploy-check.mjs ./dist    # explicit dir
 *
 * Exits non-zero if any forbidden token is found.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const FORBIDDEN = [
  { label: "Andy Lopez (plaintext)", needle: "Andy Lopez" },
  { label: "text-andy contact key", needle: "text-andy" },
  { label: "email-andy contact key", needle: "email-andy" },
  // Base64 of "9176933767" — the Andy phone that was previously embedded.
  // If a different number was used historically, append additional encodings here.
  { label: "Andy phone (b64: 9176933767)", needle: "OTE3NjkzMzc2Nw==" },
  { label: "Andy phone (plaintext 9176933767)", needle: "9176933767" },
  { label: "Andy phone (formatted 917-693-3767)", needle: "917-693-3767" },
];

// File extensions worth scanning in a Vite build output.
const SCAN_EXT = new Set([
  ".html", ".js", ".mjs", ".cjs", ".css", ".json", ".txt", ".map", ".webmanifest", ".xml",
]);

const distDir = resolve(process.argv[2] ?? "dist");

if (!existsSync(distDir)) {
  console.error(`[deploy-check] dist directory not found: ${distDir}`);
  console.error(`[deploy-check] Run \`vite build\` first.`);
  process.exit(2);
}

/** @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(distDir).filter((f) => {
  const dot = f.lastIndexOf(".");
  return dot === -1 ? true : SCAN_EXT.has(f.slice(dot).toLowerCase());
});

const hits = [];
for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const { label, needle } of FORBIDDEN) {
    let idx = content.indexOf(needle);
    while (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(content.length, idx + needle.length + 40);
      hits.push({
        file: relative(process.cwd(), file),
        label,
        needle,
        snippet: content.slice(start, end).replace(/\s+/g, " "),
      });
      idx = content.indexOf(needle, idx + needle.length);
    }
  }
}

console.log(
  `[deploy-check] scanned ${files.length} files in ${relative(process.cwd(), distDir) || "."}`,
);

if (hits.length === 0) {
  console.log("[deploy-check] ✅ clean — no forbidden tokens found.");
  process.exit(0);
}

console.error(`[deploy-check] ❌ ${hits.length} forbidden hit(s):\n`);
for (const h of hits) {
  console.error(`  • [${h.label}] ${h.file}`);
  console.error(`      …${h.snippet}…`);
}
process.exit(1);
