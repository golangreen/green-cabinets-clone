CREATE TABLE public.blog_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  content_image_urls TEXT[] NOT NULL DEFAULT '{}',
  canonical_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_articles TO anon, authenticated;
GRANT ALL ON public.blog_articles TO service_role;

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog articles are public"
  ON public.blog_articles FOR SELECT
  USING (true);

CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blog_articles_created_at ON public.blog_articles (created_at DESC);