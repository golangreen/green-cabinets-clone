/**
 * Curated wood-species comparison map for internal linking / topical authority.
 * Each entry links the current species to a specific comparison page with a
 * short, keyword-rich blurb (used for anchor text + supporting copy).
 *
 * Keep blurbs <= ~140 chars so cards render cleanly.
 */
import { getWoodSpecies } from "./woodSpecies";

export interface WoodComparison {
  /** Target species slug to link to. */
  slug: string;
  /** Card title — phrased as a comparison ("Rift-Cut vs Plain-Sawn White Oak"). */
  title: string;
  /** 1–2 sentence summary used as anchor support text. */
  blurb: string;
}

/**
 * Map of source slug → curated comparison destinations.
 * Bidirectional links are intentional — every pair appears on both sides.
 */
export const WOOD_COMPARISONS: Record<string, WoodComparison[]> = {
  "white-oak": [
    {
      slug: "rift-cut-white-oak",
      title: "Plain-Sawn vs Rift-Cut White Oak",
      blurb: "Cathedral grain vs ultra-linear straight grain — see when the 30% premium for rift-cut is worth it.",
    },
    {
      slug: "quartersawn-oak",
      title: "Plain-Sawn vs Quartersawn Oak",
      blurb: "Standard yield and cost vs the dramatic ray-fleck of quartersawn — Mission, Stickley, and feature islands.",
    },
    {
      slug: "red-oak",
      title: "White Oak vs Red Oak",
      blurb: "Closed-grain neutral white oak vs warm pink red oak — durability, moisture, and modern vs traditional.",
    },
    {
      slug: "walnut",
      title: "White Oak vs Walnut",
      blurb: "Light, modern, neutral vs dark, dramatic, premium — the two most-specified statement woods in NYC.",
    },
    {
      slug: "maple",
      title: "White Oak vs Maple",
      blurb: "Open-grain natural warmth vs closed-grain paint-friendly smoothness — picking the right base for your design.",
    },
    {
      slug: "hickory",
      title: "White Oak vs Hickory",
      blurb: "Designer favorite vs America's hardest cabinet wood — when durability outranks design language.",
    },
  ],
  "rift-cut-white-oak": [
    {
      slug: "white-oak",
      title: "Rift-Cut vs Plain-Sawn White Oak",
      blurb: "Why slab and minimalist shaker doors call for rift-cut, and where plain-sawn still wins on cost.",
    },
    {
      slug: "quartersawn-oak",
      title: "Rift-Cut vs Quartersawn Oak",
      blurb: "Both are vertical-grain premium cuts — rift hides the ray fleck, quartersawn celebrates it.",
    },
  ],
  "quartersawn-oak": [
    {
      slug: "rift-cut-white-oak",
      title: "Quartersawn vs Rift-Cut Oak",
      blurb: "Ray-fleck Mission/Stickley character vs ultra-clean linear grain at a similar price tier.",
    },
    {
      slug: "white-oak",
      title: "Quartersawn vs Plain-Sawn White Oak",
      blurb: "When the ~2× cost of quartersawn earns its place — feature islands, libraries, heirloom builds.",
    },
    {
      slug: "red-oak",
      title: "Quartersawn White vs Red Oak",
      blurb: "Both quarter beautifully, but tone, hardness, and moisture resistance set them apart.",
    },
  ],
  "red-oak": [
    {
      slug: "white-oak",
      title: "Red Oak vs White Oak",
      blurb: "Pink, open-grain warmth vs neutral, closed-grain modernism — and why white oak resists moisture better.",
    },
    {
      slug: "quartersawn-oak",
      title: "Red Oak vs Quartersawn Oak",
      blurb: "Affordable cathedral grain vs premium ray-fleck — same family, very different look and price.",
    },
    {
      slug: "walnut",
      title: "Red Oak vs Walnut",
      blurb: "Affordable warm-pink classic vs premium chocolate hardwood — wildly different price tiers, both stain-grade icons.",
    },
    {
      slug: "maple",
      title: "Red Oak vs Maple",
      blurb: "Open cathedral grain vs tight closed grain — and why painted oak almost never works while painted maple always does.",
    },
    {
      slug: "hickory",
      title: "Red Oak vs Hickory",
      blurb: "Janka 1290 vs 1820 — when you need maximum dent resistance and don't mind the wilder color variation.",
    },
  ],
  walnut: [
    {
      slug: "cherry",
      title: "Walnut vs Cherry",
      blurb: "Chocolate walnut that lightens slightly vs blonde cherry that darkens dramatically — both age beautifully.",
    },
    {
      slug: "maple",
      title: "Walnut vs Maple",
      blurb: "Rich dark grain vs creamy paint-grade smoothness — when to splurge on walnut vs paint maple.",
    },
  ],
  cherry: [
    {
      slug: "walnut",
      title: "Cherry vs Walnut",
      blurb: "Cherry darkens with light; walnut starts dark and softens. Two classic stain-grade hardwoods compared.",
    },
    {
      slug: "maple",
      title: "Cherry vs Maple",
      blurb: "Warm reddish patina vs cool, uniform paint-grade — and why cherry is harder to color-match.",
    },
  ],
  maple: [
    {
      slug: "walnut",
      title: "Maple vs Walnut",
      blurb: "The #1 paint-grade species vs the premium stain-grade benchmark — cost, look, and durability.",
    },
    {
      slug: "cherry",
      title: "Maple vs Cherry",
      blurb: "Uniform and paintable vs warm and color-shifting — choosing between the two NYC favorites.",
    },
    {
      slug: "birch",
      title: "Maple vs Birch",
      blurb: "Birch is the budget alternative to maple — almost identical paint-grade look at a lower board-foot cost.",
    },
  ],
  hickory: [
    {
      slug: "rustic-hickory",
      title: "Clean Hickory vs Rustic Hickory",
      blurb: "Calmer character-grade vs full knots-and-mineral-streak rustic — same Janka 1820, very different vibe.",
    },
    {
      slug: "white-oak",
      title: "Hickory vs White Oak",
      blurb: "America's hardest cabinet hardwood vs the modern designer favorite — durability vs design language.",
    },
  ],
  "rustic-hickory": [
    {
      slug: "hickory",
      title: "Rustic vs Clean Hickory",
      blurb: "When the knots, mineral streaks, and color variation become the design — and when to step back to clean grade.",
    },
  ],
  birch: [
    {
      slug: "maple",
      title: "Birch vs Maple",
      blurb: "Birch saves 15–25% on the same paint-grade look — see where maple still pulls ahead on durability.",
    },
  ],
};

/**
 * Helper — returns curated comparisons for a slug, filtered to species that
 * actually exist in WOOD_SPECIES (defensive against typos).
 */
export function getComparisonsFor(slug: string): WoodComparison[] {
  const list = WOOD_COMPARISONS[slug] ?? [];
  return list.filter((c) => !!getWoodSpecies(c.slug));
}
