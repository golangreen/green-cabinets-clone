import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import Borough from "@/pages/locations/Borough";
import { createTestQueryClient } from "@/test/utils";

vi.mock("@/services/neighborhoodGalleryService", () => ({
  neighborhoodGalleryService: {
    listPublishedBySlug: () => Promise.resolve([]),
  },
}));

const Wrapper = ({
  children,
  initialEntries = ["/"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => (
  <HelmetProvider>
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

describe("Neighborhood navigation integration", () => {
  it("clicks a neighborhood link from a borough page and renders correct breadcrumbs", async () => {
    const user = userEvent.setup();

    render(
      <Routes>
        <Route path=":boroughPath" element={<Borough />} />
      </Routes>,
      {
      wrapper: ({ children }) => (
        <Wrapper initialEntries={["/custom-kitchen-cabinets-brooklyn"]}>
          {children}
        </Wrapper>
      ),
    });

    // Verify we're on the Brooklyn borough page
    expect(
      screen.getByText("Brooklyn", { selector: '[aria-current="page"]' }),
    ).toBeInTheDocument();

    // Click Williamsburg neighborhood button to open the dialog
    await user.click(screen.getByRole("button", { name: "Williamsburg" }));

    // Dialog opens with a link to the dedicated neighborhood page
    const neighborhoodLink = screen.getByRole("link", {
      name: /read more about cabinetry in williamsburg/i,
    });
    expect(neighborhoodLink).toBeInTheDocument();

    // Click the neighborhood link to navigate
    await user.click(neighborhoodLink);

    // Assert breadcrumb renders correctly on the neighborhood page
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Neighborhoods" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Brooklyn" })).toBeInTheDocument();
    expect(
      screen.getByText("Williamsburg", {
        selector: '[aria-current="page"]',
      }),
    ).toBeInTheDocument();
  });
});
