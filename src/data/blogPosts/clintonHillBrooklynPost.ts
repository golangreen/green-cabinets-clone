import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "custom-kitchen-cabinets-clinton-hill-brooklyn",
  title: "Custom Kitchen Cabinets for Clinton Hill Brooklyn",
  meta_description:
    "Custom kitchen cabinets for Clinton Hill Brooklyn — brownstones, co-ops, and condos by appointment. (718) 804-5488.",
  created_at: "2026-09-29T09:30:00-04:00",
  updated_at: "2026-09-29T09:30:00-04:00",
  tags: [
    "clinton hill kitchen cabinets",
    "brownstone kitchen cabinets",
    "brooklyn co-op kitchen",
    "custom kitchen cabinets",
    "custom millwork",
    "by appointment",
  ],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/custom-kitchen-cabinets-clinton-hill-brooklyn",
};

// Article body is appended below as HTML strings, in order.
const BODY = [
  `<p>Clinton Hill kitchens sit between Fort Greene and Bed-Stuy on blocks that never settled into one housing type. A brownstone near Vanderbilt, Clinton, or Washington Avenue often has a garden-floor wet wall, a parlor galley that runs long toward the rear, and plaster that bows off square after a century of settlement. A Pratt-adjacent co-op or walk-up fights a board that wants COI, a freight reservation, and work-hour windows before the first panel rolls in. A newer condo on Myrtle or Classon has cleaner slabs — and developer boxes that leave a dead bay under the soffit. Stock packs leave fillers, a crooked fridge line, and uppers that never meet the wall you own.</p>`,
  `<p>Green Cabinets NY designs and installs custom kitchen cabinets for Clinton Hill by appointment. We are home-based in Bushwick — not a walk-in shop. Measure and sample visits happen in your kitchen. Start with the <a href="https://greencabinetsny.com/custom-kitchen-cabinets-brooklyn">Brooklyn kitchen cabinets</a> map. Nearby Brooklyn depth: <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-fort-greene-brooklyn">Fort Greene</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-prospect-heights-brooklyn">Prospect Heights</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-park-slope-brownstones">Park Slope brownstones</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-boerum-hill-brooklyn">Boerum Hill</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-brooklyn-heights">Brooklyn Heights</a>, and <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-williamsburg-brooklyn">Williamsburg</a>.</p>`,
  `<h2>Brownstones, Pratt-adjacent co-ops, and newer condos</h2>`,
];

export const clintonHillBrooklynPost: BlogArticle = {
  id: "static-custom-kitchen-cabinets-clinton-hill-brooklyn",
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
