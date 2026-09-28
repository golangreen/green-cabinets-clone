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
const BODY: string[] = [];

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
