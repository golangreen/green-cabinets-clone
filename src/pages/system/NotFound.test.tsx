import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "./NotFound";
import { MemoryRouter } from "react-router-dom";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </HelmetProvider>
);

describe("NotFound", () => {
  it("emits noindex,nofollow meta tag", async () => {
    render(<NotFound />, { wrapper: Wrapper });

    const meta = await waitFor(() => {
      const el = document.querySelector('meta[name="robots"]');
      expect(el).toBeInTheDocument();
      return el;
    });
    expect(meta).toHaveAttribute("content", "noindex, nofollow");
  });
});
