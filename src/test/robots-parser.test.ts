import { describe, it, expect } from "vitest";
// @ts-expect-error — plain .mjs module, no types needed
import { parseRobots, makeGuideLike } from "../../scripts/lib/robots-parser.mjs";

type Group = { allow: Set<string>; disallow: Set<string> };
type Parsed = { groups: Map<string, Group>; sitemaps: string[] };

const get = (p: Parsed, ua: string) => {
  const g = p.groups.get(ua);
  if (!g) throw new Error(`missing UA group: ${ua}`);
  return { allow: [...g.allow].sort(), disallow: [...g.disallow].sort() };
};

describe("parseRobots", () => {
  it("returns empty groups + sitemaps for empty input", () => {
    const r = parseRobots("");
    expect(r.groups.size).toBe(0);
    expect(r.sitemaps).toEqual([]);
  });

  it("handles null/undefined input safely", () => {
    expect(parseRobots(undefined as unknown as string).groups.size).toBe(0);
    expect(parseRobots(null as unknown as string).sitemaps).toEqual([]);
  });

  it("parses a single UA group with allow + disallow", () => {
    const r = parseRobots(
      ["User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /auth"].join("\n"),
    );
    expect(get(r, "*")).toEqual({
      allow: ["/"],
      disallow: ["/admin", "/auth"],
    });
  });

  it("collects top-level Sitemap directives separately", () => {
    const r = parseRobots(
      [
        "Sitemap: https://x.com/sitemap.xml",
        "User-agent: *",
        "Disallow: /admin",
        "Sitemap: https://x.com/news.xml",
      ].join("\n"),
    );
    expect(r.sitemaps).toEqual([
      "https://x.com/sitemap.xml",
      "https://x.com/news.xml",
    ]);
    expect(get(r, "*").disallow).toEqual(["/admin"]);
  });

  it("groups stacked User-agent lines that share rules", () => {
    const r = parseRobots(
      [
        "User-agent: Googlebot",
        "User-agent: Bingbot",
        "Allow: /",
        "Disallow: /private",
      ].join("\n"),
    );
    expect(get(r, "Googlebot")).toEqual({
      allow: ["/"],
      disallow: ["/private"],
    });
    expect(get(r, "Bingbot")).toEqual({
      allow: ["/"],
      disallow: ["/private"],
    });
  });

  it("starts a fresh group when a UA appears after rules", () => {
    const r = parseRobots(
      [
        "User-agent: *",
        "Disallow: /admin",
        "User-agent: Googlebot",
        "Allow: /",
      ].join("\n"),
    );
    expect(get(r, "*")).toEqual({ allow: [], disallow: ["/admin"] });
    expect(get(r, "Googlebot")).toEqual({ allow: ["/"], disallow: [] });
  });

  it("merges repeated UA blocks idempotently", () => {
    const r = parseRobots(
      [
        "User-agent: *",
        "Disallow: /a",
        "User-agent: Googlebot",
        "Disallow: /g",
        "User-agent: *",
        "Disallow: /a", // duplicate
        "Disallow: /b",
      ].join("\n"),
    );
    expect(get(r, "*")).toEqual({ allow: [], disallow: ["/a", "/b"] });
    expect(get(r, "Googlebot")).toEqual({ allow: [], disallow: ["/g"] });
  });

  it("ignores blank lines, comments, and inline comments", () => {
    const r = parseRobots(
      [
        "# top comment",
        "",
        "User-agent: *   # who",
        "Allow: /  # root",
        "# Disallow: /should-be-ignored",
        "Disallow: /admin",
      ].join("\n"),
    );
    expect(get(r, "*")).toEqual({ allow: ["/"], disallow: ["/admin"] });
  });

  it("treats field names case-insensitively", () => {
    const r = parseRobots(
      ["USER-AGENT: *", "ALLOW: /", "DISALLOW: /admin", "SITEMAP: https://x/y"].join("\n"),
    );
    expect(get(r, "*")).toEqual({ allow: ["/"], disallow: ["/admin"] });
    expect(r.sitemaps).toEqual(["https://x/y"]);
  });

  it("handles \\r\\n line endings", () => {
    const r = parseRobots("User-agent: *\r\nDisallow: /admin\r\n");
    expect(get(r, "*").disallow).toEqual(["/admin"]);
  });

  it("drops orphan Allow/Disallow with no preceding User-agent", () => {
    const r = parseRobots(["Allow: /", "Disallow: /admin", "User-agent: *", "Allow: /ok"].join("\n"));
    expect(get(r, "*")).toEqual({ allow: ["/ok"], disallow: [] });
  });

  it("ignores unknown fields without breaking parsing", () => {
    const r = parseRobots(
      [
        "User-agent: *",
        "Crawl-delay: 5",
        "Host: example.com",
        "Disallow: /admin",
      ].join("\n"),
    );
    expect(get(r, "*").disallow).toEqual(["/admin"]);
  });

  it("preserves wildcard rule values verbatim", () => {
    const r = parseRobots(
      ["User-agent: *", "Allow: /*.css$", "Allow: /*.js$", "Disallow: /admin"].join("\n"),
    );
    expect(get(r, "*").allow).toEqual(["/*.css$", "/*.js$"]);
  });

  it("matches the production robots.txt expectations end-to-end", () => {
    const sample = `# Production robots
User-agent: *
Allow: /
Allow: /assets/
Allow: /*.css$
Disallow: /admin/
Disallow: /admin
Disallow: /auth
Disallow: /checkout

Sitemap: https://greencabinetsny.com/sitemap.xml
`;
    const r = parseRobots(sample);
    const star = get(r, "*");
    expect(star.allow).toContain("/");
    expect(star.allow).toContain("/*.css$");
    expect(star.disallow).toEqual(
      expect.arrayContaining(["/admin", "/admin/", "/auth", "/checkout"]),
    );
    expect(r.sitemaps).toEqual(["https://greencabinetsny.com/sitemap.xml"]);
  });
});

describe("makeGuideLike", () => {
  const isGuide = makeGuideLike({
    corePages: ["/", "/about", "/shop", "/case-studies"],
    excludePrefixes: ["/custom-kitchen-cabinets-"],
  });

  it("matches multi-word kebab slugs at root", () => {
    expect(isGuide("/best-wood-for-kitchen-cabinets")).toBe(true);
    expect(isGuide("/kitchen-renovation-brooklyn")).toBe(true);
  });

  it("rejects single-segment one-word and two-word paths", () => {
    expect(isGuide("/about")).toBe(false);
    expect(isGuide("/wood-species")).toBe(false); // only 1 hyphen
  });

  it("rejects nested paths", () => {
    expect(isGuide("/blog/best-wood-for-cabinets")).toBe(false);
  });

  it("rejects core pages even if shape matches", () => {
    expect(isGuide("/case-studies")).toBe(false);
  });

  it("rejects excluded prefixes (city landing namespace)", () => {
    expect(isGuide("/custom-kitchen-cabinets-brooklyn")).toBe(false);
    expect(isGuide("/custom-kitchen-cabinets-park-slope")).toBe(false);
  });

  it("rejects uppercase/invalid characters", () => {
    expect(isGuide("/Best-Wood-For-Cabinets")).toBe(false);
    expect(isGuide("/best_wood_for_cabinets")).toBe(false);
  });

  it("works with default options", () => {
    const def = makeGuideLike();
    expect(def("/foo-bar-baz")).toBe(true);
    expect(def("/foo")).toBe(false);
  });
});
