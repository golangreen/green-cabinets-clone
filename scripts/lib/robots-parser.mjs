/**
 * robots.txt parser + guide-URL classifier.
 * Extracted for unit testing — keep pure (no I/O, no logging).
 */

/**
 * Parse robots.txt into:
 *   - `groups`: Map<userAgent, { allow: Set<string>, disallow: Set<string> }>
 *   - `sitemaps`: string[] (top-level Sitemap: directives)
 *
 * Behavior:
 *   - Ignores blank lines and `# comments` (inline comments stripped).
 *   - Field names are case-insensitive; UA values preserve case.
 *   - Multiple `User-agent:` lines stacked before any rule share the same
 *     rule block (standard grouping).
 *   - A `User-agent:` after a rule block starts a fresh group.
 *   - Repeated UA blocks merge into the same Set entries (idempotent).
 *   - Allow/Disallow with no preceding User-agent are dropped (orphan).
 *   - Unknown fields are ignored.
 */
export function parseRobots(text) {
  const groups = new Map();
  const sitemaps = [];
  let pendingUAs = [];
  let sawRule = false;

  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();

    if (field === "sitemap") {
      sitemaps.push(value);
      continue;
    }
    if (field === "user-agent") {
      if (sawRule) {
        pendingUAs = [];
        sawRule = false;
      }
      pendingUAs.push(value);
      if (!groups.has(value)) {
        groups.set(value, { allow: new Set(), disallow: new Set() });
      }
      continue;
    }
    if (field === "allow" || field === "disallow") {
      if (!pendingUAs.length) continue;
      sawRule = true;
      for (const ua of pendingUAs) {
        groups.get(ua)[field].add(value);
      }
    }
  }
  return { groups, sitemaps };
}

/**
 * Build a "looks like a migrated guide URL path" predicate.
 * - Multi-word kebab slug at root (2+ hyphens, single segment).
 * - Excludes core pages and the `/custom-kitchen-cabinets-*` namespace.
 */
export function makeGuideLike({ corePages = [], excludePrefixes = [] } = {}) {
  const core = new Set(corePages);
  return (path) =>
    /^\/[a-z0-9]+(?:-[a-z0-9]+){2,}$/.test(path) &&
    !core.has(path) &&
    !excludePrefixes.some((p) => path.startsWith(p));
}
