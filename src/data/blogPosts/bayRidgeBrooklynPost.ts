import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "custom-kitchen-cabinets-bay-ridge-brooklyn",
  title: "Custom Kitchen Cabinets for Bay Ridge Brooklyn",
  meta_description:
    "Custom kitchen cabinets for Bay Ridge Brooklyn — pre-war apartments and houses by appointment. (718) 804-5488.",
  created_at: "2026-09-30T09:30:00-04:00",
  updated_at: "2026-09-30T09:30:00-04:00",
  tags: [
    "bay ridge kitchen cabinets",
    "brooklyn kitchen cabinets",
    "pre-war apartment kitchen",
    "custom kitchen cabinets",
    "custom millwork",
    "by appointment",
  ],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/custom-kitchen-cabinets-bay-ridge-brooklyn",
};

// Article body is appended below as HTML strings, in order.
const BODY: string[] = [];

export const bayRidgeBrooklynPost: BlogArticle = {
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
