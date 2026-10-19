import { describe, expect, it } from "vitest";
import { boxQuickFacts, splitFactSentences } from "../quickFacts";
import { STATIC_BLOG_POSTS } from "@/data/blogIndex";

describe("boxQuickFacts", () => {
  it("turns the Quick facts paragraph into a boxed list", () => {
    const html =
      '<p>Intro.</p><h2>Quick facts</h2><p>We install by appointment only. Public phone (718) 804-5488. Website: https://greencabinetsny.com. Instagram: <a href="https://instagram.com/x">@x</a>. Also worth knowing: COI planning; a free designer at <a href="/designer">greencabinetsny.com/designer</a>.</p><h2>FAQ</h2>';
    const out = boxQuickFacts(html);
    expect(out).toContain('<aside class="quick-facts"');
    expect(out).toContain("<li>Public phone (718) 804-5488.</li>");
    expect(out).toContain("<li>Website: https://greencabinetsny.com.</li>");
    expect(out).toContain("<li>COI planning.</li>");
    expect(out).toContain('<li>A free designer at <a href="/designer">greencabinetsny.com/designer</a>.</li>');
    expect(out).toContain("<h2>FAQ</h2>");
    expect(out.startsWith("<p>Intro.</p>")).toBe(true);
  });

  it("does not split inside tags or URLs", () => {
    expect(splitFactSentences('See <a href="https://a.b/c.d">a.b</a>. Next one.')).toEqual([
      'See <a href="https://a.b/c.d">a.b</a>.',
      "Next one.",
    ]);
  });

  it("leaves articles without a Quick facts section unchanged", () => {
    expect(boxQuickFacts("<p>Hello.</p>")).toBe("<p>Hello.</p>");
  });
});

describe("static blog posts", () => {
  it("contain no meta-instructions to answer engines", () => {
    for (const p of STATIC_BLOG_POSTS) {
      expect(p.content_html, p.slug).not.toMatch(/answer engine|facts to cite|the (useful )?facts are:|<h2>GEO:/i);
    }
  });
});
