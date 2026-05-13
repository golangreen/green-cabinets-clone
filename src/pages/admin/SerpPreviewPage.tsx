import { Helmet } from "react-helmet-async";
import { WOOD_SPECIES } from "@/data/woodSpecies";
import SerpPreview from "@/components/seo/SerpPreview";

const SITE = "https://greencabinetsny.com";

export default function SerpPreviewPage() {
  const species = WOOD_SPECIES.filter((w) => w.metaTitle || w.metaDescription);

  return (
    <>
      <Helmet>
        <title>SERP Preview — Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Google SERP Preview</h1>
        <p className="text-muted-foreground mb-8">
          Verify meta title + description length and readability for wood-species pages.
        </p>

        <div className="space-y-8">
          {species.map((w) => {
            const title =
              w.metaTitle ??
              `${w.name} Kitchen Cabinets — Custom Built in NYC | Green Cabinets`;
            const description =
              w.metaDescription ??
              `${w.shortDescription} Janka hardness ${w.jankaHardness}.`;
            const url = `${SITE}/wood-species/${w.slug}`;
            return (
              <section key={w.slug}>
                <h2 className="text-lg font-semibold mb-3">
                  {w.name}{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    /wood-species/{w.slug}
                  </span>
                </h2>
                <SerpPreview url={url} title={title} description={description} />
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
