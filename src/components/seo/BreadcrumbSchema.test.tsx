import { describe, it, expect } from "vitest";
import { buildBreadcrumbSchema, BASE_URL } from "./BreadcrumbSchema";

describe("buildBreadcrumbSchema", () => {
  it("emits valid BreadcrumbList @context and @type", () => {
    const json = buildBreadcrumbSchema([{ name: "Home", url: "/" }]);
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("BreadcrumbList");
  });

  it("converts a relative path to an absolute URL", () => {
    const json = buildBreadcrumbSchema([{ name: "Shop", url: "/shop" }]);
    expect(json.itemListElement[0].item).toBe(`${BASE_URL}/shop`);
  });

  it("preserves http absolute URLs", () => {
    const json = buildBreadcrumbSchema([
      { name: "Ext", url: "http://example.com/foo" },
    ]);
    expect(json.itemListElement[0].item).toBe("http://example.com/foo");
  });

  it("preserves https absolute URLs", () => {
    const json = buildBreadcrumbSchema([
      { name: "Ext", url: "https://other.com/bar" },
    ]);
    expect(json.itemListElement[0].item).toBe("https://other.com/bar");
  });

  it("treats uppercase HTTPS as absolute", () => {
    const json = buildBreadcrumbSchema([
      { name: "Ext", url: "HTTPS://other.com/bar" },
    ]);
    expect(json.itemListElement[0].item).toBe("HTTPS://other.com/bar");
  });

  it("preserves the project base URL when passed absolutely", () => {
    const json = buildBreadcrumbSchema([
      { name: "Brooklyn", url: `${BASE_URL}/custom-kitchen-cabinets-brooklyn` },
    ]);
    expect(json.itemListElement[0].item).toBe(
      `${BASE_URL}/custom-kitchen-cabinets-brooklyn`,
    );
  });

  it("handles relative paths with query strings and hashes", () => {
    const json = buildBreadcrumbSchema([
      { name: "Section", url: "/shop?cat=vanity#top" },
    ]);
    expect(json.itemListElement[0].item).toBe(`${BASE_URL}/shop?cat=vanity#top`);
  });

  it("assigns sequential positions starting at 1", () => {
    const json = buildBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Shop", url: "/shop" },
      { name: "Product", url: "/product/abc" },
    ]);
    expect(json.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
  });

  it("uses ListItem type and includes a name on every item", () => {
    const json = buildBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Designer", url: "/designer" },
    ]);
    for (const entry of json.itemListElement) {
      expect(entry["@type"]).toBe("ListItem");
      expect(entry.name.length).toBeGreaterThan(0);
    }
  });

  it("handles a mixed list of relative and absolute URLs", () => {
    const json = buildBreadcrumbSchema([
      { name: "Home", url: "/" },
      {
        name: "Borough",
        url: "https://greencabinetsny.com/custom-kitchen-cabinets-queens",
      },
      { name: "Product", url: "/product/handle-123" },
    ]);
    expect(json.itemListElement.map((i) => i.item)).toEqual([
      `${BASE_URL}/`,
      `${BASE_URL}/custom-kitchen-cabinets-queens`,
      `${BASE_URL}/product/handle-123`,
    ]);
  });

  it("treats protocol-relative URLs as absolute via URL resolution", () => {
    const json = buildBreadcrumbSchema([
      { name: "Weird", url: "//example.com/x" },
    ]);
    expect(json.itemListElement[0].item).toBe("https://example.com/x");
  });

  it("resolves './shop' against the base", () => {
    const json = buildBreadcrumbSchema([{ name: "Shop", url: "./shop" }]);
    expect(json.itemListElement[0].item).toBe(`${BASE_URL}/shop`);
  });

  it("resolves './shop/handle' against the base", () => {
    const json = buildBreadcrumbSchema([
      { name: "Handle", url: "./shop/handle" },
    ]);
    expect(json.itemListElement[0].item).toBe(`${BASE_URL}/shop/handle`);
  });

  it("resolves '../shop' against the base (clamped to root)", () => {
    const json = buildBreadcrumbSchema([{ name: "Shop", url: "../shop" }]);
    expect(json.itemListElement[0].item).toBe(`${BASE_URL}/shop`);
  });

  it("resolves '../../shop' against the base (clamped to root)", () => {
    const json = buildBreadcrumbSchema([{ name: "Shop", url: "../../shop" }]);
    expect(json.itemListElement[0].item).toBe(`${BASE_URL}/shop`);
  });

  it("resolves a bare relative segment 'shop' against the base", () => {
    const json = buildBreadcrumbSchema([{ name: "Shop", url: "shop" }]);
    expect(json.itemListElement[0].item).toBe(`${BASE_URL}/shop`);
  });

  it("preserves query and hash when resolving './shop'", () => {
    const json = buildBreadcrumbSchema([
      { name: "Shop", url: "./shop?cat=vanity#top" },
    ]);
    expect(json.itemListElement[0].item).toBe(
      `${BASE_URL}/shop?cat=vanity#top`,
    );
  });
});
