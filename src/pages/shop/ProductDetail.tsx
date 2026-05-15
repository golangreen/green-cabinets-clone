import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { shopifyService } from "@/services";
import type { ShopifyProduct } from "@/types";
import { VanityConfigurator } from "@/components/VanityConfigurator";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (handle) {
          const foundProduct = await shopifyService.getProductByHandle(handle);
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const url = `https://greencabinetsny.com/product/${handle}`;
  const desc = product.node.description?.substring(0, 160) || `Shop ${product.node.title} from Green Cabinets.`;
  const image = product.node.images?.edges?.[0]?.node?.url;
  const price = product.node.priceRange?.minVariantPrice;
  const anyAvailable = product.node.variants?.edges?.some((v) => v.node.availableForSale);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.node.title,
    description: desc,
    ...(image ? { image: [image] } : {}),
    sku: product.node.handle,
    brand: { "@type": "Brand", name: "Green Cabinets NY" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: price?.currencyCode || "USD",
      price: price?.amount || "0",
      availability: anyAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{product.node.title} | Green Cabinets Shop</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={`${product.node.title} | Green Cabinets`} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={url} />
        {image && <meta property="og:image" content={image} />}
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: product.node.title, url: `/product/${handle}` },
        ]}
      />
      <Header />
      <main className="flex-1 pt-[96px] sm:pt-[128px] md:pt-[160px] pb-6 sm:pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button variant="ghost" className="mb-4 sm:mb-6 touch-manipulation">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
          <VanityConfigurator product={product} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
