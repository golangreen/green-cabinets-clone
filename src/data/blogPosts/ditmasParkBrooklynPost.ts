import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "custom-kitchen-cabinets-ditmas-park-brooklyn",
  title: "Custom Kitchen Cabinets for Ditmas Park Brooklyn",
  meta_description:
    "Custom kitchen cabinets for Ditmas Park Brooklyn — Victorian houses and apartments by appointment. (718) 804-5488.",
  created_at: "2026-09-30T15:30:00-04:00",
  updated_at: "2026-09-30T15:30:00-04:00",
  tags: [
    "ditmas park kitchen cabinets",
    "brooklyn kitchen cabinets",
    "victorian house kitchen",
    "custom kitchen cabinets",
    "custom millwork",
    "by appointment",
  ],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/custom-kitchen-cabinets-ditmas-park-brooklyn",
};

// Article body is appended below as HTML strings, in order.
const BODY: string[] = [
  `<p>Ditmas Park kitchens sit on the porch-row Victorian grid of central Brooklyn — freestanding houses with wraparound porches along Ocean Avenue and Beverly Road, Cortelyou Road corridor storefronts that tip into apartment kitchens upstairs, and Newkirk Avenue blocks that mix landmarked houses with smaller walk-ups on the 11218 / 11226 edge. A Victorian parlor-floor kitchen often has tall plaster, a chimney breast that eats a bay, and a porch-side window that pins the sink run. An upstairs apartment or condo conversion fights a shorter galley, a radiator niche, and a stair that will not take an oversized stock panel. Stock packs leave fillers, a crooked fridge line, and uppers that never meet the wall you own.</p>`,
];

export const ditmasParkBrooklynPost: BlogArticle = {
  id: META.slug,
  external_id: null,
  slug: META.slug,
  title: META.title,
  content_html: BODY.join("\n"),
  excerpt: META.meta_description,
  meta_title: META.title,
  meta_description: META.meta_description,
  tags: META.tags,
  image_url: null,
  content_image_urls: META.content_image_urls,
  canonical_url: META.canonical_url,
  created_at: META.created_at,
  updated_at: META.updated_at,
};
