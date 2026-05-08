import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WoodCompare from "../WoodCompare";
import { WOOD_SPECIES } from "@/data/woodSpecies";

const renderCompare = () =>
  render(
    <MemoryRouter>
      <WoodCompare />
    </MemoryRouter>
  );

// "Read full guide" links only render inside the side-by-side comparison cards,
// not in the checkbox selector — so counting them = counting active cards.
const getCardCount = () =>
  screen.getAllByRole("link", { name: /read full guide/i }).length;

const hasComparedSpecies = (name: string) =>
  screen.queryAllByRole("heading", { name }).length > 0;

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
    expect(getCardCount()).toBe(3);

    fireEvent.click(screen.getByLabelText("Cherry"));

    expect(getCardCount()).toBe(4);
    expect(hasComparedSpecies("Cherry")).toBe(true);
  });

  it("disables additional checkboxes once 4 species are selected (max cap)", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Cherry"));

    expect(getCardCount()).toBe(4);
    expect(screen.getByLabelText("Birch")).toBeDisabled();
    expect(screen.getByText(/maximum 4 species can be compared/i)).toBeInTheDocument();
  });

  it("removes a species via its X button and re-enables capped checkboxes", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Cherry")); // 4 selected, capped

    fireEvent.click(screen.getByRole("button", { name: /remove maple from comparison/i }));

    expect(getCardCount()).toBe(3);
    expect(hasComparedSpecies("Maple")).toBe(false);
    expect(screen.getByLabelText("Birch")).not.toBeDisabled();
  });

  it("toggles a species off via its checkbox", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Maple"));

    expect(getCardCount()).toBe(2);
    expect(hasComparedSpecies("Maple")).toBe(false);
  });

  it("never drops below 1 selected species", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Maple"));
    fireEvent.click(screen.getByLabelText("White Oak"));
    expect(getCardCount()).toBe(1);

    // The last remaining card has no remove (X) button and its checkbox no-ops.
    fireEvent.click(screen.getByLabelText("American Walnut"));
    expect(getCardCount()).toBe(1);
    expect(hasComparedSpecies("American Walnut")).toBe(true);
  });

  it("exposes a checkbox for every species in the registry", () => {
    renderCompare();
    for (const w of WOOD_SPECIES) {
      expect(screen.getByLabelText(w.name)).toBeInTheDocument();
    }
  });
});
