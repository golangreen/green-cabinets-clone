import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "custom-kitchen-cabinets-brooklyn-heights",
  title: "Custom Kitchen Cabinets for Brooklyn Heights",
  meta_description:
    "Custom kitchen cabinets for Brooklyn Heights — brownstones, co-ops, and condos by appointment. (718) 804-5488.",
  created_at: "2026-09-28T15:30:00-04:00",
  updated_at: "2026-09-28T15:30:00-04:00",
  tags: [
    "brooklyn heights kitchen cabinets",
    "brownstone kitchen cabinets",
    "brooklyn co-op kitchen",
    "custom kitchen cabinets",
    "custom millwork",
    "by appointment",
  ],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/custom-kitchen-cabinets-brooklyn-heights",
};

/** Body is appended section by section from the client's pasted article. */
const BODY: string[] = [
  `# Custom Kitchen Cabinets for Brooklyn Heights

Brooklyn Heights kitchens sit inside one of the borough's oldest residential grids — and none of them share one floor plan. A brownstone near the Promenade or Cadman Plaza often has a garden-floor wet wall, a narrow galley, and plaster that bows off square after a century of settlement. A pre-war co-op on Pierrepont or Montague fights a board that wants COI, a freight reservation, and work-hour windows before the first panel rolls in. A newer condo near Brooklyn Bridge Park or a Pierhouse-type building has cleaner slabs — and developer boxes that leave a dead bay under the soffit. Stock packs leave fillers, a crooked fridge line, and uppers that never meet the wall you own.

Green Cabinets NY designs and installs custom kitchen cabinets for Brooklyn Heights by appointment. We are home-based in Bushwick — not a walk-in shop. Measure and sample visits happen in your kitchen. Start with the [Brooklyn kitchen cabinets](https://greencabinetsny.com/custom-kitchen-cabinets-brooklyn) map. Nearby Brooklyn depth: [Park Slope brownstones](https://greencabinetsny.com/blog/custom-kitchen-cabinets-park-slope-brownstones), [Cobble Hill and Carroll Gardens](https://greencabinetsny.com/blog/custom-kitchen-cabinets-cobble-hill-carroll-gardens), [Boerum Hill](https://greencabinetsny.com/blog/custom-kitchen-cabinets-boerum-hill-brooklyn), [Fort Greene](https://greencabinetsny.com/blog/custom-kitchen-cabinets-fort-greene-brooklyn), and [Prospect Heights](https://greencabinetsny.com/blog/custom-kitchen-cabinets-prospect-heights-brooklyn).`,
  `## Brownstones, pre-war co-ops, and Bridge Park condos`,
];

export const brooklynHeightsPost: BlogArticle = {
  id: "static-custom-kitchen-cabinets-brooklyn-heights",
  external_id: null,
  slug: META.slug,
  title: META.title,
  meta_title: META.title,
  meta_description: META.meta_description,
  excerpt: META.meta_description,
  image_url: null,
  content_html: BODY.join("\n"),
  content_image_urls: META.content_image_urls,
  tags: META.tags,
  created_at: META.created_at,
  updated_at: META.updated_at,
  canonical_url: META.canonical_url,
};
