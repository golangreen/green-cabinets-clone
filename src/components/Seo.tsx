import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

export default function Seo({ title, description, path, image, noindex }: Props) {
  const url = path ? `https://greencabinetsny.com${path}` : undefined;
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
    </Helmet>
  );
}
