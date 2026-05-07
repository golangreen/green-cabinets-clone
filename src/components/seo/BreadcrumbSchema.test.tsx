import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import BreadcrumbSchema, { type BreadcrumbItem } from "./BreadcrumbSchema";

const BASE = "https://greencabinetsny.com";

const renderSchema = (items: BreadcrumbItem[]) => {
  const helmetContext: { helmet?: { script?: { toString(): string } } } = {};
  render(
    <HelmetProvider context={helmetContext}>
      <BreadcrumbSchema items={items} />
    </HelmetProvider>,
  );
  // react-helmet-async renders synchronously to context
  const scriptHtml = helmetContext.helmet?.script?.toString() ?? "";
  const match = scriptHtml.match(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("No JSON-LD script emitted");
  return JSON.parse(match[1]);
};

describe("BreadcrumbSchema", () => {
  beforeEach(() => {
    // each test gets a fresh helmet context via renderSchema
  });

  it("emits a valid BreadcrumbList with @context and @type", () => {
    const json = renderSchema([{ name: "Home", url: "/" }]);
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(Array.isArray(json.itemListElement)).toBe(true);
  });

  it("converts a relative path to an absolute URL using the base", () => {
    const json = renderSchema([{ name: "Shop", url: "/shop" }]);
    expect(json.itemListElement[0].item).toBe(`${BASE}/shop`);
  });

  it("preserves an http absolute URL as-is", () => {
    const json = renderSchema([
      { name: "External", url: "http://example.com/foo" },
    ]);
    expect(json.itemListElement[0].item).toBe("http://example.com/foo");
  });

  it("preserves an https absolute URL as-is", () => {
    const json = renderSchema([
      { name: "External", url: "https://other.com/bar" },
    ]);
    expect(json.itemListElement[0].item).toBe("https://other.com/bar");
  });

  it("preserves the project base URL when passed absolutely", () => {
    const json = renderSchema([
      { name: "Brooklyn", url: `${BASE}/custom-kitchen-cabinets-brooklyn` },
    ]);
    expect(json.itemListElement[0].item).toBe(
      `${BASE}/custom-kitchen-cabinets-brooklyn`,
    );
  });

  it("assigns sequential positions starting at 1", () => {
    const json = renderSchema([
      { name: "Home", url: "/" },
      { name: "Shop", url: "/shop" },
      { name: "Product", url: "/product/abc" },
    ]);
    expect(json.itemListElement.map((i: { position: number }) => i.position)).toEqual([
      1, 2, 3,
    ]);
  });

  it("includes name on every item and uses ListItem type", () => {
    const json = renderSchema([
      { name: "Home", url: "/" },
      { name: "Designer", url: "/designer" },
    ]);
    for (const entry of json.itemListElement) {
      expect(entry["@type"]).toBe("ListItem");
      expect(typeof entry.name).toBe("string");
      expect(entry.name.length).toBeGreaterThan(0);
    }
  });

  it("handles deep relative paths with query strings and hashes", () => {
    const json = renderSchema([
      { name: "Section", url: "/shop?cat=vanity#top" },
    ]);
    expect(json.itemListElement[0].item).toBe(`${BASE}/shop?cat=vanity#top`);
  });

  it("handles a mixed list of relative and absolute URLs", () => {
    const json = renderSchema([
      { name: "Home", url: "/" },
      { name: "Borough", url: "https://greencabinetsny.com/custom-kitchen-cabinets-queens" },
      { name: "Product", url: "/product/handle-123" },
    ]);
    expect(json.itemListElement[0].item).toBe(`${BASE}/`);
    expect(json.itemListElement[1].item).toBe(
      `${BASE}/custom-kitchen-cabinets-queens`,
    );
    expect(json.itemListElement[2].item).toBe(`${BASE}/product/handle-123`);
  });
});
