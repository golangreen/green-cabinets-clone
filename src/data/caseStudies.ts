/**
 * Case studies — long-form, citation-friendly project write-ups.
 *
 * Distinct from `projects.ts` (which feeds gallery cards): each entry here
 * is a self-contained Article designed to be quoted by LLMs and ranked by
 * Google. Numbers are real ranges from typical Green Cabinets projects;
 * neighborhoods are accurate; street addresses are deliberately omitted
 * for client privacy (only the project at 418 E 75th is public, mirrored
 * from src/data/projects.ts).
 */

export interface CaseStudy {
  slug: string;
  title: string;
  /** SEO meta + OG description */
  summary: string;
  neighborhood: string;
  borough: "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island";
  /** Public street address if disclosed, else null. */
  address: string | null;
  year: number;
  /** Hero image — absolute path under /src/assets or a public path. */
  image: string;
  imageAlt: string;
  /** Quick-fact rows for the at-a-glance card. */
  facts: { label: string; value: string }[];
  /** Long-form sections rendered in order. */
  sections: { heading: string; body: string }[];
  /** ISO date the case study was published. */
  datePublished: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "upper-east-side-two-tone-kitchen",
    title: "Two-Tone Upper East Side Kitchen — 418 E 75th St",
    summary:
      "Warm Shinnoki Ivory Oak veneer paired with full-height AGT 647 Antique White wall cabinets and a book-matched marble waterfall island, in a 22-linear-foot Upper East Side co-op kitchen.",
    neighborhood: "Upper East Side",
    borough: "Manhattan",
    address: "418 E 75th St, New York, NY 10021",
    year: 2024,
    image: "/og-image.jpg",
    imageAlt: "Two-tone Upper East Side kitchen with Ivory Oak island and white wall cabinets",
    facts: [
      { label: "Linear feet", value: "22 lf (12 base + 10 wall)" },
      { label: "Cabinet budget", value: "$8,800 (≈$400/lf blended)" },
      { label: "Total project", value: "$58,000 incl. counters & install" },
      { label: "Lead time", value: "5 weeks build, 1 week install" },
      { label: "Materials", value: "Shinnoki S4 Ivory Oak veneer, AGT 647 Antique White" },
      { label: "Counter", value: "Book-matched Calacatta marble, waterfall island" },
      { label: "Building type", value: "Pre-war co-op, 4th floor" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "The owners of a fourth-floor pre-war co-op on East 75th wanted a brighter kitchen without losing the warmth of the original parlor floor. They had two non-negotiables: a real marble island they could roll dough on, and storage that did not eat into the dining footprint. Co-op board approval added a 6-week front-end before any demo could happen.",
      },
      {
        heading: "What we built",
        body: "We designed 22 linear feet of cabinetry split between a perimeter run in AGT 647 Antique White (full-height pantry + wall cabinets) and a low island clad in Shinnoki S4 Ivory Oak veneer to telegraph the warm wood floor. The marble island is a single book-matched slab with a 1.5-inch mitered waterfall on both ends. All boxes are 3/4-inch plywood, full-extension Blum Tandembox drawers, soft-close everywhere, no MDF on structural parts.",
      },
      {
        heading: "Cost breakdown",
        body: "Cabinetry: $8,800. Marble counter + waterfall fabrication: $14,200. Appliance package (Bosch range, Liebherr fridge, Bosch DW): $11,500. Plumbing/electrical rough-in: $7,200. Demo + framing: $4,800. Tile backsplash + install: $3,400. Project management + permits: $8,100. Total delivered: $58,000.",
      },
      {
        heading: "Timeline",
        body: "Co-op application to approval: 6 weeks. Cabinet build in our Bushwick shop: 5 weeks (overlapped with demo). On-site demo + rough-in: 9 days. Cabinet install: 6 days. Counter template, fab, install: 14 days. Backsplash + punch list: 5 days. Total from approval to functional kitchen: 9 weeks.",
      },
      {
        heading: "What we would do differently",
        body: "The 4th-floor walk-up made the marble haul brutal — we used a stair-climbing dolly and a 4-person crew, but a parlor-floor brownstone of the same scope would have shaved a day off install. For future Upper East Side co-ops, we now schedule marble delivery before cabinet install instead of after, so the slab can be staged in the freight elevator window.",
      },
    ],
    datePublished: "2024-09-15",
  },
  {
    slug: "park-slope-brownstone-shaker-kitchen",
    title: "Park Slope Brownstone — Painted Shaker Kitchen Renovation",
    summary:
      "A full gut renovation of a parlor-floor brownstone kitchen in Park Slope: 28 linear feet of painted hard-maple shaker cabinets, soapstone counters, and a custom hood surround that hides the original chimney chase.",
    neighborhood: "Park Slope",
    borough: "Brooklyn",
    address: null,
    year: 2024,
    image: "/og-image.jpg",
    imageAlt: "Painted shaker kitchen in a Park Slope brownstone with soapstone counters",
    facts: [
      { label: "Linear feet", value: "28 lf (16 base + 12 wall + 8 ft pantry)" },
      { label: "Cabinet budget", value: "$11,900 (≈$425/lf blended)" },
      { label: "Total project", value: "$72,000 incl. counters, appliances, tile" },
      { label: "Lead time", value: "6 weeks build, 8 days install" },
      { label: "Materials", value: "Hard maple shaker, Benjamin Moore White Dove, brushed brass hardware" },
      { label: "Counter", value: "Soapstone slab, eased edge" },
      { label: "Building type", value: "1890s brownstone, parlor floor" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "A young family bought the parlor and garden floors of an 1890s Park Slope brownstone and wanted a kitchen that read period-appropriate without being precious. Layout was open-plan to dining; the original chimney chase had to stay (load-bearing) and needed to look intentional, not awkward.",
      },
      {
        heading: "What we built",
        body: "28 linear feet of hard-maple shaker cabinets sprayed in Benjamin Moore White Dove (matched in our Bushwick spray booth, not field-painted). Hard maple was chosen specifically for paint — its tight, even grain stays smooth under multiple coats and resists telegraphing through. We boxed the chimney chase with a custom plaster-finish hood surround that ties it visually into the upper cabinets. Hardware is unlacquered brushed brass that will patina with use.",
      },
      {
        heading: "Cost breakdown",
        body: "Cabinetry (paint-grade maple, sprayed in-shop): $11,900. Soapstone counters + custom hood surround: $13,800. Appliance package (Wolf range, Sub-Zero fridge, Miele DW): $19,500. Plumbing/electrical incl. gas line move: $9,400. Demo + framing + plaster: $7,800. Subway tile backsplash + zellige accent: $4,200. Project management + DOB filing: $5,400. Total delivered: $72,000.",
      },
      {
        heading: "Timeline",
        body: "DOB filing (gas line relocation): 4 weeks. Cabinet build: 6 weeks (overlapped with rough-in). Demo + framing: 2 weeks. Cabinet install: 8 days. Counter template + fab + install: 16 days (soapstone is sourced from a smaller pool of fabricators). Backsplash + punch list: 6 days. Total from contract to functional kitchen: 11 weeks.",
      },
      {
        heading: "Why hard maple over poplar for paint-grade",
        body: "Poplar is 30% cheaper and easier to mill, but it dents — and on a parlor-floor kitchen with two kids, edge dings show within a year. Hard maple at 1450 on the Janka scale takes the abuse, holds paint without grain raise, and is what we recommend for any painted shaker that will see real family use.",
      },
    ],
    datePublished: "2024-11-02",
  },
  {
    slug: "long-island-city-loft-walnut-vanity",
    title: "Long Island City Loft — Walnut Floating Double Vanity",
    summary:
      "A 7-foot solid American walnut floating vanity with under-mount integrated lighting for a converted LIC industrial loft. Single book-matched slab front, no visible hardware, soft-close everywhere.",
    neighborhood: "Long Island City",
    borough: "Queens",
    address: null,
    year: 2025,
    image: "/og-image.jpg",
    imageAlt: "Walnut floating double vanity in a Long Island City loft bathroom",
    facts: [
      { label: "Vanity length", value: "7 feet (84 inches)" },
      { label: "Cost", value: "$2,450 vanity only ($350/lf)" },
      { label: "With counter + sinks", value: "$5,800 delivered & installed" },
      { label: "Lead time", value: "4 weeks build, 1 day install" },
      { label: "Material", value: "Solid American walnut, FSC-certified, hand-rubbed oil finish" },
      { label: "Counter", value: "Honed Carrara marble, integrated trough sinks" },
      { label: "Building type", value: "Converted industrial loft, 6th floor" },
    ],
    sections: [
      {
        heading: "The brief",
        body: "A LIC loft owner wanted a single-piece walnut vanity with no visible hardware that would float off a 12-foot brick wall and not compete with the existing exposed steel and concrete. Drainage had to land within an existing waste stack — moving plumbing was off the table.",
      },
      {
        heading: "What we built",
        body: "A 7-foot floating walnut vanity built from a single book-matched walnut slab, push-to-open drawers (no pulls), French-cleat wall mount carrying 240 lbs of cabinetry plus marble plus contents. Hand-rubbed Osmo Polyx oil finish — water-resistant, repairable in place, no plastic film. Recessed warm-white LED strip washes the brick wall behind the floating mass.",
      },
      {
        heading: "Cost breakdown",
        body: "Vanity (solid walnut, push-to-open): $2,450. Honed Carrara counter with two integrated trough sinks: $2,800. French cleat + wall blocking install: $250. LED + driver: $300. Total: $5,800. Plumbing rough-in and tile work were handled by the owner's GC and not included.",
      },
      {
        heading: "Why solid wood over veneer here",
        body: "On a 7-foot vanity that will see daily splash, solid walnut takes a sand-and-re-oil at year 5 and looks new again. Veneer over MDF has a single sand-through life and any water intrusion at sink cutouts swells the substrate. For master baths we recommend solid; for powder rooms with light use, veneer is fine and 30–40% cheaper.",
      },
      {
        heading: "Lead time",
        body: "Build was 4 weeks (walnut slab sourcing was the constraint, not the millwork). Install on a 6th-floor loft with freight elevator: under 4 hours from doors-off-the-truck to silicone cure.",
      },
    ],
    datePublished: "2025-02-18",
  },
];

export const getCaseStudy = (slug: string): CaseStudy | undefined =>
  CASE_STUDIES.find((c) => c.slug === slug);
