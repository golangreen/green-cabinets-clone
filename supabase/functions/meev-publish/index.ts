import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const TOKEN = Deno.env.get("MEEV_PUBLISH_TOKEN") ?? "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface Article {
  id?: string;
  title?: string;
  slug?: string;
  content_html?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  image_url?: string;
  content_image_urls?: string[];
  canonical_url?: string;
  created_at?: string;
}

function toRow(a: Article) {
  const slug = (a.slug || a.id || "").toString().trim();
  return {
    external_id: a.id ?? slug,
    slug,
    title: a.title ?? "Untitled",
    content_html: a.content_html ?? "",
    excerpt: a.excerpt ?? null,
    meta_title: a.meta_title ?? a.title ?? null,
    meta_description: a.meta_description ?? null,
    tags: Array.isArray(a.tags) ? a.tags : [],
    image_url: a.image_url ?? null,
    content_image_urls: Array.isArray(a.content_image_urls) ? a.content_image_urls : [],
    canonical_url: a.canonical_url ?? null,
    created_at: a.created_at ?? new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!TOKEN || auth !== `Bearer ${TOKEN}`) {
    return json(401, { error: "Unauthorized" });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const eventType = body?.event_type;
  const data = body?.data ?? {};

  try {
    if (eventType === "test_connection") {
      return json(200, { success: true });
    }

    if (eventType === "publish_articles") {
      const articles: Article[] = Array.isArray(data.articles) ? data.articles : [];
      if (articles.length === 0) return json(400, { error: "No articles provided" });

      const rows = articles.map(toRow).filter((r) => r.slug);
      const { data: saved, error } = await supabase
        .from("blog_articles")
        .upsert(rows, { onConflict: "slug" })
        .select("id, external_id, slug");
      if (error) throw error;

      const first = saved?.[0];
      return json(200, {
        success: true,
        externalId: first?.external_id ?? first?.id ?? null,
        saved,
      });
    }

    if (eventType === "update_article") {
      const article: Article = data.article ?? (Array.isArray(data.articles) ? data.articles[0] : data);
      const row = toRow(article);
      if (!row.slug) return json(400, { error: "Missing slug/id" });
      const { error } = await supabase
        .from("blog_articles")
        .upsert(row, { onConflict: "slug" });
      if (error) throw error;
      return json(200, { success: true });
    }

    if (eventType === "delete_article") {
      const article: Article = data.article ?? (Array.isArray(data.articles) ? data.articles[0] : data);
      const slug = (article.slug || article.id || "").toString().trim();
      const externalId = article.id?.toString().trim();
      if (!slug && !externalId) return json(400, { error: "Missing slug/id" });
      const query = supabase.from("blog_articles").delete();
      const { error } = slug
        ? await query.eq("slug", slug)
        : await query.eq("external_id", externalId!);
      if (error) throw error;
      return json(200, { success: true });
    }

    return json(400, { error: `Unknown event_type: ${eventType}` });
  } catch (err) {
    console.error("meev-publish error", err);
    return json(500, { error: "Internal error" });
  }
});
