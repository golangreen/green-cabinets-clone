import type { BlogArticle } from "@/services/blogService";

/**
 * Build-time only: the pre-renderer (scripts/prerender.mjs) fetches the
 * database blog articles once and registers them here so BlogArticle can
 * render their full text into static HTML. The pre-renderer also embeds
 * that article as JSON (<script id="prerendered-article">) so the browser
 * starts from the same data and hydrates without a re-render; BlogArticle
 * still refreshes it from Supabase as before.
 */
const articles = new Map<string, BlogArticle>();

export function setPrerenderedArticles(list: BlogArticle[]) {
  articles.clear();
  for (const a of list) if (a?.slug) articles.set(a.slug, a);
}

export function getPrerenderedArticle(slug?: string): BlogArticle | null {
  if (!slug) return null;
  const known = articles.get(slug);
  if (known) return known;
  if (typeof document === "undefined") return null;
  const el = document.getElementById("prerendered-article");
  if (!el?.textContent) return null;
  try {
    const a = JSON.parse(el.textContent) as BlogArticle;
    return a?.slug === slug ? a : null;
  } catch {
    return null;
  }
}

/** Fields the blog index cards need. */
export type BlogCard = Pick<BlogArticle, "id" | "slug" | "title" | "excerpt" | "image_url" | "created_at">;

export const toBlogCard = (a: BlogArticle): BlogCard => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  image_url: a.image_url,
  created_at: a.created_at,
});

/**
 * Database posts for the blog index. At build time they come from
 * setPrerenderedArticles; in the browser from <script id="prerendered-blog-index">,
 * so /blog and /blog/page/N hydrate with every post already listed.
 */
export function getPrerenderedBlogCards(): BlogCard[] {
  if (articles.size) return [...articles.values()].map(toBlogCard);
  if (typeof document === "undefined") return [];
  const el = document.getElementById("prerendered-blog-index");
  if (!el?.textContent) return [];
  try {
    const list = JSON.parse(el.textContent);
    return Array.isArray(list) ? (list as BlogCard[]) : [];
  } catch {
    return [];
  }
}
