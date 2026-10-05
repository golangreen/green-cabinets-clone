import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "pull-out-trash-recycling-cabinets-nyc",
  title: "Pull-Out Trash and Recycling Cabinets for NYC Kitchens",
  meta_description:
    "Pull-out trash and recycling cabinets for NYC kitchens — custom millwork by appointment in Brooklyn, Manhattan, Queens. (718) 804-5488.",
  created_at: "2026-10-05T09:30:00-04:00",
  updated_at: "2026-10-05T09:30:00-04:00",
  tags: ["pull-out trash cabinet", "recycling cabinet", "waste pull-out nyc", "custom millwork", "by appointment"],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/pull-out-trash-recycling-cabinets-nyc",
};

const BODY = [
  "<p>In a Brooklyn brownstone or Manhattan co-op kitchen, the trash can is often the ugliest thing in the room. A plastic bin sits in the toe-kick gap. Bags lean against the fridge. Recycling stacks on the counter because the under-sink cabinet already holds the scrubber and the compressor. Pull-out trash and recycling cabinets fix that by building the bins into the run — soft-close, measured, and out of sight when the door is shut.</p>",
];

export const pullOutTrashRecyclingPost: BlogArticle = {
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
