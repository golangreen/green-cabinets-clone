import { describe, expect, it } from "vitest";
import { fitDescription, fitTitle } from "../metaText";
import { MERGED_BLOG_POSTS, BLOG_TITLE_OVERRIDES } from "@/data/blogSeo";
import { STATIC_BLOG_POSTS, getStaticBlogPost, relatedBlogPosts } from "@/data/blogIndex";

describe("metaText", () => {
  it("keeps whole sentences under the limit", () => {
    const t = "One short sentence. " + "Two ".repeat(50) + "end.";
    expect(fitDescription(t)).toBe("One short sentence.");
  });
  it("cuts a single long sentence at a word boundary", () => {
    const out = fitDescription("word ".repeat(60));
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
  });
  it("adds the first suffix that fits", () => {
    expect(fitTitle("Short", [" | Green Cabinets NY"])).toBe("Short | Green Cabinets NY");
    expect(fitTitle("x".repeat(50), [" | Green Cabinets NY", " | GC"])).toBe("x".repeat(50) + " | GC");
  });
});

describe("blog SEO data", () => {
  it("drops merged posts from the static list and lookups", () => {
    for (const [from, to] of Object.entries(MERGED_BLOG_POSTS)) {
      expect(STATIC_BLOG_POSTS.some((p) => p.slug === from)).toBe(false);
      expect(getStaticBlogPost(from)).toBeNull();
      expect(getStaticBlogPost(to)).not.toBeNull();
    }
  });
  it("keeps override titles within 60 characters", () => {
    for (const o of Object.values(BLOG_TITLE_OVERRIDES)) {
      if (o.meta_title) expect(o.meta_title.length).toBeLessThanOrEqual(60);
    }
  });
  it("every static post title fits in 60 characters", () => {
    for (const p of STATIC_BLOG_POSTS) expect((p.meta_title || p.title).length, p.slug).toBeLessThanOrEqual(60);
  });
  it("finds related posts that exist", () => {
    const rel = relatedBlogPosts("custom-kitchen-cabinets-greenpoint-brooklyn", [], "Greenpoint");
    expect(rel.length).toBeGreaterThan(0);
    expect(rel.every((p) => STATIC_BLOG_POSTS.includes(p))).toBe(true);
  });
});
