import { describe, it, expect } from "vitest";

describe("route module exports", () => {
  it("Neighborhood is the default export at @/pages/locations/Neighborhood", async () => {
    const mod = await import("@/pages/locations/Neighborhood");
    expect(mod.default).toBeTypeOf("function");
    expect(mod.default.name).toBe("Neighborhood");
  });

  it("NotFound is the default export at @/pages/system/NotFound", async () => {
    const mod = await import("@/pages/system/NotFound");
    expect(mod.default).toBeTypeOf("function");
    expect(mod.default.name).toBe("NotFound");
  });

  it("Borough imports both successfully", async () => {
    const mod = await import("@/pages/locations/Borough");
    expect(mod.default).toBeTypeOf("function");
  });
});
