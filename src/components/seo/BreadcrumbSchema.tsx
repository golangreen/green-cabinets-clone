import { Helmet } from "react-helmet-async";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BASE_URL = "https://greencabinetsny.com";

export const buildBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.name,
    item: /^https?:\/\//i.test(item.url) ? item.url : `${BASE_URL}${item.url}`,
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
