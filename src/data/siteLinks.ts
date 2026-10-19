/**
 * Shared internal-link lists for hub pages, Related blocks and the author
 * page. Every path here is an existing route (checked by the crawlability
 * script); nothing points at pages that have not been built.
 */
export interface SiteLink {
  to: string;
  label: string;
}

/** Long-form guides written by Golan (they carry his byline). */
export const GOLAN_GUIDES: SiteLink[] = [
  { to: "/custom-kitchen-cabinets-manhattan", label: "Custom kitchen cabinets in Manhattan" },
  { to: "/custom-kitchen-cabinets-queens", label: "Custom kitchen cabinets in Queens" },
  { to: "/kitchen-renovation-brooklyn", label: "Kitchen renovation in Brooklyn" },
  { to: "/kitchen-renovation-manhattan", label: "Kitchen renovation in Manhattan" },
  { to: "/luxury-kitchen-design-nyc", label: "Luxury kitchen design in NYC" },
  { to: "/best-wood-for-kitchen-cabinets", label: "Best wood for kitchen cabinets" },
  { to: "/white-oak-vs-walnut-cabinets", label: "White oak vs walnut cabinets" },
  { to: "/cabinet-wood-types-and-costs", label: "Cabinet wood types and costs" },
  { to: "/custom-vs-semi-custom-cabinets", label: "Custom vs semi-custom cabinets" },
  { to: "/floating-bathroom-vanity", label: "Floating bathroom vanities" },
  { to: "/double-sink-vanity-guide", label: "Double-sink vanity guide" },
];

/** Borough hubs and their neighborhood location pages. */
export const BOROUGH_HUBS: { hub: SiteLink; neighborhoods: SiteLink[] }[] = [
  {
    hub: { to: "/custom-kitchen-cabinets-brooklyn", label: "Brooklyn" },
    neighborhoods: [
      { to: "/custom-kitchen-cabinets-williamsburg", label: "Williamsburg" },
      { to: "/custom-kitchen-cabinets-park-slope", label: "Park Slope" },
      { to: "/custom-kitchen-cabinets-brooklyn-heights", label: "Brooklyn Heights" },
      { to: "/custom-kitchen-cabinets-dumbo", label: "DUMBO" },
      { to: "/custom-kitchen-cabinets-bushwick", label: "Bushwick" },
    ],
  },
  {
    hub: { to: "/custom-kitchen-cabinets-manhattan", label: "Manhattan" },
    neighborhoods: [
      { to: "/custom-kitchen-cabinets-upper-east-side", label: "Upper East Side" },
      { to: "/custom-kitchen-cabinets-soho", label: "SoHo" },
      { to: "/custom-kitchen-cabinets-tribeca", label: "Tribeca" },
    ],
  },
  {
    hub: { to: "/custom-kitchen-cabinets-queens", label: "Queens" },
    neighborhoods: [
      { to: "/custom-kitchen-cabinets-astoria", label: "Astoria" },
      { to: "/custom-kitchen-cabinets-long-island-city", label: "Long Island City" },
    ],
  },
  { hub: { to: "/kitchen-cabinets-staten-island", label: "Staten Island" }, neighborhoods: [] },
];

/** Planning tools and design guides worth linking from content pages. */
export const PLANNING_LINKS: SiteLink[] = [
  { to: "/room-designer", label: "3D room designer" },
  { to: "/luxury-kitchen-design-nyc", label: "Luxury kitchen design in NYC" },
  { to: "/white-oak-vs-walnut-cabinets", label: "White oak vs walnut cabinets" },
  { to: "/gallery", label: "Project gallery" },
];
