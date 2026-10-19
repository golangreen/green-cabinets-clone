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
  it("leaves real pages alone", () => {
    expect(r("https://greencabinetsny.com/about")).toBeNull();
    expect(r("https://greencabinetsny.com/blog/home-office-built-ins-nyc")).toBeNull();
    expect(r("https://greencabinetsny.com/assets/index.js")).toBeNull();
  });
});
