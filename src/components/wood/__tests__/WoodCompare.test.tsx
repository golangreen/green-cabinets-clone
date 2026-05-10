import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WoodCompare from "../WoodCompare";
import { WOOD_SPECIES } from "@/data/woodSpecies";

const renderCompare = () =>
  render(
    <MemoryRouter>
      <WoodCompare />
    </MemoryRouter>,
  );

// "Read full guide" links only render inside selected comparison cards.
const getCardCount = () =>
  screen.queryAllByRole("link", { name: /read full guide/i }).length;

const hasComparedSpecies = (name: string) =>
  screen.queryAllByRole("heading", { name }).length > 0;

describe("WoodCompare", () => {
  it("starts empty with a placeholder prompt", () => {
    renderCompare();
    expect(getCardCount()).toBe(0);
    expect(screen.getByText(/check a species above to start comparing/i)).toBeInTheDocument();
  });

  it("exposes a checkbox for every species in the registry", () => {
    renderCompare();
    for (const w of WOOD_SPECIES) {
      expect(screen.getByLabelText(w.name)).toBeInTheDocument();
    }
  });

  it("adds a species to the comparison when its checkbox is selected", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Maple"));
    expect(getCardCount()).toBe(1);
    expect(hasComparedSpecies("Maple")).toBe(true);
  });

  it("toggles a species off via its checkbox", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Maple"));
    fireEvent.click(screen.getByLabelText("White Oak"));
    expect(getCardCount()).toBe(2);

    fireEvent.click(screen.getByLabelText("Maple"));
    expect(getCardCount()).toBe(1);
    expect(hasComparedSpecies("Maple")).toBe(false);
  });

  it("caps selection at 4 species and disables remaining checkboxes", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Maple"));
    fireEvent.click(screen.getByLabelText("White Oak"));
    fireEvent.click(screen.getByLabelText("American Walnut"));
    fireEvent.click(screen.getByLabelText("Cherry"));

    expect(getCardCount()).toBe(4);
    expect(screen.getByLabelText("Birch")).toBeDisabled();
    expect(
      screen.getByText(/maximum 4 species can be compared/i),
    ).toBeInTheDocument();
  });

  it("removes a species via its X button and re-enables capped checkboxes", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Maple"));
    fireEvent.click(screen.getByLabelText("White Oak"));
    fireEvent.click(screen.getByLabelText("American Walnut"));
    fireEvent.click(screen.getByLabelText("Cherry"));
    expect(screen.getByLabelText("Birch")).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: /remove maple from comparison/i }),
    );

    expect(getCardCount()).toBe(3);
    expect(hasComparedSpecies("Maple")).toBe(false);
    expect(screen.getByLabelText("Birch")).not.toBeDisabled();
  });

  it("hides the X button when only one species is selected", () => {
    renderCompare();
    fireEvent.click(screen.getByLabelText("Maple"));
    expect(
      screen.queryByRole("button", { name: /remove maple from comparison/i }),
    ).not.toBeInTheDocument();
  });
});
