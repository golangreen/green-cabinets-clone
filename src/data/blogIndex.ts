import type { BlogArticle } from "@/services/blogService";
import {
  STATIC_BLOG_POSTS as BASE_POSTS,
  getStaticBlogPost as getBaseStaticBlogPost,
} from "@/data/staticBlogPosts";
import { williamsburgKitchenPost } from "@/data/blogPosts/williamsburgKitchenPost";

/** Prepend newest SEO posts here without rewriting the large staticBlogPosts bundle. */
export const STATIC_BLOG_POSTS: BlogArticle[] = [
  williamsburgKitchenPost,
  ...BASE_POSTS.filter((p) => p.slug !== williamsburgKitchenPost.slug),
];

export const STATIC_BLOG_SLUGS = new Set(STATIC_BLOG_POSTS.map((p) => p.slug));

export function getStaticBlogPost(slug?: string): BlogArticle | null {
  if (!slug) return null;
  if (slug === williamsburgKitchenPost.slug) return williamsburgKitchenPost;
  return getBaseStaticBlogPost(slug);
}
