import { Helmet } from "react-helmet-async";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BASE_URL = "https://greencabinetsny.com";

const resolveUrl = (url: string): string => {
  if (/^https?:\/\//i.test(url)) return url;
  try {
    // Use URL resolution so './x' and '../x' resolve correctly against the base.
    return new URL(url, `${BASE_URL}/`).href;
  } catch {
    return `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  }
};

export const buildBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.name,
    item: resolveUrl(item.url),
  })),
});

const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify(buildBreadcrumbSchema(items))}
    </script>
  </Helmet>
);

export default BreadcrumbSchema;
