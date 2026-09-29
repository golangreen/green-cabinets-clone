import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "custom-kitchen-cabinets-sunnyside-queens",
  title: "Custom Kitchen Cabinets for Sunnyside Queens",
  meta_description:
    "Custom kitchen cabinets for Sunnyside Queens — garden apartments, walk-ups, and condos by appointment. (718) 804-5488.",
  created_at: "2026-09-29T15:30:00-04:00",
  updated_at: "2026-09-29T15:30:00-04:00",
  tags: [
    "sunnyside kitchen cabinets",
    "queens kitchen cabinets",
    "garden apartment kitchen",
    "custom kitchen cabinets",
    "custom millwork",
    "by appointment",
  ],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/custom-kitchen-cabinets-sunnyside-queens",
};

// Article body is appended below as HTML strings, in order.
const BODY: string[] = [];

export const sunnysideQueensPost: BlogArticle = {
  id: "static-custom-kitchen-cabinets-sunnyside-queens",
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
