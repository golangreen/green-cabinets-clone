import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/Seo";
import { getBlogArticleBySlug, type BlogArticle } from "@/services/blogService";

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getBlogArticleBySlug(slug)
      .then((a) => {
        if (!a) setNotFound(true);
        else setArticle(a);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col">
      {article && (
        <Seo
          title={article.meta_title || article.title}
          description={article.meta_description || article.excerpt || undefined}
          path={`/blog/${article.slug}`}
          image={article.image_url || undefined}
        />
      )}
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 sm:py-20 md:py-24 max-w-3xl">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to Blog
        </Link>

        {loading && <p className="mt-8 text-muted-foreground">Loading…</p>}
        {notFound && (
          <div className="mt-8">
            <h1 className="text-3xl font-bold mb-2">Article not found</h1>
            <p className="text-muted-foreground">This post may have been removed.</p>
          </div>
        )}

        {article && (
          <article className="mt-6">
            <header className="mb-8">
              <time className="text-xs uppercase tracking-wider text-muted-foreground">
                {new Date(article.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">{article.title}</h1>
              {article.excerpt && (
                <p className="text-lg text-muted-foreground">{article.excerpt}</p>
              )}
              {article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full rounded-lg mb-8 aspect-video object-cover"
              />
            )}

            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
