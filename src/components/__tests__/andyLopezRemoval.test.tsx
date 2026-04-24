/**
 * Regression guard: ensure removed Andy Lopez contact info never reappears
 * in the Footer or Contact components, and that the contact dropdown
 * exposes no "Text Andy" / "Email Andy" options.
 */
import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "@/test/utils";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

// Quote form pulls in Supabase + react-hook-form; stub it for isolation.
vi.mock("@/components/QuoteForm", () => ({
  default: () => null,
}));

const FORBIDDEN_PATTERNS = [
  /andy\s+lopez/i,
  /text\s+andy/i,
  /email\s+andy/i,
  // Base64 + plaintext variants of Andy's old phone.
  /OTE3NjkzMzc2Nw==/,
  /9176933767/,
  /917-?693-?3767/,
];

function expectClean(html: string, label: string) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    expect(
      pattern.test(html),
      `${label} contains forbidden pattern ${pattern}`,
    ).toBe(false);
  }
}

describe("Andy Lopez removal regression guard", () => {
  it("Footer renders without any Andy references", () => {
    const { container } = renderWithProviders(<Footer />);
    expectClean(container.innerHTML, "Footer");
  });

  it("Contact renders without any Andy references", () => {
    const { container } = renderWithProviders(<Contact />);
    expectClean(container.innerHTML, "Contact");
  });

  it("Contact dropdown trigger excludes Andy options", () => {
    const { container } = renderWithProviders(<Contact />);
    // Option items only mount when opened, but the trigger label and any
    // pre-rendered hidden <select> values must never include Andy.
    const html = container.innerHTML;
    expect(/text\s+andy/i.test(html)).toBe(false);
    expect(/email\s+andy/i.test(html)).toBe(false);
  });
});
