import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/Seo";
import { listBlogArticles, type BlogArticle } from "@/services/blogService";

export default function Blog() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBlogArticles()
      .then(setArticles)
      .catch((e) => setError(e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Blog | Green Cabinets NY"
        description="Insights, guides, and updates from Green Cabinets NY on custom kitchens, vanities, and millwork."
        path="/blog"
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 sm:py-20 md:py-28">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Design ideas, project stories, and craft notes from our Brooklyn shop.
          </p>
        </header>

        {loading && <p className="text-center text-muted-foreground">Loading…</p>}
        {error && <p className="text-center text-destructive">{error}</p>}
        {!loading && !error && articles.length === 0 && (
          <p className="text-center text-muted-foreground">No articles yet — check back soon.</p>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/blog/${a.slug}`}
              className="group block rounded-lg overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow"
            >
              {a.image_url && (
                <img
                  src={a.image_url}
                  alt={a.title}
                  loading="lazy"
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="p-5">
                <time className="text-xs uppercase tracking-wider text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <h2 className="text-xl font-semibold mt-2 mb-2 group-hover:text-primary transition-colors">
                  {a.title}
                </h2>
                {a.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
