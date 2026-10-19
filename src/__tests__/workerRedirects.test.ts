import { describe, expect, it } from "vitest";
import { redirectFor } from "../../worker/index";

const r = (u: string) => redirectFor(new URL(u));

describe("worker redirectFor", () => {
  it("301s www to the apex and keeps path + query", () => {
    expect(r("https://www.greencabinetsny.com/blog/x?utm=1")).toBe("https://greencabinetsny.com/blog/x?utm=1");
    expect(r("https://www.greencabinetsny.com/")).toBe("https://greencabinetsny.com/");
  });
  it("redirects legacy paths", () => {
    expect(r("https://greencabinetsny.com/shop")).toBe("https://greencabinetsny.com/");
    expect(r("https://greencabinetsny.com/product/foo-bar")).toBe("https://greencabinetsny.com/");
    expect(r("https://greencabinetsny.com/vanity-designer")).toBe("https://greencabinetsny.com/designer");
    expect(r("https://greencabinetsny.com/neighborhoods/williamsburg")).toBe(
      "https://greencabinetsny.com/custom-kitchen-cabinets-williamsburg",
    );
  });
  it("301s merged near-duplicate posts to the kept post", () => {
    const pairs: [string, string][] = [
      ["custom-kitchen-cabinets-williamsburg-brooklyn", "custom-kitchen-cabinets-greenpoint-brooklyn"],
      ["custom-kitchen-cabinets-brooklyn-heights", "custom-kitchen-cabinets-clinton-hill-brooklyn"],
      ["custom-kitchen-cabinets-sunnyside-queens", "custom-kitchen-cabinets-jackson-heights-queens"],
      ["custom-kitchen-cabinets-boerum-hill-brooklyn", "custom-kitchen-cabinets-cobble-hill-carroll-gardens"],
    ];
    for (const [from, to] of pairs) {
      expect(r(`https://greencabinetsny.com/blog/${from}`)).toBe(`https://greencabinetsny.com/blog/${to}`);
    }
    // The Brooklyn Heights *location* page is a different URL and stays.
    expect(r("https://greencabinetsny.com/custom-kitchen-cabinets-brooklyn-heights")).toBeNull();
  });
  it("sends never-built pages to the closest existing one", () => {
    expect(r("https://greencabinetsny.com/bathroom-vanities")).toBe("https://greencabinetsny.com/blog/custom-bathroom-vanity-nyc");
    expect(r("https://greencabinetsny.com/custom-kitchen-cabinets-upper-west-side")).toBe("https://greencabinetsny.com/custom-kitchen-cabinets-manhattan");
    expect(r("https://greencabinetsny.com/custom-kitchen-cabinets-chelsea")).toBe("https://greencabinetsny.com/custom-kitchen-cabinets-manhattan");
  });
  it("leaves real pages alone", () => {
    expect(r("https://greencabinetsny.com/blog/page/2")).toBeNull();
    expect(r("https://greencabinetsny.com/about/golan-achdary")).toBeNull();
    expect(r("https://greencabinetsny.com/about")).toBeNull();
    expect(r("https://greencabinetsny.com/blog/home-office-built-ins-nyc")).toBeNull();
    expect(r("https://greencabinetsny.com/assets/index.js")).toBeNull();
  });
});
