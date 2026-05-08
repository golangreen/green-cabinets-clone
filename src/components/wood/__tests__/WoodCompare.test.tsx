import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WoodCompare from "../WoodCompare";
import { WOOD_SPECIES } from "@/data/woodSpecies";

const renderCompare = () =>
  render(
    <MemoryRouter>
      <WoodCompare />
    </MemoryRouter>
  );

// A "comparison card" is a panel with a "Read full guide" link inside it.
// We count cards by counting those links and find each by its species heading.
const getCardCount = () =>
  screen.getAllByRole("link", { name: /read full guide/i }).length;

const hasComparedSpecies = (name: string) =>
  screen.getAllByRole("heading", { name }).length > 0;

describe("WoodCompare", () => {
  it("renders the default 3 species side-by-side on mount", () => {
    renderCompare();
    expect(getCardCount()).toBe(3);
    expect(hasComparedSpecies("Maple")).toBe(true);
    expect(hasComparedSpecies("White Oak")).toBe(true);
    expect(hasComparedSpecies("American Walnut")).toBe(true);
  });

  it("adds a 4th species to the comparison when its checkbox is selected", () => {
    renderCompare();
    expect(getComparisonCards()).toHaveLength(3);

    fireEvent.click(screen.getByLabelText("Cherry"));

    const cards = getComparisonCards();
    expect(cards).toHaveLength(4);
    expect(within(cards[3]).getByRole("heading", { name: "Cherry" })).toBeInTheDocument();
  });

  it("disables additional checkboxes once 4 species are selected (max cap)", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Cherry")); // 4 selected

    expect(getComparisonCards()).toHaveLength(4);
    expect(screen.getByLabelText("Birch")).toBeDisabled();
    expect(screen.getByText(/maximum 4 species can be compared/i)).toBeInTheDocument();
  });

  it("removes a species via its X button and re-enables capped checkboxes", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Cherry")); // 4 selected, capped

    fireEvent.click(screen.getByRole("button", { name: /remove maple from comparison/i }));

    const cards = getComparisonCards();
    expect(cards).toHaveLength(3);
    expect(screen.queryByRole("heading", { name: "Maple" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Birch")).not.toBeDisabled();
  });

  it("toggles a species off via its checkbox", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Maple")); // uncheck Maple

    const cards = getComparisonCards();
    expect(cards).toHaveLength(2);
    expect(screen.queryByRole("heading", { name: "Maple" })).not.toBeInTheDocument();
  });

  it("never drops below 1 selected species", () => {
    renderCompare();
    // Remove Maple, White Oak, Walnut → only 1 remains
    fireEvent.click(screen.getByLabelText("Maple"));
    fireEvent.click(screen.getByLabelText("White Oak"));
    expect(getComparisonCards()).toHaveLength(1);

    // Try to uncheck the last one — should stay at 1
    fireEvent.click(screen.getByLabelText("American Walnut"));
    expect(getComparisonCards()).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "American Walnut" })).toBeInTheDocument();
  });

  it("exposes a checkbox for every species in the registry", () => {
    renderCompare();
    for (const w of WOOD_SPECIES) {
      expect(screen.getByLabelText(w.name)).toBeInTheDocument();
    }
  });
});
