import { supabase } from "@/integrations/supabase/client";

export interface BlogArticle {
  id: string;
  external_id: string | null;
  slug: string;
  title: string;
  content_html: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[];
  image_url: string | null;
  content_image_urls: string[];
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function listBlogArticles(): Promise<BlogArticle[]> {
  const { data, error } = await supabase
    .from("blog_articles" as any)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BlogArticle[];
}

export async function getBlogArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const { data, error } = await supabase
    .from("blog_articles" as any)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as BlogArticle) ?? null;
}
