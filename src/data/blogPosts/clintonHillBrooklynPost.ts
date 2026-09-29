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

// Article body will be appended here as HTML strings, in order.
const BODY: string[] = [];

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
